import React from "react";
import { FiHome, FiBook, FiPlusCircle, FiBarChart2, FiUpload } from "react-icons/fi";
import "../../css/sidebar.css";

const AlumnoSidebar = ({ section, setSection }) => {
  const menuItems = [
    { id: "inicio", label: "Inicio", icon: <FiHome /> },
    { id: "inscripciones", label: "Inscribirse", icon: <FiPlusCircle /> },
    { id: "mis-materias", label: "Mis Materias", icon: <FiBook /> },
    { id: "enviar-tareas", label: "Enviar Tareas", icon: <FiUpload /> },
    { id: "notas", label: "Mis Notas", icon: <FiBarChart2 /> },
  ];

  return (
    <div className="admin-sidebar">
      
      {/* 🔹 HEADER */}
      <div className="sidebar-header">
        <h2 className="sidebar-logo">Aula Virtual</h2>
        <p className="sidebar-subtitle">
          Panel Alumno
        </p>
      </div>

      {/* 🔹 MENÚ */}
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={section === item.id ? "active" : ""}
            onClick={() => setSection(item.id)}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </li>
        ))}
      </ul>

    </div>
  );
};

export default AlumnoSidebar;