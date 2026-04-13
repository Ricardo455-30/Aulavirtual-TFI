import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiBook,
  FiEdit3,
  FiCheckSquare,
  FiBarChart2,
  FiFileText,
  FiUsers,
  FiLoader,
  FiArrowRight,
} from "react-icons/fi";
import "../../css/inicio.css";

const InicioDocente = ({ setSection }) => {
  const [docente, setDocente] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMaterias: 0,
    totalAlumnos: 0,
    tareasActivas: 0,
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Extraer id_usuario del token
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const id_usuario = tokenData.id;
        
        // Obtener nombre del docente desde /api/docentes
        let docenteName = "Docente";
        try {
          const resDocentes = await axios.get(
            "http://localhost:8000/api/docentes",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // Encontrar el docente actual
          const docente = resDocentes.data?.find(d => d.id_usuario === id_usuario);
          if (docente) {
            docenteName = `${docente.nombre} ${docente.apellido}`;
          }
        } catch (err) {
          console.log("No se pudo traer nombre del docente");
        }

        // Traer materias
        const resMaterias = await axios.get(
          "http://localhost:8000/api/materias/docente",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const materiasData = resMaterias.data || [];
        setMaterias(materiasData);

        // Calcular estadísticas
        let totalAlumnos = 0;
        let totalTareas = 0;

        try {
          for (const materia of materiasData) {
            // Contar alumnos
            try {
              const resAlumnos = await axios.get(
                `http://localhost:8000/api/notas/alumnos/${materia.id_materia}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              totalAlumnos += resAlumnos.data?.length || 0;
            } catch (err) {
              console.log("Error al contar alumnos");
            }

            // Contar tareas por materia/curso
            try {
              const resTareas = await axios.get(
                "http://localhost:8000/api/tareas",
                {
                  params: {
                    id_materia: materia.id_materia,
                    id_curso: materia.id_curso
                  },
                  headers: { Authorization: `Bearer ${token}` }
                }
              );
              totalTareas += resTareas.data?.length || 0;
            } catch (err) {
              console.log("Error al contar tareas de materia:", materia.id_materia);
            }
          }
        } catch (err) {
          console.log("Error calculando estadísticas");
        }

        setDocente({ nombre: docenteName });
        setStats({
          totalMaterias: materiasData.length,
          totalAlumnos,
          tareasActivas: totalTareas,
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
            <h1>Bienvenido, {docente?.nombre}</h1>
          </div>
          <p>
            Gestiona tus materias, registra notas, controla la asistencia y crea tareas para tus alumnos.
          </p>
        </div>

        {/* ESTADÍSTICAS */}
        <div className="inicio-stats">
          <div className="stat-card">
            <div className="stat-icon materias">
              <FiBook />
            </div>
            <div className="stat-info">
              <h3>Materias Asignadas</h3>
              <div className="valor">{stats.totalMaterias}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon alumnos">
              <FiUsers />
            </div>
            <div className="stat-info">
              <h3>Alumnos Totales</h3>
              <div className="valor">{stats.totalAlumnos}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon asistencia">
              <FiCheckSquare />
            </div>
            <div className="stat-info">
              <h3>Tareas Activas</h3>
              <div className="valor">{stats.tareasActivas}</div>
            </div>
          </div>
        </div>

        {/* CARDS */}
        <div className="inicio-cards">
          {/* Materias */}
          <div className="card">
            <div className="card-icon materias">
              <FiBook />
            </div>
            <h3>Mis Materias</h3>
            <p>
              Consulta las materias y cursos que tienes asignados. Visualiza detalles de cada clase.
            </p>
            <div className="card-info">
              <FiCheckSquare style={{ fontSize: "14px" }} />
              {stats.totalMaterias} materia{stats.totalMaterias !== 1 ? 's' : ''} registrada{stats.totalMaterias !== 1 ? 's' : ''}
            </div>
            <button onClick={() => setSection("materias")}>
              <FiArrowRight /> Ir a Materias
            </button>
          </div>

          {/* Notas */}
          <div className="card">
            <div className="card-icon notas">
              <FiEdit3 />
            </div>
            <h3>Cargar Notas</h3>
            <p>
              Registra y actualiza las calificaciones de tus alumnos por materia y trimestre.
            </p>
            <div className="card-info">
              <FiUsers style={{ fontSize: "14px" }} />
              {stats.totalAlumnos} estudiante{stats.totalAlumnos !== 1 ? 's' : ''} bajo tu supervisión
            </div>
            <button onClick={() => setSection("notas")}>
              <FiArrowRight /> Cargar Notas
            </button>
          </div>

          {/* Asistencia */}
          <div className="card">
            <div className="card-icon asistencia">
              <FiCheckSquare />
            </div>
            <h3>Asistencia</h3>
            <p>
              Marca la asistencia diaria de los estudiantes por materia y fecha.
            </p>
            <div className="card-info">
              <FiCheckSquare style={{ fontSize: "14px" }} />
              Control diario de presencia
            </div>
            <button onClick={() => setSection("asistencia")}>
              <FiArrowRight /> Registrar Asistencia
            </button>
          </div>

          {/* Tareas */}
          <div className="card">
            <div className="card-icon tareas">
              <FiFileText />
            </div>
            <h3>Crear Tareas</h3>
            <p>
              Crea y gestiona tareas para tus alumnos. Establece fechas de entrega.
            </p>
            <div className="card-info">
              <FiFileText style={{ fontSize: "14px" }} />
              {stats.tareasActivas} tarea{stats.tareasActivas !== 1 ? 's' : ''} registrada{stats.tareasActivas !== 1 ? 's' : ''}
            </div>
            <button onClick={() => setSection("crear-tareas")}>
              <FiArrowRight /> Crear Tareas
            </button>
          </div>

          {/* Recibir Tareas */}
          <div className="card">
            <div className="card-icon reporte">
              <FiCheckSquare />
            </div>
            <h3>Recibir Tareas</h3>
            <p>
              Visualiza, descarga y califica las tareas entregadas por tus alumnos.
            </p>
            <div className="card-info">
              <FiFileText style={{ fontSize: "14px" }} />
              Gestionar entregas
            </div>
            <button onClick={() => setSection("tareas")}>
              <FiArrowRight /> Ver Entregas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InicioDocente;