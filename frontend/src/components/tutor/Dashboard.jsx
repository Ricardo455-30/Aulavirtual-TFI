// src/components/tutor/Dashboard.jsx
import React from "react";

const Dashboard = () => {
  return (
    <div className="tutor-dashboard">
      <h2>Bienvenido, Tutor</h2>
      <div className="stats-cards">
        <div className="card">
          <h3>Hijos</h3>
          <p>2</p>
        </div>
        <div className="card">
          <h3>Tareas pendientes</h3>
          <p>5</p>
        </div>
        <div className="card">
          <h3>Avisos</h3>
          <p>3</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
