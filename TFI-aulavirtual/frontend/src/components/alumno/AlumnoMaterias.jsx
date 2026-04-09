import React, { useEffect, useState } from "react";
import axios from "axios";

const MisMaterias = () => {
  const [materias, setMaterias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedMateria, setExpandedMateria] = useState(null);
  const [materiaContenidos, setMateriaContenidos] = useState({});
  const [loadingContenidos, setLoadingContenidos] = useState(false);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await axios.get("http://localhost:8000/api/alumnos/mis-materias", {
          headers,
        });

        setMaterias(res.data || []);
      } catch (err) {
        console.error("Error al obtener materias", err);
        setError("No se pudieron cargar las materias inscritas.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  const toggleContenidos = async (materia) => {
    if (expandedMateria === materia.id_materia) {
      setExpandedMateria(null);
      return;
    }

    if (materiaContenidos[materia.id_materia]) {
      setExpandedMateria(materia.id_materia);
      return;
    }

    try {
      setError("");
      setLoadingContenidos(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(
        `http://localhost:8000/api/materias/contenidos/${materia.id_materia}`,
        {
          headers,
        }
      );

      setMateriaContenidos((prev) => ({
        ...prev,
        [materia.id_materia]: res.data,
      }));
      setExpandedMateria(materia.id_materia);
    } catch (err) {
      console.error("Error al obtener contenidos", err);
      setError("No se pudieron cargar los contenidos de la materia.");
    } finally {
      setLoadingContenidos(false);
    }
  };

  return (
    <div className="mis-materias-section">
      <div className="mis-materias-header">
        <h2>Mis Materias</h2>
        <p>Estas son las materias en las que estás inscripto y el contenido disponible para cada una.</p>
      </div>

      {isLoading && <div className="alert">Cargando materias...</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!isLoading && materias.length === 0 && (
        <div className="alert">No te has inscrito en ninguna materia todavía.</div>
      )}

      <div className="mis-materias-grid">
        {materias.map((materia) => (
          <div key={materia.id_materia} className="mis-materias-card">
            <div className="mis-materias-card-top">
              <div>
                <h3>{materia.nombre}</h3>
                <p className="materia-subtitle">Curso: {materia.curso || "Sin curso"}</p>
                <p className="materia-subtitle">Estado: {materia.estado}</p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => toggleContenidos(materia)}
              >
                {expandedMateria === materia.id_materia ? "Ocultar contenidos" : "Ver contenidos"}
              </button>
            </div>
            <p>{materia.descripcion}</p>

            {expandedMateria === materia.id_materia && (
              <div className="contenidos-list">
                {loadingContenidos ? (
                  <p>Cargando contenidos...</p>
                ) : materiaContenidos[materia.id_materia]?.length > 0 ? (
                  <ul>
                    {materiaContenidos[materia.id_materia].map((contenido) => (
                      <li key={contenido.id_contenido}>
                        <strong>{contenido.titulo}</strong>
                        <p>{contenido.descripcion}</p>
                        {contenido.archivo && (
                          <a href={`http://localhost:8000/uploads/archivos_registros/contenidos/${contenido.archivo}`} target="_blank" rel="noreferrer">
                            Ver archivo
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay contenidos publicados para esta materia.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MisMaterias;