import React from "react";

const DocenteDashboard = () => {
  return (
    <div>
      <h1>Bienvenido Profesor 👋</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>4</h3>
          <p>Cursos Activos</p>
        </div>

        <div className="stat-card">
          <h3>120</h3>
          <p>Alumnos</p>
        </div>

        <div className="stat-card">
          <h3>8</h3>
          <p>Evaluaciones Pendientes</p>
        </div>

        <div className="stat-card">
          <h3>3</h3>
          <p>Comunicados Enviados</p>
        </div>
      </div>
    </div>
  );
};

export default DocenteDashboard;
