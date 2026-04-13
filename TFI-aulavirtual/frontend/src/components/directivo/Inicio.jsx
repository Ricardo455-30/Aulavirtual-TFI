import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUsers,
  FiCheckCircle,
  FiBookOpen,
  FiBarChart2,
  FiLoader,
  FiUserCheck,
  FiList,
  FiTrendingUp,
} from "react-icons/fi";
import "../../css/directivoInicio.css";

const DirectivoInicio = ({ setSection }) => {
  const [directivo, setDirectivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAlumnos: 0,
    totalDocentes: 0,
    totalMaterias: 0,
    totalCursos: 0,
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Extraer id_usuario del token
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const id_usuario = tokenData.id;
        
        // Obtener nombre del directivo
        let directivoName = "Directivo";
        try {
          const res = await axios.get(
            "http://localhost:8000/api/usuarios/me",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.data) {
            directivoName = `${res.data.nombre} ${res.data.apellido || ''}`.trim();
          }
        } catch (err) {
          console.log("No se pudo obtener nombre del directivo");
        }

        // Obtener totales
        let totalAlumnos = 0, totalDocentes = 0, totalMaterias = 0, totalCursos = 0;

        try {
          // Total de alumnos
          const resAlumnos = await axios.get(
            "http://localhost:8000/api/alumnos",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          totalAlumnos = resAlumnos.data?.length || 0;
        } catch (err) {
          console.log("Error al contar alumnos");
        }

        try {
          // Total de docentes
          const resDocentes = await axios.get(
            "http://localhost:8000/api/docentes",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          totalDocentes = resDocentes.data?.length || 0;
        } catch (err) {
          console.log("Error al contar docentes");
        }

        try {
          // Total de materias
          const resMaterias = await axios.get(
            "http://localhost:8000/api/materias",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          totalMaterias = resMaterias.data?.length || 0;
        } catch (err) {
          console.log("Error al contar materias");
        }

        try {
          // Total de cursos (Uniq)
          const resCursos = await axios.get(
            "http://localhost:8000/api/cursos",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          totalCursos = resCursos.data?.length || 0;
        } catch (err) {
          console.log("Error al contar cursos");
        }

        setDirectivo({ nombre: directivoName });
        setStats({ totalAlumnos, totalDocentes, totalMaterias, totalCursos });
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="directivo-loading">
        <FiLoader className="spinner" />
        <p>Cargando panel directivo...</p>
      </div>
    );
  }

  return (
    <div className="directivo-inicio-container">
      {/* ENCABEZADO */}
      <div className="directivo-inicio-header">
        <h1>
          <FiUserCheck /> Bienvenido, {directivo?.nombre || "Directivo"}
        </h1>
        <p>
          Administra materias, asigna docentes y supervisa el rendimiento académico de tu institución.
        </p>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="directivo-stats-grid">
        <div className="directivo-stat-card alumnos">
          <div className="directivo-stat-icon">
            <FiUsers />
          </div>
          <div className="directivo-stat-content">
            <h3>Alumnos</h3>
            <p className="stat-number">{stats.totalAlumnos}</p>
          </div>
        </div>

        <div className="directivo-stat-card docentes">
          <div className="directivo-stat-icon">
            <FiCheckCircle />
          </div>
          <div className="directivo-stat-content">
            <h3>Docentes</h3>
            <p className="stat-number">{stats.totalDocentes}</p>
          </div>
        </div>

        <div className="directivo-stat-card materias">
          <div className="directivo-stat-icon">
            <FiBookOpen />
          </div>
          <div className="directivo-stat-content">
            <h3>Materias</h3>
            <p className="stat-number">{stats.totalMaterias}</p>
          </div>
        </div>

        <div className="directivo-stat-card cursos">
          <div className="directivo-stat-icon">
            <FiTrendingUp />
          </div>
          <div className="directivo-stat-content">
            <h3>Cursos</h3>
            <p className="stat-number">{stats.totalCursos}</p>
          </div>
        </div>
      </div>

      {/* ACCIONES */}
      <h2 className="directivo-acciones-title">
        <FiList /> Acciones
      </h2>
      <div className="directivo-acciones-grid">
        {/* Aprobaciones */}
        <div className="directivo-action-card aprobacion">
          <div className="directivo-action-icon">
            <FiCheckCircle />
          </div>
          <h3>Aprobación de Cuentas</h3>
          <p>Revisa y aprueba registros pendientes de alumnos y docentes.</p>
          <button
            className="directivo-action-btn"
            onClick={() => setSection("aprobados")}
          >
            <FiCheckCircle /> Abrir
          </button>
        </div>

        {/* Materias */}
        <div className="directivo-action-card materias">
          <div className="directivo-action-icon">
            <FiBookOpen />
          </div>
          <h3>Gestión de Materias</h3>
          <p>Crea materias y asígnalas a cursos y docentes para organizar la oferta académica.</p>
          <button
            className="directivo-action-btn"
            onClick={() => setSection("materias")}
          >
            <FiBookOpen /> Abrir
          </button>
        </div>

        {/* Usuarios */}
        <div className="directivo-action-card usuarios">
          <div className="directivo-action-icon">
            <FiUsers />
          </div>
          <h3>Asignación Académica</h3>
          <p>Asigna materias a docentes y alumnos según curso y disponibilidad.</p>
          <button
            className="directivo-action-btn"
            onClick={() => setSection("dms")}
          >
            <FiUsers /> Abrir
          </button>
        </div>

        {/* Reportes */}
        <div className="directivo-action-card reportes">
          <div className="directivo-action-icon">
            <FiBarChart2 />
          </div>
          <h3>Asistencias y Notas</h3>
          <p>Consulta reportes de rendimiento académico y asistencia de alumnos.</p>
          <button
            className="directivo-action-btn"
            onClick={() => setSection("asistencia")}
          >
            <FiBarChart2 /> Abrir
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectivoInicio;