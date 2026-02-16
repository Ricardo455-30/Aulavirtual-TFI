import React from "react";
import { FaHome, FaBook, FaClipboardList, FaUser, FaCalendarCheck } from "react-icons/fa";

const AlumnoSidebar = ({ setSection }) => {
  const notificaciones =
  JSON.parse(localStorage.getItem("notificacionesAlumno")) || [];

const noLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <div className="alumno-sidebar">
      <h2 className="sidebar-title">🎓 Alumno</h2>

      <button onClick={() => setSection("dashboard")}>
        <FaHome /> Dashboard
      </button>

      <button onClick={() => setSection("materias")}>
        <FaBook /> Materias
      </button>

      <button onClick={() => setSection("notas")}>
        <FaClipboardList /> Calificaciones
      </button>

      <button onClick={() => setSection("asistencia")}>
        <FaCalendarCheck /> Asistencia
      </button>

      <button onClick={() => setSection("perfil")}>
        <FaUser /> Mi Perfil
      </button>
      <button onClick={() => setSection("calendario")}>

  📅 Calendario
</button>
<button onClick={() => setSection("notificaciones")}>
  🔔 Notificaciones
  {noLeidas > 0 && (
    <span className="badge">{noLeidas}</span>
  )}
</button>

    </div>

    
  );
};

export default AlumnoSidebar;
