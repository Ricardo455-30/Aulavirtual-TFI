import React, { useState } from "react";

const CalificacionesSection = () => {
  const [nota, setNota] = useState("");

  const guardarNota = () => {
    alert("Nota guardada correctamente ✅");
    setNota("");
  };

  return (
    <div>
      <h2>Cargar Calificación</h2>

      <input
        type="number"
        placeholder="Ingrese nota"
        value={nota}
        onChange={(e) => setNota(e.target.value)}
      />

      <button onClick={guardarNota}>
        Guardar
      </button>
    </div>
  );
};

export default CalificacionesSection;
