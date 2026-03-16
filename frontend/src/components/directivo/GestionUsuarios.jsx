import { useEffect, useState } from "react";
import axios from "axios";

const GestionUsuarios = ({ rol }) => {
  const [usuarios, setUsuarios] = useState([]);
  const token = localStorage.getItem("token"); // tu token
  const BASE_URL = "http://localhost:8000/api"; // ajustá según tu backend

  // ==========================
  // 📚 CARGAR USUARIOS
  // ==========================
  const cargarUsuarios = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/usuarios?rol=${rol}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(res.data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, [rol]);

  return (
    <div className="section-container">
      <h2>Gestión de {rol}s</h2>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre} {u.apellido}</td>
                <td>{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionUsuarios;