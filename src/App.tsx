import React, { useState, useEffect } from "react";

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
  "SAQUE RIVAL"
];

export default function App() {
  const [players, setPlayers] = useState(initialPlayers);
  const [starters, setStarters] = useState([]);
  const [rotation, setRotation] = useState([0, 5, 4, 3, 2, 1]);
  const [score, setScore] = useState({ won: 0, lost: 0 });
  const [history, setHistory] = useState([]);
  const [setNumber, setSetNumber] = useState(1);
  const [stats, setStats] = useState({});

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

  const updateStats = (player, type) => {
    if (!player) return;
    setStats(prev => {
      const p = prev[player] || { win: 0, lose: 0 };
      return {
        ...prev,
        [player]: {
          win: type === "win" ? p.win + 1 : p.win,
          lose: type === "lose" ? p.lose + 1 : p.lose
        }
      };
    });
  };

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
    setStats({});
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
    updateStats(player, result);
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
      <h1 style={{ color: '#2d862d' }}>🥝 KIWIS APP</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={saveTemplate}>Guardar plantilla</button>
        <button onClick={loadTemplate}>Cargar plantilla</button>
        <button onClick={exportJSON}>Exportar JSON</button>
        <button onClick={saveMatch}>Guardar partido</button>
        <button onClick={resetMatch}>Resetear partido</button>
        <span style={{ marginLeft: '10px' }}>Set: </span>
        <input type="number" value={setNumber} onChange={(e) => setSetNumber(Number(e.target.value))} />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Jugadores</h3>
        <div>
          {players.map((player, index) => (
            <div key={index}>
              <input 
                type="text" 
                value={player.name} 
                onChange={(e) => handleSetPlayer(index, e.target.value)} 
                placeholder={`Jugador ${index + 1}`} 
              />
              <button onClick={() => handleToggleStarter(index)}>
                {starters.includes(index) ? "Quitar titular" : "Asignar titular"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3>Acciones</h3>
        <div>
          {actionsWin.map((action, index) => (
            <button key={index} onClick={() => handlePoint("win", action)}>
              {action}
            </button>
          ))}
        </div>
        <div>
          {actionsLose.map((action, index) => (
            <button key={index} onClick={() => handlePoint("lose", action)}>
              {action}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Estadísticas</h3>
        <div>
          {Object.entries(stats).map(([name, { win, lose }]) => (
            <div key={name}>
              <p>{name}: +{win} / -{lose}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

