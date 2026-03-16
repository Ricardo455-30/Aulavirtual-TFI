import { useState } from "react";
import TareasSection from "./TareasSection";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const MateriaDetalle = ({ materia, volver }) => {
  const [activeTab, setActiveTab] = useState("contenido");

if (!materia) {
  return <h2>No se recibió la materia</h2>;
}
  return (
    <div className="materia-detalle-container">
      {/* Header */}
      <div className="materia-header">
        <button className="btn-volver" onClick={volver}>
          ← Volver
        </button>

        <div>
          <h2>{materia.nombre}</h2>
          <p>{materia.descripcion}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="materia-tabs">
        <button
          className={activeTab === "contenido" ? "active" : ""}
          onClick={() => setActiveTab("contenido")}
        >
          Contenido
        </button>

        <button
          className={activeTab === "tareas" ? "active" : ""}
          onClick={() => setActiveTab("tareas")}
        >
          Tareas
        </button>

        <button
          className={activeTab === "calendario" ? "active" : ""}
          onClick={() => setActiveTab("calendario")}
        >
          Calendario
        </button>
      </div>

      {/* Secciones */}
      <div className="materia-content">

        {activeTab === "contenido" && (
          <div className="contenido-section">
            <h3>Material de la materia</h3>
            <p>Aquí el docente podrá subir PDFs, enlaces o recursos.</p>
          </div>
        )}

        {activeTab === "tareas" && (
          <TareasSection idAsignacion={materia.id_asignacion} />
        )}

        {activeTab === "calendario" && (
          <div className="calendario-section">
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              height="auto"
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default MateriaDetalle;