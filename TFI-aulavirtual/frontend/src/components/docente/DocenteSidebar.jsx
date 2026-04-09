import React from "react";
import { FiHome, FiBook, FiEdit, FiClipboard } from "react-icons/fi";
import "../../css/sidebar.css";

const DocenteSidebar = ({ section, setSection }) => {
  const menuItems = [
    { id: "inicio", label: "Inicio", icon: <FiHome /> },
    { id: "materias", label: "Mis Materias", icon: <FiBook /> },
    { id: "notas", label: "Cargar Notas", icon: <FiEdit /> },
    { id: "asistencia", label: "Asistencia", icon: <FiClipboard /> },
  ];

  return (
    <div className="admin-sidebar">
      
      {/* 🔹 HEADER */}
      <div className="sidebar-header">
        <h2 className="sidebar-logo">Aula Virtual</h2>
        <p className="sidebar-subtitle">
          Panel Docente
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

export default DocenteSidebar;