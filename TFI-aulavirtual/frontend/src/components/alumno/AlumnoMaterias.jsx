import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiBook,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
  FiDownload,
  FiInfo,
} from "react-icons/fi";
import "../../css/alumnoMaterias.css";

const MisMaterias = ({ setSection, idCiclo }) => {
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

        if (!token) {
          setError("No hay token. Por favor inicia sesión.");
          setIsLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get("http://localhost:8000/api/alumnos/mis-materias", {
          headers,
          params: idCiclo ? { id_ciclo: idCiclo } : {},
        });

        setMaterias(res.data || []);

        if (res.data.length === 0) {
          setError("No tienes materias inscritas. Por favor contacta con el director.");
        }
      } catch (err) {
        console.error("Error:", err);

        if (err.response?.status === 403) {
          setError("Acceso denegado: No eres alumno o no tienes permisos.");
        } else if (err.response?.status === 404) {
          setError("Alumno no registrado en el sistema.");
        } else if (err.response?.status === 401) {
          setError("Sesión expirada. Por favor inicia sesión nuevamente.");
        } else {
          setError(`Error: ${err.response?.data?.error || err.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterias();
  }, [idCiclo]);

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

  if (isLoading) {
    return (
      <div className="mis-materias-section">
        <div className="alert">
          <FiLoader />
          <span>Cargando materias...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-materias-section">
      <div className="mis-materias-wrapper">
        {/* HEADER */}
        <div className="mis-materias-header">
          <h2>
            <FiBook />
            Mis Materias
          </h2>
          <p>Consulta los contenidos y recursos de tus materias inscritas.</p>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="alert alert-error">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}

        {!isLoading && materias.length === 0 && !error && (
          <div className="alert">
            <FiInfo />
            <span>No te has inscrito en ninguna materia todavía.</span>
          </div>
        )}

        {/* GRID DE MATERIAS */}
        <div className="mis-materias-grid">
          {materias.map((materia) => (
            <div key={materia.id_materia} className="mis-materias-card">
              {/* HEADER CON ICONO */}
              <div className="mis-materias-card-header">
                <div className="mis-materias-card-header-icon">
                  <FiBook />
                </div>
                <h3>{materia.nombre}</h3>
                <div className="curso-badge">
                  {materia.curso} • Año {materia.anio}
                </div>
                <div className="mis-materias-card-meta">
                  <span>
                    <FiCheckCircle />
                    {materia.estado}
                  </span>
                </div>
              </div>

              {/* BODY */}
              <div className="mis-materias-card-body">
                <p>{materia.descripcion || "Sin descripción disponible"}</p>
              </div>

              {/* CONTENIDOS EXPANDIBLE */}
              {expandedMateria === materia.id_materia && (
                <div className="contenidos-list">
                  {loadingContenidos ? (
                    <div className="loading-content">
                      <FiLoader />
                      <span>Cargando contenidos...</span>
                    </div>
                  ) : materiaContenidos[materia.id_materia]?.length > 0 ? (
                    <ul>
                      {materiaContenidos[materia.id_materia].map((contenido) => (
                        <li key={contenido.id_contenido}>
                          <strong>
                            <FiFileText style={{ display: "inline", marginRight: "8px" }} />
                            {contenido.titulo}
                          </strong>
                          <p>{contenido.descripcion}</p>
                          {contenido.archivo && (
                            <a
                              href={`http://localhost:8000/uploads/archivos_registros/contenidos/${contenido.archivo}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <FiDownload />
                              Ver archivo
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="empty-content">
                      <FiFileText />
                      <span>No hay contenidos publicados para esta materia.</span>
                    </div>
                  )}
                </div>
              )}

              {/* FOOTER CON BOTÓN */}
              <div className="mis-materias-card-footer">
                <button
                  className="btn-expandir"
                  onClick={() => toggleContenidos(materia)}
                >
                  {expandedMateria === materia.id_materia ? (
                    <>
                      <FiChevronUp /> Ocultar Contenidos
                    </>
                  ) : (
                    <>
                      <FiChevronDown /> Ver Contenidos
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MisMaterias;