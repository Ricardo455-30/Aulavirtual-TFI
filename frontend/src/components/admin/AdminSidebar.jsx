import React from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiUsers, FiSettings, FiLogOut } from "react-icons/fi";

const AdminSidebar = ({ setSection }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 🔐 Limpiar datos de sesión
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 🔄 Redirigir a la Landing
    navigate("/");
  };

  return (
    <aside className="admin-sidebar">
      <h2>Admin</h2>

      <button onClick={() => setSection("dashboard")}>
        <FiHome /> Dashboard
      </button>

      <button onClick={() => setSection("users")}>
        <FiUsers /> Usuarios
      </button>

      <button onClick={() => setSection("settings")}>
        <FiSettings /> Configuración
      </button>

      <button className="logout-btn" onClick={handleLogout}>
        <FiLogOut /> Salir
      </button>
    </aside>
  );
};

export default AdminSidebar;
