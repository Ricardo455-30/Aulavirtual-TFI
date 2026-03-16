import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MateriasRecientes = () => {
  const navigate = useNavigate();
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerMaterias = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:8000/api/materias",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMaterias(res.data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar materias");
      } finally {
        setLoading(false);
      }
    };

    obtenerMaterias();
  }, []);

  if (loading) return <p>Cargando materias...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="materias-grid">
      {materias.map((m) => (
        <div
          key={m.id}
          className="materia-card"
          onClick={() => navigate(`/alumno/materias/${m.id}`)}
        >
          <img
            src={
              m.imagen
                ? `http://localhost:4000/uploads/${m.imagen}`
                : "/default.jpg"
            }
            alt={m.nombre}
          />

          <div className="materia-info">
            <h4>{m.nombre}</h4>

            <div className="barra">
              <div
                className="progreso"
                style={{ width: `${m.progreso}%` }}
              ></div>
            </div>

            <span>{m.progreso}% completado</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MateriasRecientes;