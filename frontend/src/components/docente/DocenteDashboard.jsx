import React, { useEffect, useState } from "react";
import { getCursos } from "../../services/cursos.services";
import { getAlumnos } from "../../services/alumnos.services";
import { getAsistenciasHoy } from "../../services/asistencias.services";

const DocenteDashboard = () => {

  const [stats, setStats] = useState({
    cursos: 0,
    alumnos: 0,
    asistencias: 0,
    evaluaciones: 0
  });

  useEffect(() => {
    cargarStats();
  }, []);

  const cargarStats = async () => {

    try {

      const cursos = await getCursos();
      const alumnos = await getAlumnos();

      let asistenciasHoy = [];

      try {
        asistenciasHoy = await getAsistenciasHoy();
      } catch {
        asistenciasHoy = [];
      }

      setStats({
        cursos: cursos.length,
        alumnos: alumnos.length,
        asistencias: asistenciasHoy.length,
        evaluaciones: 0
      });

    } catch (error) {

      console.error(error);

    }

  };

  return (

    <div>

      <h1 style={styles.titulo}>
        Bienvenido Profesor 👋
      </h1>

      <p style={styles.subtitulo}>
        Aquí tienes un resumen de tu actividad
      </p>

      <div style={styles.grid}>

        <div style={styles.card}>
          <h2>{stats.cursos}</h2>
          <p>Cursos asignados</p>
        </div>

        <div style={styles.card}>
          <h2>{stats.alumnos}</h2>
          <p>Alumnos registrados</p>
        </div>

        <div style={styles.card}>
          <h2>{stats.asistencias}</h2>
          <p>Asistencias hoy</p>
        </div>

        <div style={styles.card}>
          <h2>{stats.evaluaciones}</h2>
          <p>Evaluaciones</p>
        </div>

      </div>

      <div style={styles.panelInfo}>

        <h3>Panel docente</h3>

        <p>
          Desde este panel puedes gestionar:
        </p>

        <ul>
          <li>✔ Asistencias</li>
          <li>✔ Calificaciones</li>
          <li>✔ Alumnos</li>
          <li>✔ Material educativo</li>
        </ul>

      </div>

    </div>

  );

};

const styles = {

  titulo: {
    fontSize: "28px",
    marginBottom: "5px"
  },

  subtitulo: {
    color: "#666",
    marginBottom: "30px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: "20px"
  },

  card: {
    background: "white",
    borderRadius: "12px",
    padding: "25px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    border: "1px solid #eee"
  },

  panelInfo: {
    marginTop: "40px",
    background: "#f8fafc",
    padding: "25px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb"
  }

};

export default DocenteDashboard;