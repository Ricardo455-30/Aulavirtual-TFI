import { useState } from "react";

const TareaCard = ({ tarea, onEntregar }) => {
  const [archivo, setArchivo] = useState(null);
  const [respuesta, setRespuesta] = useState("");

  return (
    <div className="tarea-card">
      <h3>{tarea.titulo}</h3>
      <p>{tarea.descripcion}</p>
      <p><strong>Fecha límite:</strong> {new Date(tarea.fecha_entrega).toLocaleString()}</p>

      <div className="entrega-box">
        <textarea
          placeholder="Escribí tu respuesta..."
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
        />

        <input
          type="file"
          onChange={(e) => setArchivo(e.target.files[0])}
        />

        <button
          onClick={() => onEntregar(tarea.id_tarea, archivo, respuesta)}
        >
          Enviar tarea
        </button>
      </div>
    </div>
  );
};

export default TareaCard;