import React from "react";
import { FiBook, FiUsers, FiCheckCircle, FiClipboard } from "react-icons/fi";

const DocenteDashboard = () => {
  return (
    <div className="dashboard-container">
      <h1 className="section-title">Bienvenido Profesor 👋</h1>
      <p className="section-subtitle">Resumen general del sistema</p>

      <div className="stats-grid">

        <div className="stat-card card-cursos">
          <FiBook size={28} className="icon" />
          <div>
            <h2>0</h2>
            <p>Cursos asignados</p>
          </div>
        </div>

        <div className="stat-card card-alumnos">
          <FiUsers size={28} className="icon" />
          <div>
            <h2>0</h2>
            <p>Alumnos registrados</p>
          </div>
        </div>

        <div className="stat-card card-asistencias">
          <FiCheckCircle size={28} className="icon" />
          <div>
            <h2>0</h2>
            <p>Asistencias hoy</p>
          </div>
        </div>

        <div className="stat-card card-evaluaciones">
          <FiClipboard size={28} className="icon" />
          <div>
            <h2>0</h2>
            <p>Evaluaciones</p>
          </div>
        </div>

      </div>

      <div className="panel-info">
        <h3>Panel docente</h3>
        <p>Desde aquí puedes gestionar:</p>
        <ul>
          <li>✔ Asistencias</li>
          <li>✔ Calificaciones</li>
          <li>✔ Alumnos</li>
          <li>✔ Material educativo</li>
        </ul>
      </div>

      <div className="ultimas-asistencias">
        <h3>Últimas asistencias registradas</h3>
        <p>No hay asistencias hoy</p>
      </div>

      <style jsx>{`
        .dashboard-container {
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }
        .section-title {
          font-size: 28px;
          font-weight: bold;
        }
        .section-subtitle {
          font-size: 16px;
          color: #666;
          margin-bottom: 20px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          display: flex;
          align-items: center;
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: transform 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
        }
        .stat-card .icon {
          margin-right: 15px;
          color: #4f46e5;
        }
        .stat-card h2 {
          font-size: 24px;
          margin: 0;
        }
        .stat-card p {
          margin: 0;
          color: #555;
        }
        .panel-info, .ultimas-asistencias {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default DocenteDashboard;