import React, { useState } from "react";
<button className="px-4 py-2 bg-blue-600 text-white rounded-xl">Click</button>
import "./index.css";

export default function App() {
  const [players, setPlayers] = useState(Array(14).fill({ name: "", position: "" }));
  const [starters, setStarters] = useState([]);
  const [rotation, setRotation] = useState([0, 1, 2, 3, 4, 5]);
  const [score, setScore] = useState({ won: 0, lost: 0 });
  const [history, setHistory] = useState([]);

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

  const rotate = () => {
    setRotation((prev) => [prev[5], ...prev.slice(0, 5)]);
  };

  const rotateBack = () => {
    setRotation((prev) => [...prev.slice(1), prev[0]]);
  };

  const handlePoint = (result) => {
    const newHistory = [...history, { rotation: [...rotation], result }];
    setHistory(newHistory);
    setScore((prev) => ({
      won: prev.won + (result === "win" ? 1 : 0),
      lost: prev.lost + (result === "lose" ? 1 : 0),
    }));
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">KIWIS APP</h1>
      <div className="grid grid-cols-2 gap-4">
        {/* Team input */}
        <div>
          <h2 className="text-xl font-semibold">Cargar equipo (14 jugadoras)</h2>
          {players.map((p, i) => (
            <div key={i} className="flex gap-2 items-center mb-1">
              <input
                type="text"
                placeholder="Nombre"
                value={p.name}
                onChange={(e) => handleSetPlayer(i, "name", e.target.value)}
                className="border p-1 w-1/2"
              />
              <input
                type="text"
                placeholder="Posición"
                value={p.position}
                onChange={(e) => handleSetPlayer(i, "position", e.target.value)}
                className="border p-1 w-1/3"
              />
              <Button onClick={() => handleSelectStarter(i)} disabled={starters.includes(i)}>
                Titular
              </Button>
            </div>
          ))}
        </div>

        {/* Cancha con titulares */}
        <div>
          <h2 className="text-xl font-semibold">Formación en cancha</h2>
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
            {players.map((p, i) =>
              !starters.includes(i) ? <li key={i}>{p.name}</li> : null
            )}
          </ul>
        </div>
      </div>

      {/* Controles de rotación y puntos */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Simulación de Rotaciones</h2>
        <div className="flex gap-4 my-2">
          <Button onClick={rotate}>➡ Siguiente rotación</Button>
          <Button onClick={rotateBack}>⬅ Rotación anterior</Button>
        </div>
        <h3 className="text-lg">Marcador</h3>
        <div className="flex gap-4 my-2">
          <Button onClick={() => handlePoint("win")}>✔ Punto ganado</Button>
          <Button onClick={() => handlePoint("lose")}>❌ Punto perdido</Button>
        </div>
        <div>
          <strong>Total:</strong> Ganados: {score.won} / Perdidos: {score.lost}
        </div>
      </div>

      {/* Historial */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Historial de puntos</h2>
        <ul className="list-disc list-inside">
          {history.map((h, i) => (
            <li key={i}>
              Rotación: {h.rotation.join("-")} | Resultado: {h.result === "win" ? "✔" : "❌"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
