import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/cargarNotas.css";
import {
  FiBookOpen,
  FiUsers,
  FiSave,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiCalendar,
  FiAlertCircle,
  FiLoader,
  FiRefreshCw,
  FiGrid,
} from "react-icons/fi";

const tipoColores = {
  Parcial: "#1976d2",
  Final: "#6a1b9a",
  TP: "#00897b",
  Recuperatorio: "#f57c00",
};

const estadoConfig = {
  Aprobado: { color: "#4CAF50", icon: <FiCheckCircle /> },
  Desaprobado: { color: "#f44336", icon: <FiXCircle /> },
  Cursando: { color: "#9e9e9e", icon: <FiClock /> },
};

const CargarNotas = () => {
  const [materias, setMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [notas, setNotas] = useState({});
  const [tipo, setTipo] = useState("Parcial");
  const [trimestre, setTrimestre] = useState(1);
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  // =========================
  //  MATERIAS
  // =========================
  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        setLoadingMaterias(true);
        setError(null);
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:8000/api/materias/docente",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMaterias(res.data || []);
      } catch (err) {
        setError("Error al cargar materias: " + (err.response?.data?.error || err.message));
        console.error(err);
      } finally {
        setLoadingMaterias(false);
      }
    };

    fetchMaterias();
  }, []);

  // Recargar alumnos cuando cambie tipo o trimestre
  useEffect(() => {
    if (materiaSeleccionada) {
      cargarAlumnos(materiaSeleccionada);
    }
  }, [tipo, trimestre]);

  // =========================
  // 🔹 ALUMNOS
  // =========================
  const cargarAlumnos = async (id) => {
    try {
      setMateriaSeleccionada(id);
      setLoadingAlumnos(true);
      setError(null);

      const token = localStorage.getItem("token");

      // 📌 Primero traer alumnos inscritos en la materia
      const resAlumnos = await axios.get(
        `http://localhost:8000/api/notas/alumnos/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("📥 Alumnos recibidos del servidor:", resAlumnos.data);
      console.log("Cantidad de alumnos:", resAlumnos.data?.length || 0);

      setAlumnos(resAlumnos.data || []);

      // 📌 Luego traer notas específicas para ese tipo y trimestre
      if (resAlumnos.data && resAlumnos.data.length > 0) {
        try {
          const resNotas = await axios.get(
            `http://localhost:8000/api/notas/materia/${id}?tipo=${tipo}&trimestre=${trimestre}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          console.log("📝 Notas recibidas:", resNotas.data);

          // Mapear notas por alumno
          const notasMap = {};
          resNotas.data?.forEach((n) => {
            notasMap[n.id] = {
              nota: n.nota || "",
              descripcion: n.descripcion || "",
              fecha: n.fecha ? n.fecha.split("T")[0] : new Date().toISOString().split("T")[0],
              es_promocion: n.es_promocion || 0,
            };
          });

          // Inicializar notas para todos los alumnos
          const inicial = {};
          resAlumnos.data.forEach((a) => {
            inicial[a.id] = notasMap[a.id] || {
              nota: "",
              descripcion: "",
              fecha: new Date().toISOString().split("T")[0],
              es_promocion: 0,
            };
          });

          setNotas(inicial);
        } catch (err) {
          console.warn("⚠️ Error cargando notas:", err.message);
          // Si hay error, al menos tenemos los alumnos
          const inicial = {};
          resAlumnos.data.forEach((a) => {
            inicial[a.id] = {
              nota: "",
              descripcion: "",
              fecha: new Date().toISOString().split("T")[0],
              es_promocion: 0,
            };
          });
          setNotas(inicial);
        }
      }
    } catch (err) {
      setError("Error al cargar alumnos: " + (err.response?.data?.error || err.message));
      console.error(err);
      setAlumnos([]);
    } finally {
      setLoadingAlumnos(false);
    }
  };

  const handleChange = (id, campo, valor) => {
    setNotas({
      ...notas,
      [id]: { ...notas[id], [campo]: valor },
    });
  };

  const guardarNotas = async () => {
    try {
      if (!materiaSeleccionada) {
        setError("Selecciona una materia primero");
        return;
      }

      if (alumnos.length === 0) {
        setError("No hay alumnos para cargar notas");
        return;
      }

      setGuardando(true);
      setError(null);
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:8000/api/notas",
        { materiaId: materiaSeleccionada, tipo, trimestre, notas },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setExito(true);
      setTimeout(() => setExito(false), 3000);
    } catch (err) {
      setError("Error al guardar: " + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="cargar-notas-container">
      <div className="cargar-notas-wrapper">
        {/* HEADER */}
        <div className="cargar-notas-header">
          <h1 className="cargar-notas-title">
            <FiGrid />
            Carga de Notas
          </h1>
          <p className="cargar-notas-subtitle">
            Selecciona una materia, ingresa las notas de tus alumnos y guarda los cambios
          </p>
        </div>

        {/* ALERTAS */}
        {error && (
          <div className="alerta alerta-error">
            <FiAlertCircle />
            {error}
          </div>
        )}

        {exito && (
          <div className="alerta alerta-exito">
            <FiCheckCircle />
            Notas guardadas correctamente
          </div>
        )}

        {/* FILTROS */}
        <div className="filtros-container">
          <div className="filtros-grid">
            {/* Tipo de Nota */}
            <div className="filtro-grupo">
              <label className="filtro-label">
                <FiBookOpen style={{ display: "inline", marginRight: "6px" }} />
                Tipo de Nota
              </label>
              <select 
                value={tipo} 
                onChange={(e) => setTipo(e.target.value)}
                style={{
                  borderColor: tipoColores[tipo],
                }}
                className="filtro-select"
              >
                <option>Parcial</option>
                <option>Final</option>
                <option>TP</option>
                <option>Recuperatorio</option>
              </select>
            </div>

            {/* Trimestre */}
            <div className="filtro-grupo">
              <label className="filtro-label">
                <FiCalendar style={{ display: "inline", marginRight: "6px" }} />
                Trimestre
              </label>
              <select
                value={trimestre}
                onChange={(e) => setTrimestre(Number(e.target.value))}
                style={{
                  borderColor: "#424242",
                }}
                className="filtro-select"
              >
                <option value={1}>1° Trimestre</option>
                <option value={2}>2° Trimestre</option>
                <option value={3}>3° Trimestre</option>
              </select>
            </div>

            {/* Badges informativos */}
            <div className="filtro-badges">
              <span style={{
                background: tipoColores[tipo],
              }} className="filtro-badge">
                {tipo}
              </span>
              <span style={{
                background: "#424242",
              }} className="filtro-badge">
                {trimestre}° Trimestre
              </span>
            </div>
          </div>
        </div>

        {/* MATERIAS */}
        <div className="materias-section">
          <h2 className="materias-titulo">
            <FiBookOpen /> Mis Materias
          </h2>
          <div className="materias-grid">
            {loadingMaterias ? (
              <div className="materias-loading">
                <FiLoader />
                <span>Cargando materias...</span>
              </div>
            ) : materias.length === 0 ? (
              <div className="materias-empty">
                No tienes materias asignadas
              </div>
            ) : (
              materias.map((m) => (
                <button
                  key={m.id_materia}
                  onClick={() => cargarAlumnos(m.id_materia)}
                  className={`materia-boton ${materiaSeleccionada === m.id_materia ? "activa" : ""}`}
                >
                  <h3 className="materia-boton-titulo">
                    <FiUsers /> {m.nombre}
                  </h3>
                  <p className="materia-boton-info">Curso: {m.curso}</p>
                  <p className="materia-boton-anio">Año {m.anio} • División {m.division}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* TABLA DE NOTAS */}
        {materiaSeleccionada && (
          <div className="tabla-container">
            <h2 className="tabla-titulo">
              <FiGrid />
              {materias.find(m => m.id_materia === materiaSeleccionada)?.nombre}
            </h2>

            {loadingAlumnos ? (
              <div className="tabla-loading">
                <FiLoader />
                <span>Cargando alumnos...</span>
              </div>
            ) : alumnos.length === 0 ? (
              <div className="tabla-empty">
                No hay alumnos en esta materia
              </div>
            ) : (
              <>
                <div className="tabla-wrapper">
                  <table className="tabla-notas">
                    <thead>
                      <tr>
                        <th>Alumno</th>
                        <th style={{ textAlign: "center" }}>Nota</th>
                        <th style={{ textAlign: "center" }}>Estado</th>
                        <th>Descripción</th>
                        <th style={{ textAlign: "center" }}>Fecha</th>
                        <th style={{ textAlign: "center" }}>Promo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alumnos.map((a) => {
                        const estado = estadoConfig[a.estado] || estadoConfig["Cursando"];
                        return (
                          <tr key={a.id}>
                            <td className="tabla-alumno">
                              {a.nombre} {a.apellido}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.5"
                                value={notas[a.id]?.nota || ""}
                                onChange={(e) => handleChange(a.id, "nota", e.target.value)}
                                className="tabla-input tabla-input-nota"
                              />
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <span 
                                className="estado-badge"
                                style={{ background: estado.color }}
                              >
                                {estado.icon} {a.estado}
                              </span>
                            </td>
                            <td>
                              <input
                                type="text"
                                value={notas[a.id]?.descripcion || ""}
                                onChange={(e) => handleChange(a.id, "descripcion", e.target.value)}
                                placeholder="Observaciones..."
                                className="tabla-input tabla-input-descripcion"
                              />
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <input
                                type="date"
                                value={notas[a.id]?.fecha || ""}
                                onChange={(e) => handleChange(a.id, "fecha", e.target.value)}
                                className="tabla-input tabla-input-fecha"
                              />
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={notas[a.id]?.es_promocion === 1}
                                onChange={(e) => handleChange(a.id, "es_promocion", e.target.checked ? 1 : 0)}
                                className="tabla-checkbox"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* BOTONES */}
                <div className="botones-container">
                  <button
                    onClick={() => {
                      setMateriaSeleccionada(null);
                      setAlumnos([]);
                    }}
                    className="boton boton-secundario"
                  >
                    <FiRefreshCw /> Limpiar
                  </button>
                  <button
                    onClick={guardarNotas}
                    disabled={guardando}
                    className="boton boton-primario"
                  >
                    {guardando ? (
                      <>
                        <FiLoader style={{ animation: "spin 1s linear infinite" }} />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <FiSave />
                        Guardar Notas
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CargarNotas;