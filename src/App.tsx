import React, { useState, useEffect } from "react";

const accionesGanadas = ["ACE", "ATAQUE", "BLOQUEO", "TOQUE", "ERROR RIVAL"];
const accionesPerdidas = [
  "ERROR DE SAQUE",
  "ERROR DE ATAQUE",
  "BLOQUEO RIVAL",
  "ERROR NO FORZADO",
  "ERROR DE RECEPCIÓN",
  "ATAQUE RIVAL",
  "BLOQUEO RIVAL",
  "SAQUE RIVAL"
];

export default function App() {
  const [players, setPlayers] = useState(() => JSON.parse(localStorage.getItem("plantilla")) || Array(14).fill({ name: "", position: "" }));
  const [starters, setStarters] = useState([]);
  const [rotation, setRotation] = useState([0, 1, 2, 3, 4, 5]);
  const [score, setScore] = useState({ won: 0, lost: 0 });
  const [history, setHistory] = useState([]);
  const [setNumber, setSetNumber] = useState(1);
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");

  useEffect(() => {
    localStorage.setItem("plantilla", JSON.stringify(players));
  }, [players]);

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
    if (!selectedAction) return alert("Seleccioná una acción");

    const newEvent = {
      rotation: [...rotation],
      result,
      action: selectedAction,
      player: selectedPlayer || null,
    };

    setHistory((prev) => [...prev, newEvent]);
    setScore((prev) => ({
      won: prev.won + (result === "win" ? 1 : 0),
      lost: prev.lost + (result === "lose" ? 1 : 0),
    }));

    setSelectedAction("");
    setSelectedPlayer("");
  };

  const saveSet = () => {
    const data = {
      set: setNumber,
      starters,
      rotation,
      score,
      history,
    };
    localStorage.setItem(`set_${setNumber}`, JSON.stringify(data));
    alert("Set guardado en localStorage");
  };

  const exportJSON = () => {
    const partido = {
      plantilla: players,
      sets: [...Array(setNumber)].map((_, i) => JSON.parse(localStorage.getItem(`set_${i + 1}`) || "{}")),
    };
    const blob = new Blob([JSON.stringify(partido, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "partido_kiwis.json";
    link.click();
  };

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">KIWIS APP</h1>
      <div className="flex justify-between items-center">
        <span className="text-xl">Set actual: {setNumber}</span>
        <button onClick={() => setSetNumber(setNumber + 1)} className="bg-blue-500 text-white px-3 py-1 rounded">+ Set</button>
        <button onClick={saveSet} className="bg-green-600 text-white px-3 py-1 rounded">Guardar Set</button>
        <button onClick={exportJSON} className="bg-purple-600 text-white px-3 py-1 rounded">Exportar JSON</button>
      </div>

      <hr className="my-4" />

      <h2 className="text-xl font-semibold">Plantilla (14 jugadoras)</h2>
      {players.map((p, i) => (
        <div key={i} className="flex gap-2 mb-1">
          <input type="text" value={p.name} onChange={(e) => handleSetPlayer(i, "name", e.target.value)} placeholder="Nombre" className="border p-1 w-1/3" />
          <input type="text" value={p.position} onChange={(e) => handleSetPlayer(i, "position", e.target.value)} placeholder="Posición" className="border p-1 w-1/3" />
          <button onClick={() => handleSelectStarter(i)} disabled={starters.includes(i)} className="bg-yellow-500 text-white px-2 rounded">Titular</button>
        </div>
      ))}

      <h2 className="text-xl font-semibold mt-4">Formación en cancha</h2>
      <div className="grid grid-cols-3 gap-2 bg-green-100 p-4 rounded">
        {rotation.map((rIndex, i) => (
          <div key={i} className="bg-white p-2 rounded shadow text-center">
            <div className="font-bold">Zona {i + 1}</div>
            <div>
              {players[starters[rIndex]]?.name || "-"}
              <div className="text-xs">{players[starters[rIndex]]?.position}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mt-4">Suplentes</h2>
      <ul>
        {players.map((p, i) => !starters.includes(i) && <li key={i}>{p.name}</li>)}
      </ul>

      <h2 className="text-xl font-semibold mt-6">Simulación</h2>
      <div className="flex gap-4 my-2">
        <button onClick={rotate} className="bg-blue-500 text-white px-3 py-1 rounded">➡ Siguiente rotación</button>
        <button onClick={rotateBack} className="bg-blue-500 text-white px-3 py-1 rounded">⬅ Rotación anterior</button>
      </div>

      <div className="my-2">
        <label className="block">Acción:</label>
        <select value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)} className="border p-1 w-full">
          <option value="">-- Elegí una acción --</option>
          <optgroup label="Ganados">
            {accionesGanadas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </optgroup>
          <optgroup label="Perdidos">
            {accionesPerdidas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </optgroup>
        </select>
      </div>
      <div className="my-2">
        <label className="block">Jugadora (opcional):</label>
        <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)} className="border p-1 w-full">
          <option value="">-- Sin jugadora asociada --</option>
          {players.map((p, i) => (
            <option key={i} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 my-2">
        <button onClick={() => handlePoint("win")} className="bg-green-600 text-white px-3 py-1 rounded">✔ Punto ganado</button>
        <button onClick={() => handlePoint("lose")} className="bg-red-600 text-white px-3 py-1 rounded">❌ Punto perdido</button>
      </div>

      <div className="my-4">
        <strong>Marcador:</strong> Ganados: {score.won} / Perdidos: {score.lost}
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-semibold">Historial</h2>
        <ul className="list-disc list-inside">
          {history.map((h, i) => (
            <li key={i}>
              Rotación: {h.rotation.join("-")} | Resultado: {h.result === "win" ? "✔" : "❌"} | Acción: {h.action} {h.player ? `| Jugadora: ${h.player}` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

