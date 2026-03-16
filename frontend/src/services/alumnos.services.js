

import axios from "axios";

const API = "http://localhost:8000/api/alumnos";

export const getAlumnos = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(API, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const getAlumnosPorCurso = async (idCurso) => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API}/curso/${idCurso}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};