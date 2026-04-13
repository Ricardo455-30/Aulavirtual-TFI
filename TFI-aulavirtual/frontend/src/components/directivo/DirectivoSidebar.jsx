import React from "react";

const DirectivoSidebar = ({ section, setSection }) => {
  const menuItems = [
    { id: "inicio", label: "Inicio" },
    { id: "aprobados", label: "Aprobación de cuentas" },
    { id: "materias", label: "Gestión de materias" },
    { id: "dms", label: "Notas" },
    { id: "asignar-curso", label: "Asignar curso" },
    { id: "asistencia", label: "Asistencias" },
  ];

  return (
    <div className="directivo-sidebar">
      
      {/* 🔹 LOGO / HEADER */}
      <div className="sidebar-header">
        <h2 className="sidebar-logo">Aula Virtual</h2>
        <p className="sidebar-subtitle">
          Panel de gestión académica (Directivo)
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
            {item.label}
          </li>
        ))}
      </ul>

    </div>
  );
};

export default DirectivoSidebar;