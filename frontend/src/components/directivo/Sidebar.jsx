import React from "react";
import { FiHome, FiUsers, FiSettings, FiLogOut } from "react-icons/fi";
import "../../css/directivo/panelDirectivo.css";

const Sidebar = ({ setSeccionActiva }) => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-logo">Panel Directivo</h2>

      <ul>
        <li onClick={() => setSeccionActiva("dashboard")}>
          <FiHome /> Dashboard
        </li>

        <li onClick={() => setSeccionActiva("usuarios")}>
          <FiUsers /> Usuarios
        </li>

        <li onClick={() => setSeccionActiva("configuracion")}>
          <FiSettings /> Configuración
        </li>

        <li
          className="logout"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
        >
          <FiLogOut /> Cerrar sesión
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;