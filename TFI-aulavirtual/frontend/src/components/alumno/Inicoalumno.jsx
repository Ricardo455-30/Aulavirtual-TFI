import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiBook,
  FiFileText,
  FiBarChart2,
  FiUsers,
  FiLoader,
  FiArrowRight,
  FiCheckCircle,
  FiPlusCircle,
} from "react-icons/fi";
import "../../css/inicio.css";

const InicioAlumno = ({ setSection }) => {
  const [alumno, setAlumno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMaterias: 0,
    tareasEntregadas: 0,
    promedio: 0,
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Extraer id_usuario del token
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const id_usuario = tokenData.id;
        
        // Obtener nombre del alumno desde /api/alumnos
        let alumnoName = "Alumno";
        let id_alumno = null;
        try {
          const resAlumnos = await axios.get(
            "http://localhost:8000/api/alumnos",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const alumnoData = resAlumnos.data?.find(a => a.id_usuario === id_usuario);
          if (alumnoData) {
            alumnoName = `${alumnoData.nombre} ${alumnoData.apellido}`;
            id_alumno = alumnoData.id_alumno;
          }
        } catch (err) {
          console.log("No se pudo traer nombre del alumno");
        }

        // Traer materias inscritas
        let totalMaterias = 0;
        try {
          const resMaterias = await axios.get(
            "http://localhost:8000/api/alumnos/mis-materias",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          totalMaterias = resMaterias.data?.length || 0;
        } catch (err) {
          console.log("Error al traer materias");
        }

        // Traer tareas entregadas y promedio
        let tareasEntregadas = 0;
        let promedio = 0;
        if (id_alumno) {
          try {
            const resNotas = await axios.get(
              `http://localhost:8000/api/notas/alumno/${id_alumno}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (resNotas.data && resNotas.data.length > 0) {
              // Calcular promedio
              const calificaciones = resNotas.data
                .filter(n => n.calificacion !== null)
                .map(n => parseFloat(n.calificacion));
              
              if (calificaciones.length > 0) {
                promedio = Math.round(
                  (calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length) * 100
                ) / 100;
              }
              
              tareasEntregadas = resNotas.data.length;
            }
          } catch (err) {
            console.log("Error al traer notas");
          }
        }

        setAlumno({ nombre: alumnoName, id_alumno });
        setStats({
          totalMaterias,
          tareasEntregadas,
          promedio,
        });
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="inicio-container">
        <div className="loading">
          <FiLoader />
          <span>Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="inicio-container">
      <div className="inicio-wrapper">
        {/* HEADER */}
        <div className="inicio-header">
          <div className="inicio-header-top">
            <FiBook />
            <h1>Bienvenido, {alumno?.nombre}</h1>
          </div>
          <p>
            Consulta tus materias, revisa tus calificaciones y entrega tus tareas.
          </p>
        </div>

        {/* ESTADÍSTICAS */}
        <div className="inicio-stats">
          <div className="stat-card">
            <div className="stat-icon materias">
              <FiBook />
            </div>
            <div className="stat-info">
              <h3>Materias Inscritas</h3>
              <div className="valor">{stats.totalMaterias}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon alumnos">
              <FiCheckCircle />
            </div>
            <div className="stat-info">
              <h3>Evaluaciones</h3>
              <div className="valor">{stats.tareasEntregadas}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon asistencia">
              <FiBarChart2 />
            </div>
            <div className="stat-info">
              <h3>Promedio General</h3>
              <div className="valor">{stats.promedio || "—"}</div>
            </div>
          </div>
        </div>

        {/* CARDS */}
        <div className="inicio-cards">
          {/* Mis Materias */}
          <div className="card">
            <div className="card-icon materias">
              <FiBook />
            </div>
            <h3>Mis Materias</h3>
            <p>
              Accede a los contenidos y materiales de tus cursos inscritos.
            </p>
            <div className="card-info">
              <FiCheckCircle style={{ fontSize: "14px" }} />
              {stats.totalMaterias} materia{stats.totalMaterias !== 1 ? 's' : ''} inscrita{stats.totalMaterias !== 1 ? 's' : ''}
            </div>
            <button onClick={() => setSection("mis-materias")}>
              <FiArrowRight /> Ver Materias
            </button>
          </div>

          {/* Inscribirse */}
          <div className="card">
            <div className="card-icon notas">
              <FiPlusCircle />
            </div>
            <h3>Inscribirse</h3>
            <p>
              Explora y regístrate en nuevas materias disponibles.
            </p>
            <div className="card-info">
              <FiPlusCircle style={{ fontSize: "14px" }} />
              Amplía tu oferta académica
            </div>
            <button onClick={() => setSection("inscripciones")}>
              <FiArrowRight /> Inscribirse
            </button>
          </div>

          {/* Tareas Pendientes */}
          <div className="card">
            <div className="card-icon asistencia">
              <FiFileText />
            </div>
            <h3>Tareas</h3>
            <p>
              Visualiza y entrega tareas asignadas por tus docentes.
            </p>
            <div className="card-info">
              <FiFileText style={{ fontSize: "14px" }} />
              Gestiona tus entregas
            </div>
            <button onClick={() => setSection("mis-materias")}>
              <FiArrowRight /> Ver Tareas
            </button>
          </div>

          {/* Mis Notas */}
          <div className="card">
            <div className="card-icon reportes">
              <FiBarChart2 />
            </div>
            <h3>Mis Notas</h3>
            <p>
              Consulta tus calificaciones y seguimiento académico.
            </p>
            <div className="card-info">
              <FiBarChart2 style={{ fontSize: "14px" }} />
              Promedio: {stats.promedio || "—"}
            </div>
            <button onClick={() => setSection("notas")}>
              <FiArrowRight /> Ver Notas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InicioAlumno;