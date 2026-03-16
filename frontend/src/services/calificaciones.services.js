import axios from "axios";

const API = "http://localhost:8000/api/calificaciones";

export const guardarNotasCurso = async (curso, notas) => {

  const token = localStorage.getItem("token");

  const res = await axios.post(
    `${API}/guardar`,
    {
      curso,
      notas
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return res.data;
};