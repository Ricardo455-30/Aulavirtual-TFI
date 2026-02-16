// src/components/tutor/TutorSidebar.jsx
import React from "react";
import { FiHome, FiUsers, FiSettings } from "react-icons/fi";

const TutorSidebar = ({ setSection, activeSection }) => {
  return (
    <aside className="tutor-sidebar">
      <div className="tutor-logo">
        <img src="/icono.png" alt="Logo Institucional" />
      </div>
      <nav>
        <ul>
          <li
            className={activeSection === "dashboard" ? "active" : ""}
            onClick={() => setSection("dashboard")}
          >
            <FiHome /> Dashboard
          </li>
          <li
            className={activeSection === "myChildren" ? "active" : ""}
            onClick={() => setSection("myChildren")}
          >
            <FiUsers /> Mis hijos
          </li>
          <li
            className={activeSection === "settings" ? "active" : ""}
            onClick={() => setSection("settings")}
          >
            <FiSettings /> Configuración
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default TutorSidebar;
