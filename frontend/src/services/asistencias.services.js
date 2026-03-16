
import axios from "axios";

const API = "http://localhost:8000/api/asistencias";



export const guardarAsistencia = async (asistencias) => {

  const token = localStorage.getItem("token");

  const res = await axios.post(API, asistencias, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const getAsistenciasHoy = async () => {

  const token = localStorage.getItem("token");

  const res = await axios.get(`${API}/hoy`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.data;

};