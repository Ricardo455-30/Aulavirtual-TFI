import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiBook,
  FiLoader,
  FiAlertCircle,
  FiBarChart2,
  FiCheckCircle,
  FiCalendar,
  FiFilter,
} from "react-icons/fi";
import "../../css/alumnoNotas.css";

const MisNotas = ({ setSection, idCiclo }) => {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroTrimestre, setFiltroTrimestre] = useState("");

  if (!idCiclo) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        <FiInfo size={48} style={{ marginBottom: "16px", opacity: 0.6 }} />
        <h3>Selecciona un ciclo lectivo</h3>
        <p>Elige un ciclo lectivo para ver tus notas.</p>
      </div>
    );
  }

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No hay token. Por favor inicia sesión.");
          setLoading(false);
          return;
        }

        // Extraer ID del alumno del JWT
        const payload = JSON.parse(atob(token.split(".")[1]));
        const alumnoId = payload.id || payload.id_usuario;

        const res = await axios.get(
          `http://localhost:8000/api/notas/alumno/${alumnoId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              id_ciclo: idCiclo || undefined,
            },
          }
        );
        setNotas(res.data || []);
      } catch (err) {
        setError(
          "Error al obtener notas: " + (err.response?.data?.error || err.message)
        );
        console.error("Error al obtener notas", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotas();
  }, [idCiclo]);

  // Obtener tipos y trimestres únicos
  const tiposUnicos = [...new Set(notas.map((n) => n.tipo).filter(Boolean))];
  const trimestresUnicos = [...new Set(notas.map((n) => n.trimestre).filter(Boolean))];

  // Filtrar notas
  const notasFiltradas = notas.filter((n) => {
    const cumpleTipo = !filtroTipo || n.tipo === filtroTipo;
    const cumpleTrimestre = !filtroTrimestre || n.trimestre == filtroTrimestre;
    return cumpleTipo && cumpleTrimestre;
  });

  // Calcular estadísticas
  const calcularPromedio = () => {
    const calificaciones = notasFiltradas
      .filter((n) => n.nota !== null && !isNaN(n.nota))
      .map((n) => parseFloat(n.nota));
    if (calificaciones.length === 0) return 0;
    return (
      Math.round(
        (calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length) *
          100
      ) / 100
    );
  };

  // Obtener badges por calificación
  const obtenerBadge = (nota) => {
    if (nota === null || nota === undefined) return "sin-calificar";
    if (nota >= 9) return "badge-excelente";
    if (nota >= 7) return "badge-bueno";
    if (nota >= 6) return "badge-regular";
    return "badge-reprobado";
  };

  const obtenerTexto = (nota) => {
    if (nota === null || nota === undefined) return "Sin calificar";
    if (nota >= 9) return "Excelente";
    if (nota >= 7) return "Bueno";
    if (nota >= 6) return "Regular";
    return "Reprobado";
  };

  if (loading) {
    return (
      <div className="mis-notas-section">
        <div className="loading-state">
          <FiLoader />
          <span>Cargando notas...</span>
        </div>
      </div>
    );
  }

  const promedio = calcularPromedio();

  return (
    <div className="mis-notas-section">
      <div className="mis-notas-wrapper">
        {/* HEADER */}
        <div className="mis-notas-header">
          <h2>
            <FiBook />
            Mis Notas
          </h2>
          <p>Consulta tus calificaciones y seguimiento académico.</p>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="alert alert-error">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}

        {/* STATS */}
        {notasFiltradas.length > 0 && (
          <div className="mis-notas-stats">
            <div className="stat-card">
              <div className="stat-icon promedio">
                <FiBarChart2 />
              </div>
              <div className="stat-info">
                <h3>Promedio</h3>
                <div className="valor">{promedio}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon evaluaciones">
                <FiCheckCircle />
              </div>
              <div className="stat-info">
                <h3>Evaluaciones</h3>
                <div className="valor">{notasFiltradas.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* FILTROS */}
        {notas.length > 0 && (
          <div className="mis-notas-filtros">
            <FiFilter style={{ color: "#666" }} />

            {tiposUnicos.length > 0 && (
              <div className="filtro-grupo">
                <label>Tipo:</label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="">Todos</option>
                  {tiposUnicos.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {trimestresUnicos.length > 0 && (
              <div className="filtro-grupo">
                <label>Trimestre:</label>
                <select
                  value={filtroTrimestre}
                  onChange={(e) => setFiltroTrimestre(e.target.value)}
                >
                  <option value="">Todos</option>
                  {trimestresUnicos.map((trim) => (
                    <option key={trim} value={trim}>
                      {trim}°
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* GRID DE NOTAS */}
        {notasFiltradas.length === 0 ? (
          <div className="mis-notas-grid">
            <div className="empty-state">
              <FiBook />
              <p>No tienes notas registradas</p>
            </div>
          </div>
        ) : (
          <div className="mis-notas-grid">
            {notasFiltradas.map((nota, index) => (
              <div key={index} className="mis-notas-card">
                {/* HEADER */}
                <div className="mis-notas-card-header">
                  <h3>{nota.materia}</h3>
                  <span>{nota.tipo}</span>
                </div>

                {/* BODY */}
                <div className="mis-notas-card-body">
                  {/* NOTA GRANDE */}
                  <div className="mis-notas-nota-grande">
                    <span className="numero">{nota.nota || "—"}</span>
                    <span className="label">Calificación</span>
                  </div>

                  {/* INFO */}
                  <div className="mis-notas-info">
                    <div className="mis-notas-info-item">
                      <label>Trimestre:</label>
                      <value>{nota.trimestre || "—"}°</value>
                    </div>

                    {nota.nota !== null && (
                      <div className="mis-notas-info-item">
                        <label>Desempeño:</label>
                        <span className={`badge ${obtenerBadge(nota.nota)}`}>
                          {obtenerTexto(nota.nota)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* DESCRIPCION */}
                  {nota.descripcion && (
                    <div className="mis-notas-descripcion">
                      <strong>Observaciones:</strong>
                      {nota.descripcion}
                    </div>
                  )}

                  {/* FECHA */}
                  {nota.fecha && (
                    <div className="mis-notas-fecha">
                      <FiCalendar />
                      {new Date(nota.fecha).toLocaleDateString("es-ES")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisNotas;