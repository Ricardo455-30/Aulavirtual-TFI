import React from "react";
import { FiUsers, FiCheckCircle, FiBookOpen, FiBarChart2 } from "react-icons/fi";
import "../../css/Directivo.css";

const Inicio = () => {
  return (
    <div className="inicio-container">
      
      {/* Bienvenida */}
      <div className="inicio-header">
        <h1>Bienvenido, Directivo</h1>
        <p>
          Administra materias, asigna docentes y supervisa el rendimiento académico.
        </p>
      </div>

      {/* Cards */}
      <div className="inicio-cards">

        {/* Aprobaciones */}
        <div className="card">
          <div className="card-icon aprobacion">
            <FiCheckCircle />
          </div>
          <h3>Aprobación de Cuentas</h3>
          <p>Revisa y aprueba registros de alumnos y docentes.</p>
          <button>Abrir</button>
        </div>

        {/* Materias */}
        <div className="card">
          <div className="card-icon materias">
            <FiBookOpen />
          </div>
          <h3>Gestión de Materias</h3>
          <p>Crea materias y asígnalas a cursos y docentes.</p>
          <button>Abrir</button>
        </div>

        {/* Usuarios */}
        <div className="card">
          <div className="card-icon usuarios">
            <FiUsers />
          </div>
          <h3>Asignación Académica</h3>
          <p>Asigna materias a docentes y alumnos según curso.</p>
          <button>Abrir</button>
        </div>

        {/* Reportes */}
        <div className="card">
          <div className="card-icon reportes">
            <FiBarChart2 />
          </div>
          <h3>Asistencias y Notas</h3>
          <p>Consulta el rendimiento y asistencia de los alumnos.</p>
          <button>Abrir</button>
        </div>

      </div>
    </div>
  );
};

export default Inicio;