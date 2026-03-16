import React from "react";
import {
  FiHome,
  FiBookOpen,
  FiUsers,
  FiEdit,
  FiBell,
  FiUser
} from "react-icons/fi";

const DocenteSidebar = ({ setSection }) => {
  return (
    <div className="docente-sidebar">
      <h2>Panel Docente</h2>

      <button onClick={() => setSection("dashboard")}>
        <FiHome /> Dashboard
      </button>

      <button onClick={() => setSection("asistencias")}>
        <FiBookOpen /> Asistencia
      </button>

      <button onClick={() => setSection("alumnos")}>
        <FiUsers /> Alumnos
      </button>

      <button onClick={() => setSection("calificaciones")}>
        <FiEdit /> Calificaciones
      </button>

     
      <button onClick={() => setSection("perfil")}>
        <FiUser /> Mi Perfil
      </button>
    </div>
  );
};

export default DocenteSidebar;
