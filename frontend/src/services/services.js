import axios from "axios";

// Import endpoints
import {
  CURSOS_URL,
  ALUMNOS_URL,
  ASISTENCIAS_URL,
  CALIFICACIONES_URL
} from "../endpoints/endpoints.js";

// ==========================
// ASISTENCIAS
// ==========================
export const guardarAsistencia = async (asistencias) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(ASISTENCIAS_URL, asistencias, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getAsistenciasHoy = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${ASISTENCIAS_URL}/hoy`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ==========================
// ALUMNOS
// ==========================
export const getAlumnos = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(ALUMNOS_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getAlumnosPorCurso = async (idCurso) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${ALUMNOS_URL}/curso/${idCurso}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ==========================
// CURSOS
// ==========================
export const getCursos = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(CURSOS_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ==========================
// CURSOS DEL DOCENTE
// ==========================
export const getCursosDocente = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${CURSOS_URL}/mis-cursos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ==========================
// DOCENTES
// ==========================
export const getPerfilDocente = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get("http://localhost:8000/api/docentes/perfil", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ==========================
// CALIFICACIONES
// ==========================
export const guardarNotasCurso = async (curso, notas) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(
    `${CALIFICACIONES_URL}/guardar`,
    { curso, notas },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};