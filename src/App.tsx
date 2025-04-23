import React, { useState, useEffect } from "react";

const defaultPlayer = { name: "" };
const initialPlayers = Array(14).fill(defaultPlayer);

const actionsWin = ["ACE", "ATAQUE", "BLOQUEO", "TOQUE", "ERROR RIVAL"];
const actionsLose = [
  "ERROR DE SAQUE",
  "ERROR DE ATAQUE",
  "ERROR NO FORZADO",
  "ERROR DE RECEPCIÓN",
  "BLOQUEO RIVAL",
  "ATAQUE RIVAL",
  "SAQUE RIVAL"
];

export default function App() {
  const [players, setPlayers] = useState(initialPlayers);
  const [starters, setStarters] = useState([]);
  const [rotation, setRotation] = useState([0, 5, 4, 3, 2, 1]);
  const [score, setScore] = useState({ won: 0, lost: 0 });
  const [history, setHistory] = useState([]);
  const [setNumber, setSetNumber] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem("kiwis_players");
    if (saved) setPlayers(JSON.parse(saved));

    const savedMatch = localStorage.getItem("kiwis_match");
    if (savedMatch) {
      const { players, starters, history, score, setNumber, rotation } = JSON.parse(savedMatch);
      setPlayers(players);
      setStarters(starters);
      setHistory(history);
      setScore(score);
      setSetNumber(setNumber);
      setRotation(rotation);
    }
  }, []);

  const saveTemplate = () => localStorage.setItem("kiwis_players", JSON.stringify(players));
  const loadTemplate = () => {
    const saved = localStorage.getItem("kiwis_players");
    if (saved) setPlayers(JSON.parse(saved));
  };

  const exportJSON = () => {
    const data = JSON.stringify({ players, starters, history, score, setNumber });
    const blob = new Blob([data], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `kiwis_set${setNumber}.json`;
    link.click();
  };

  const saveMatch = () => {
    const data = { players, starters, rotation, score, history, setNumber };
    localStorage.setItem("kiwis_match", JSON.stringify(data));
    alert("Partido guardado");
  };

  const resetMatch = () => {
    setPlayers(initialPlayers);
    setStarters([]);
    setRotation([0, 5, 4, 3, 2, 1]);
    setScore({ won: 0, lost: 0 });
    setHistory([]);
    setSetNumber(1);
    localStorage.removeItem("kiwis_match");
  };

  const handleSetPlayer = (index, value) => {
    const updated = [...players];
    updated[index] = { ...updated[index], name: value };
    setPlayers(updated);
  };

  const handleToggleStarter = (index) => {
    setStarters(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index].slice(0, 6));
  };

  const rotate = () => setRotation((prev) => [...prev.slice(1), prev[0]]);
  const rotateBack = () => setRotation((prev) => [prev[5], ...prev.slice(0, 5)]);

  const handlePoint = (result, action, player = "") => {
    const newScore = {
      won: score.won + (result === "win" ? 1 : 0),
      lost: score.lost + (result === "lose" ? 1 : 0),
    };
    setScore(newScore);
    setHistory([...history, { result, action, player, score: newScore }]);
  };

  const handleSubstitution = (inIndex, outIndex) => {
    const newStarters = [...starters];
    const idx = newStarters.indexOf(outIndex);
    newStarters[idx] = inIndex;
    setStarters(newStarters);
    const inName = players[inIndex]?.name || "";
    const outName = players[outIndex]?.name || "";
    setHistory([...history, { result: "cambio", action: `CAMBIO ${inName} x ${outName}`, player: "" }]);
  };

  const courtOrder = [1, 2, 3, 0, 5, 4];
  const allSelectable = [...starters, ...players.map((_, i) => i).filter(i => !starters.includes(i))];

  return (
    <div style={{ backgroundColor: '#e6f5e6', fontFamily: 'Arial', padding: '20px' }}>
      <h1 style={{ color: '#2d862d' }}>KIWIS APP</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={saveTemplate}>Guardar plantilla</button>
        <button onClick={loadTemplate}>Cargar plantilla</button>
        <button onClick={exportJSON}>Exportar JSON</button>
        <button onClick={saveMatch}>Guardar partido</button>
        <button onClick={resetMatch}>Resetear partido</button>
        <span style={{ marginLeft: '10px' }}>Set: </span>
        <input type="number" value={setNumber} onChange={(e) => setSetNumber(Number(e.target.value))} />
      </div>

      <div>
        <h2>Jugadoras (14)</h2>
        {players.map((p, i) => (
          <div key={i}>
            <input
              type="text"
              placeholder="Nombre"
              value={p.name}
              onChange={(e) => handleSetPlayer(i, e.target.value)}
              style={{ marginRight: '5px' }}
            />
            <button onClick={() => handleToggleStarter(i)}>
              {starters.includes(i) ? "Quitar Titular" : "Titular"}
            </button>
          </div>
        ))}
      </div>

      <h2>Cancha</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '300px', margin: '20px auto' }}>
        {["IV", "III", "II", "V", "VI", "I"].map((zone, i) => (
          <div key={i} style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>
            <strong>{zone}</strong><br />
            {players[starters[rotation[courtOrder[i]]]] ? players[starters[rotation[courtOrder[i]]]].name : "-"}
          </div>
        ))}
      </div>

      <h2>Rotación</h2>
      <button onClick={rotate}>➡ Siguiente</button>
      <button onClick={rotateBack}>⬅ Anterior</button>

      <h2>Cambio de Jugadoras</h2>
      {starters.map((starter, i) => (
        <div key={i} style={{ marginBottom: '10px' }}>
          <span>{players[starter].name} (Titular) </span>
          <select
            onChange={(e) => handleSubstitution(parseInt(e.target.value), starter)}
            value=""
          >
            <option value="">Seleccionar suplente</option>
            {players
              .map((_, idx) => !starters.includes(idx) && <option key={idx} value={idx}>{players[idx].name}</option>)}
          </select>
        </div>
      ))}

      <h2>Punto Ganado</h2>
      {actionsWin.map((action) => (
        <button
          key={action}
          onClick={() => {
            if (action === "ERROR RIVAL") handlePoint("win", action);
          }}
          style={{ margin: '5px', backgroundColor: '#c6f6d5' }}
        >
          {action !== "ERROR RIVAL" ? (
            <select onChange={(e) => handlePoint("win", action, players[e.target.value]?.name)}>
              <option value="">--{action}--</option>
              {allSelectable.map(i => (
                <option key={i} value={i}>{players[i].name} ({i + 1})</option>
              ))}
            </select>
          ) : action}
        </button>
      ))}

      <h2>Punto Perdido</h2>
      {actionsLose.map((action) => (
        <button
          key={action}
          onClick={() => {
            if (action.includes("RIVAL") || action.includes("ERROR")) handlePoint("lose", action);
          }}
          style={{ margin: '5px', backgroundColor: '#fed7d7' }}
        >
          {!(action.includes("RIVAL") || action.includes("ERROR")) ? (
            <select onChange={(e) => handlePoint("lose", action, players[e.target.value]?.name)}>
              <option value="">--{action}--</option>
              {allSelectable.map(i => (
                <option key={i} value={i}>{players[i].name} ({i + 1})</option>
              ))}
            </select>
          ) : action}
        </button>
      ))}

      <h2>Historial</h2>
      <ul>
        {history.map((h, i) => (
          h.result !== "cambio" ? (
            <li key={i}>{h.score.won}-{h.score.lost} | {h.action}{h.player ? ` - ${h.player}` : ""}</li>
          ) : (
            <li key={i}>{h.action}</li>
          )
        ))}
      </ul>
    </div>
  );
}
