import React, { useEffect, useState } from "react";
import "../../css/ADMIN/dashbard.css";

const API = "http://localhost:8000/api/auth";

const Dashboard = () => {

  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    obtenerUsuario();
  }, []);

  const obtenerUsuario = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUsuario(data);

    } catch (error) {
      console.error("Error obteniendo usuario:", error);
    }
  };

  return (
    <div className="dashboard">

      {/* ======================
         HEADER
      ====================== */}
      <div className="dashboard-header">
        <h1>
          👋 Bienvenido,{" "}
          <span className="nombre">
            {usuario ? usuario.nombre : "Usuario"}
          </span>
        </h1>

        <p>
          Desde aquí podrás gestionar usuarios, documentos y backups del sistema.
        </p>
      </div>

      {/* ======================
         CARDS
      ====================== */}
      <div className="dashboard-cards">

        <div className="card">
          <div className="icon">👥</div>
          <h3>Usuarios</h3>
          <p>Administra cuentas y roles del sistema.</p>
        </div>

        <div className="card">
          <div className="icon">📄</div>
          <h3>Documentos</h3>
          <p>Gestiona todos los archivos subidos.</p>
        </div>

        <div className="card">
          <div className="icon">💾</div>
          <h3>Backups</h3>
          <p>Controla copias de seguridad.</p>
        </div>

      </div>

      {/* ======================
         INFO
      ====================== */}
      <div className="dashboard-info">
        <h2>¿Qué puedes hacer aquí?</h2>

        <ul>
          <li>✔️ Gestionar usuarios</li>
          <li>✔️ Administrar documentos</li>
          <li>✔️ Supervisar el sistema</li>
          <li>✔️ Controlar backups</li>
        </ul>
      </div>

    </div>
  );
};

export default Dashboard;