import React from "react";
import { FiBook, FiEdit, FiClipboard, FiBarChart2 } from "react-icons/fi";
import "../../css/inicio.css";

const InicioDocente = ({ setSection }) => {
  return (
    <div className="inicio-container">
      
      {/* Bienvenida */}
      <div className="inicio-header">
        <h1>Bienvenido, Docente 👨‍🏫</h1>
        <p>
          Gestiona tus materias, registra notas y controla la asistencia de tus alumnos.
        </p>
      </div>

      {/* Cards */}
      <div className="inicio-cards">

        {/* Materias */}
        <div className="card">
          <div className="card-icon usuarios">
            <FiBook />
          </div>
          <h3>Mis Materias</h3>
          <p>Consulta las materias y cursos que tienes asignados.</p>
          <button onClick={() => setSection("materias")}>Ir</button>
        </div>

        {/* Notas */}
        <div className="card">
          <div className="card-icon aprobacion">
            <FiEdit />
          </div>
          <h3>Cargar Notas</h3>
          <p>Registra y actualiza las calificaciones de tus alumnos.</p>
          <button onClick={() => setSection("notas")}>Ir</button>
        </div>

        {/* Asistencia */}
        <div className="card">
          <div className="card-icon backup">
            <FiClipboard />
          </div>
          <h3>Asistencia</h3>
          <p>Marca la asistencia diaria de los estudiantes.</p>
          <button onClick={() => setSection("asistencia")}>Ir</button>
        </div>

        {/* Reportes */}
        <div className="card">
          <div className="card-icon backup">
            <FiBarChart2 />
          </div>
          <h3>Reportes</h3>
          <p>Visualiza estadísticas de rendimiento y asistencia.</p>
          <button onClick={() => setSection("reportes")}>Ir</button>
        </div>

      </div>
    </div>
  );
};

export default InicioDocente;