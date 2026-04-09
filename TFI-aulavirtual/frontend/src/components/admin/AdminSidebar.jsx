import React from "react";

const AdminSidebar = ({ section, setSection }) => {
  const menuItems = [
    { id: "inicio", label: "Inicio" },
    { id: "aprobaciones", label: "Aprobación de cuentas" },
    { id: "exportar", label: "Exportar cuentas" },
    { id: "backups", label: "Backups" },
  ];



  return (
    <div className="admin-sidebar">
      
      {/* 🔹 LOGO / HEADER */}
      <div className="sidebar-header">
        <h2 className="sidebar-logo">Aula Virtual</h2>
        <p className="sidebar-subtitle">
          Sistema de gestión de usuarios (Admin)
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

export default AdminSidebar;