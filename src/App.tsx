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
  const [rival, setRival] = useState("");
  const [torneo, setTorneo] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [matchList, setMatchList] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("kiwis_players");
    if (saved) setPlayers(JSON.parse(saved));

    const savedMatch = localStorage.getItem("kiwis_match");
    if (savedMatch) {
      const { players, starters, history, score, setNumber, rotation, rival, torneo, comentarios } = JSON.parse(savedMatch);
      setPlayers(players);
      setStarters(starters);
      setHistory(history);
      setScore(score);
      setSetNumber(setNumber);
      setRotation(rotation);
      setRival(rival || "");
      setTorneo(torneo || "");
      setComentarios(comentarios || "");
    }

    const savedMatches = localStorage.getItem("kiwis_all_matches");
    if (savedMatches) setMatchList(JSON.parse(savedMatches));
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
    const matchData = { players, starters, history, score, setNumber, rival, torneo, comentarios };
    const blob = new Blob([JSON.stringify(matchData)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `kiwis_partido.json`;
    link.click();
  };

  const saveMatch = () => {
    const matchData = { players, starters, rotation, score, history, setNumber, rival, torneo, comentarios };
    localStorage.setItem("kiwis_match", JSON.stringify(matchData));

    const prev = JSON.parse(localStorage.getItem("kiwis_all_matches") || "[]");
    const newMatch = { ...matchData, date: new Date().toISOString() };
    const updated = [...prev, newMatch];
    localStorage.setItem("kiwis_all_matches", JSON.stringify(updated));
    setMatchList(updated);
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
    setRival("");
    setTorneo("");
    setComentarios("");
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
        <button onClick={resetMatch}>Finalizar partido</button>
        <span style={{ marginLeft: '10px' }}>Set: </span>
        <input type="number" value={setNumber} onChange={(e) => setSetNumber(Number(e.target.value))} />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>Rival: <input value={rival} onChange={e => setRival(e.target.value)} /></label>
        <label style={{ marginLeft: '10px' }}>Torneo: <input value={torneo} onChange={e => setTorneo(e.target.value)} /></label>
        <label style={{ display: 'block', marginTop: '10px' }}>Comentarios: <textarea value={comentarios} onChange={e => setComentarios(e.target.value)} rows={2} style={{ width: '100%' }} /></label>
      </div>

      {matchList.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>📋 Partidos guardados</h3>
          <ul>
            {matchList.map((m, idx) => (
              <li key={idx}>
                {new Date(m.date).toLocaleString()} - {m.rival || "Sin rival"} ({m.torneo || "Sin torneo"})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* resto sin cambios */}
    </div>
  );
}


