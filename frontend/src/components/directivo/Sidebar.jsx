import React from "react";
import { FiHome, FiUsers, FiSettings, FiLogOut } from "react-icons/fi";
import "../../css/directivo/panelDirectivo.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-logo">Panel Admin</h2>

      <ul>
        <li><FiHome /> Dashboard</li>
        <li><FiUsers /> Usuarios</li>
        <li><FiSettings /> Configuración</li>
        <li className="logout"><FiLogOut /> Cerrar sesión</li>
      </ul>
    </div>
  );
};

export default Sidebar;
