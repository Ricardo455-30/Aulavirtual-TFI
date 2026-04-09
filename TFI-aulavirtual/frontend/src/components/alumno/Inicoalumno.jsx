import React from "react";
import { FiBook, FiPlusCircle, FiClipboard, FiBarChart2 } from "react-icons/fi";
import "../../css/inicio.css";

const InicioAlumno = ({ setSection }) => {
  return (
    <div className="inicio-container">
      
      {/* Bienvenida */}
      <div className="inicio-header">
        <h1>Bienvenido, Alumno 🎓</h1>
        <p>
          Consulta tus materias, inscríbete en nuevas y revisa tu progreso académico.
        </p>
      </div>

      {/* Cards */}
      <div className="inicio-cards">

        {/* Inscripciones */}
        <div className="card">
          <div className="card-icon usuarios">
            <FiPlusCircle />
          </div>
          <h3>Inscribirse</h3>
          <p>Explora y regístrate en nuevas materias disponibles.</p>
          <button onClick={() => setSection("inscripciones")}>Ir</button>
        </div>

        {/* Mis Materias */}
        <div className="card">
          <div className="card-icon aprobacion">
            <FiBook />
          </div>
          <h3>Mis Materias</h3>
          <p>Accede a los contenidos y materiales de tus cursos.</p>
          <button onClick={() => setSection("mis-materias")}>Ir</button>
        </div>

        {/* Tareas / Contenido */}
        <div className="card">
          <div className="card-icon backup">
            <FiClipboard />
          </div>
          <h3>Contenidos</h3>
          <p>Revisa archivos, PDFs y recursos subidos por tus docentes.</p>
          <button onClick={() => setSection("mis-materias")}>Ir</button>
        </div>

        {/* Notas */}
        <div className="card">
          <div className="card-icon backup">
            <FiBarChart2 />
          </div>
          <h3>Mis Notas</h3>
          <p>Consulta tus calificaciones y seguimiento académico.</p>
          <button onClick={() => setSection("notas")}>Ir</button>
        </div>

      </div>
    </div>
  );
};

export default InicioAlumno;