import React, { useState, useEffect } from "react";
import "./index.css"; // Asegúrate de tener este archivo o eliminar esta línea si no lo necesitas

const defaultPlayer = { name: "" };
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

  const handleSetPlayer = (index, value) => {
    const updated = [...players];
    updated[index] = { ...updated[index], name: value };
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

  // Función para convertir números a romanos
  const toRoman = (num) => {
    const romanNumerals = [
      { value: 1, symbol: "I" },
      { value: 4, symbol: "IV" },
      { value: 5, symbol: "V" },
      { value: 9, symbol: "IX" },
      { value: 10, symbol: "X" },
      { value: 40, symbol: "XL" },
      { value: 50, symbol: "L" },
      { value: 90, symbol: "XC" },
      { value: 100, symbol: "C" },
      { value: 400, symbol: "CD" },
      { value: 500, symbol: "D" },
      { value: 900, symbol: "CM" },
      { value: 1000, symbol: "M" }
    ];
    let result = '';
    romanNumerals.reverse().forEach(({ value, symbol }) => {
      while (num >= value) {
        result += symbol;
        num -= value;
      }
    });
    return result;
  };

  return (
    <div className="app-container" style={{ backgroundColor: '#e6f5e6', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1 className="app-title" style={{ color: '#2d862d' }}>KIWIS APP</h1>

      <div className="controls" style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <button onClick={saveTemplate}>Guardar plantilla</button>
          <button onClick={loadTemplate}>Cargar plantilla</button>
          <button onClick={exportJSON}>Exportar JSON</button>
        </div>
        <div>
          <span>Set actual: </span>
          <input
            type="number"
            value={setNumber}
            onChange={(e) => setSetNumber(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="team-section" style={{ marginBottom: '20px' }}>
        <h2>Equipo (14 jugadoras)</h2>
        {players.map((p, i) => (
          <div key={i} className="player-input" style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Nombre"
              value={p.name}
              onChange={(e) => handleSetPlayer(i, e.target.value)}
              style={{ marginRight: '5px' }}
            />
            <button onClick={() => handleSelectStarter(i)} disabled={starters.includes(i)}>
              Titular
            </button>
          </div>
        ))}
      </div>

      <div className="court-section" style={{ marginBottom: '20px' }}>
        <h2>Formación en cancha</h2>
        <div className="court-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
          {rotation.map((rIndex, i) => (
            <div key={i} className="court-box" style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px', backgroundColor: '#f2f2f2' }}>
              <div className="zone-label" style={{ fontWeight: 'bold' }}>{toRoman(i + 1)}</div>
              <div>{players[starters[rIndex]]?.name || "-"}</div>
            </div>
          ))}
        </div>
        <h3>Suplentes</h3>
        <ul>
          {players.map((p, i) => !starters.includes(i) && <li key={i}>{p.name}</li>)}
        </ul>
      </div>

      <div className="rotation-section" style={{ marginBottom: '20px' }}>
        <h2>Simulación de Rotaciones</h2>
        <button onClick={rotate}>➡ Siguiente rotación</button>
        <button onClick={rotateBack}>⬅ Rotación anterior</button>
        <button onClick={() => handlePoint("win")}>✔ Punto ganado</button>
        <button onClick={() => handlePoint("lose")}>❌ Punto perdido</button>
        <div style={{ marginTop: '10px' }}>Marcador: Ganados: {score.won} / Perdidos: {score.lost}</div>
      </div>

      <div className="history-section">
        <h2>Historial de puntos</h2>
        <ul>
          {history.map((h, i) => (
            <li key={i}>
              Rotación: {h.rotation.join("-")} | {h.result === "win" ? "✔" : "❌"} {h.action} {h.player && `| Jugadora: ${h.player}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

