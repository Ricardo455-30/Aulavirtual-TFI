import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AlumnoMaterias = () => {
  const navigate = useNavigate();

  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerMaterias = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8000/api/materias", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Error al obtener materias");
        }

        const data = await res.json();
        setMaterias(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las materias");
      } finally {
        setLoading(false);
      }
    };

    obtenerMaterias();
  }, []);

  if (loading) {
    return <p className="loading">Cargando materias...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div>
      <h2 className="titulo-seccion">Mis Materias</h2>

      <div className="materias-grid">
        {materias.length > 0 ? (
          materias.map((materia) => (
            <div
              key={materia.id_materia}
              className="materia-card"
              onClick={() =>
                navigate(`/alumno/materias/${materia.id_materia}`)
              }
            >
              <div className="materia-imagen">
                <img
                  src="/materia-default.png"
                  alt={materia.nombre_materia}
                />
              </div>

              <div className="materia-info">
                <h3>{materia.nombre_materia}</h3>
                <p>Carga horaria: {materia.carga_horaria} hs</p>
              </div>
            </div>
          ))
        ) : (
          <p>No tenés materias asignadas</p>
        )}
      </div>
    </div>
  );
};

export default AlumnoMaterias;