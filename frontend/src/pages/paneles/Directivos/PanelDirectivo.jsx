import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/directivo/Sidebar";
import StatCard from "../../../components/directivo/StatCard";
import UserManagement from "../../../components/directivo/UserManagement";
import "../../../css/directivo/panelDirectivo.css";
import { FiUsers, FiBriefcase, FiShield } from "react-icons/fi";

const PanelDirectivo = () => {
  const [stats, setStats] = useState({
    usuarios: 0,
    empleados: 0,
    admins: 0,
  });

  useEffect(() => {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    const empleados = usuarios.filter(u => u.rol === "empleado").length;
    const admins = usuarios.filter(u => u.rol === "admin").length;

    setStats({
      usuarios: usuarios.length,
      empleados,
      admins,
    });
  }, []);

  return (
    <div className="panel-container">
      <Sidebar />

      <div className="panel-content">
        <h1 className="panel-title">Panel Directivo</h1>

        {/* CARDS */}
        <div className="stats-grid">
          <StatCard
            icon={<FiUsers />}
            title="Usuarios Totales"
            value={stats.usuarios}
          />
          <StatCard
            icon={<FiBriefcase />}
            title="Empleados"
            value={stats.empleados}
          />
          <StatCard
            icon={<FiShield />}
            title="Administradores"
            value={stats.admins}
          />
        </div>

        {/* GESTIÓN DE USUARIOS */}
        <UserManagement />
      </div>
    </div>
  );
};

export default PanelDirectivo;
