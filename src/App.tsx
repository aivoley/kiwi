import React, { useState, useEffect } from "react";
import "./index.css"; // Asegurate de tener este archivo o eliminar esta línea si no lo necesitas

const defaultPlayer = { name: "", position: "" };
const initialPlayers = Array(14).fill(defaultPlayer);

const actionsWin = ["ACE", "ATAQUE", "BLOQUEO", "TOQUE", "ERROR RIVAL"];
const actionsLose = [
  "ERROR DE SAQUE",
  "ERROR DE ATAQUE",
  "BLOQUEO RIVAL",
  "ERROR NO FORZADO",
  "ERROR DE RECEPCIÓN",
  "ATAQUE RIVAL",
  "SAQUE RIVAL",
];

export default function App() {
  const [players, setPlayers] = useState(initialPlayers);
  const [starters, setStarters] = useState([]);
  const [rotation, setRotation] = useState([0, 5, 4, 3, 2, 1]); // 1-6-5-4-3-2-1
  const [score, setScore] = useState({ won: 0, lost: 0 });
  const [history, setHistory] = useState([]);
  const [setNumber, setSetNumber] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem("kiwis_players");
    if (saved) setPlayers(JSON.parse(saved));
  }, []);

  const saveTemplate = () => localStorage.setItem("kiwis_players", JSON.stringify(players));
  const loadTemplate = () => {
    const saved = localStorage.getItem("kiwis_players");
    if (saved) setPlayers(JSON.parse(saved));
  };

  const exportJSON = () => {
    const data = JSON.stringify({ players, starters, history, score });
    const blob = new Blob([data], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `kiwis_set${setNumber}.json`;
    link.click();
  };

  const handleSetPlayer = (index, field, value) => {
    const updated = [...players];
    updated[index] = { ...updated[index], [field]: value };
    setPlayers(updated);
  };

  const handleSelectStarter = (index) => {
    if (!starters.includes(index) && starters.length < 6) {
      setStarters([...starters, index]);
    }
  };

  const rotate = () => setRotation((prev) => [prev[5], ...prev.slice(0, 5)]);
  const rotateBack = () => setRotation((prev) => [...prev.slice(1), prev[0]]);

  const handlePoint = (result) => {
    const actionList = result === "win" ? actionsWin : actionsLose;
    const action = prompt(`Seleccioná acción (${actionList.join(", ")})`);
    const player = prompt("Nombre de la jugadora (o dejar vacío si no aplica)");
    setHistory([...history, { rotation: [...rotation], result, action, player }]);
    setScore((prev) => ({
      won: prev.won + (result === "win" ? 1 : 0),
      lost: prev.lost + (result === "lose" ? 1 : 0),
    }));
  };

  return (
    <div className="app-container" style={{ backgroundColor: '#e6f5e6', fontFamily: 'Arial, sans-serif', padding: '10px', maxWidth: '900px', margin: 'auto' }}>
      <h1 style={{ color: '#2d862d', textAlign: 'center', fontSize: '2rem' }}>KIWIS APP</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '20px', gap: '10px' }}>
        <div>
          <button onClick={saveTemplate}>Guardar plantilla</button>{" "}
          <button onClick={loadTemplate}>Cargar plantilla</button>{" "}
          <button onClick={exportJSON}>Exportar JSON</button>
        </div>
        <div>
          <span>Set actual: </span>
          <input
            type="number"
            value={setNumber}
            onChange={(e) => setSetNumber(Number(e.target.value))}
            style={{ width: '60px' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Equipo (14 jugadoras)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
          {players.map((p, i) => (
            <div key={i} style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
              <input
                type="text"
                placeholder="Nombre"
                value={p.name}
                onChange={(e) => handleSetPlayer(i, "name", e.target.value)}
                style={{ width: '100%', marginBottom: '5px' }}
              />
              <input
                type="text"
                placeholder="Posición"
                value={p.position}
                onChange={(e) => handleSetPlayer(i, "position", e.target.value)}
                style={{ width: '100%', marginBottom: '5px' }}
              />
              <button onClick={() => handleSelectStarter(i)} disabled={starters.includes(i)} style={{ width: '100%' }}>
                Titular
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Formación en cancha</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {rotation.map((rIndex, i) => (
            <div key={i} style={{ border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f2f2f2', padding: '10px', textAlign: 'center' }}>
              <div><strong>Zona {i + 1}</strong></div>
              <div>{players[starters[rIndex]]?.name || "-"}</div>
              <div>{players[starters[rIndex]]?.position || ""}</div>
            </div>
          ))}
        </div>
        <h3>Suplentes</h3>
        <ul>
          {players.map((p, i) => !starters.includes(i) && <li key={i}>{p.name}</li>)}
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Simulación de Rotaciones</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
          <button onClick={rotate}>➡ Siguiente rotación</button>
          <button onClick={rotateBack}>⬅ Rotación anterior</button>
          <button onClick={() => handlePoint("win")}>✔ Punto ganado</button>
          <button onClick={() => handlePoint("lose")}>❌ Punto perdido</button>
        </div>
        <div>Marcador: Ganados: {score.won} / Perdidos: {score.lost}</div>
      </div>

      <div>
        <h2>Historial de puntos</h2>
        <ul style={{ maxHeight: '300px', overflowY: 'auto', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
          {history.map((h, i) => (
            <li key={i} style={{ marginBottom: '5px' }}>
              Rotación: {h.rotation.join("-")} | {h.result === "win" ? "✔" : "❌"} {h.action} {h.player && `| Jugadora: ${h.player}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
