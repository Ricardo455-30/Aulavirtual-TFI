import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/asistencia.css";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiCalendar,
  FiAlertCircle,
  FiLoader,
  FiSave,
  FiUser,
  FiCheck,
  FiX,
  FiInfo,
} from "react-icons/fi";

const AsistenciaDocente = ({ selectedCiclo }) => {
  const [materias, setMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [alumnos, setAlumnos] = useState([]);
  const [asistencia, setAsistencia] = useState({});
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: null, texto: "" });

  // Obtener materias del docente
  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        setLoadingMaterias(true);
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:8000/api/materias/docente",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              id_ciclo: selectedCiclo || undefined,
            },
          }
        );

        setMaterias(res.data);
      } catch (error) {
        mostrarMensaje("error", "Error al cargar materias: " + error.message);
        console.error(error);
      } finally {
        setLoadingMaterias(false);
      }
    };

    fetchMaterias();
  }, [selectedCiclo]);

  // Obtener alumnos según materia
  useEffect(() => {
    const fetchAlumnos = async () => {
      if (!materiaSeleccionada) return;

      try {
        setLoadingAlumnos(true);
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://localhost:8000/api/asistencia/alumnos/${materiaSeleccionada}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              id_ciclo: selectedCiclo || undefined,
            },
          }
        );

        setAlumnos(res.data);

        // Inicializar asistencia
        const estadoInicial = {};
        res.data.forEach((al) => {
          estadoInicial[al.id_alumno] = "presente";
        });
        setAsistencia(estadoInicial);

      } catch (error) {
        mostrarMensaje("error", "Error al cargar alumnos: " + error.message);
        console.error(error);
        setAlumnos([]);
      } finally {
        setLoadingAlumnos(false);
      }
    };

    fetchAlumnos();
  }, [materiaSeleccionada]);

  if (!selectedCiclo) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        <FiInfo size={48} style={{ marginBottom: "16px", opacity: 0.6 }} />
        <h3>Selecciona un ciclo lectivo</h3>
        <p>Elige un ciclo lectivo para gestionar la asistencia.</p>
      </div>
    );
  }

  // Cambiar estado
  const cambiarEstado = (id_alumno, estado) => {
    setAsistencia({
      ...asistencia,
      [id_alumno]: estado,
    });
  };

  // Mostrar mensaje
  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => {
      setMensaje({ tipo: null, texto: "" });
    }, 4000);
  };

  // Guardar asistencia
  const guardarAsistencia = async () => {
    try {
      if (!materiaSeleccionada) {
        mostrarMensaje("error", "Selecciona una materia primero");
        return;
      }

      if (alumnos.length === 0) {
        mostrarMensaje("error", "No hay alumnos para registrar asistencia");
        return;
      }

      setGuardando(true);
      const token = localStorage.getItem("token");

      const payload = {
        dmc_id: materiaSeleccionada,
        fecha,
        id_ciclo: selectedCiclo,
        asistencias: Object.entries(asistencia).map(([alumno_id, estado]) => ({
          alumno_id,
          estado,
        })),
      };

      await axios.post(
        "http://localhost:8000/api/asistencia",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      mostrarMensaje("exito", "Asistencia guardada correctamente");
    } catch (error) {
      mostrarMensaje("error", "Error al guardar asistencia: " + error.message);
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="asistencia-container">
      <div className="asistencia-wrapper">
        {/* HEADER */}
        <div className="asistencia-header">
          <h1 className="asistencia-titulo">
            <FiCheckCircle />
            Registro de Asistencia
          </h1>
          <p className="asistencia-subtitle">
            Marca la asistencia de tus alumnos por fecha y materia
          </p>
        </div>

        {/* ALERTAS */}
        {mensaje.texto && (
          <div className={`alerta alerta-${mensaje.tipo}`}>
            {mensaje.tipo === "exito" ? <FiCheckCircle /> : <FiAlertCircle />}
            {mensaje.texto}
          </div>
        )}

        {/* FILTROS */}
        <div className="asistencia-filtros">
          <div className="filtro-grupo">
            <label className="filtro-label">
              <FiUser style={{ display: "inline", marginRight: "6px" }} />
              Materia
            </label>
            <select
              value={materiaSeleccionada}
              onChange={(e) => setMateriaSeleccionada(e.target.value)}
              className="filtro-select"
            >
              <option value="">Seleccionar materia</option>
              {materias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} - {m.curso} (Año {m.anio})
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label className="filtro-label">
              <FiCalendar style={{ display: "inline", marginRight: "6px" }} />
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="filtro-input"
            />
          </div>

          <div className="asistencia-filtros-info">
            <span className="info-badge">
              {alumnos.length} estudiantes
            </span>
          </div>
        </div>

        {/* TABLA DE ASISTENCIA */}
        {materiaSeleccionada && (
          <div className="tabla-container">
            <h2 className="tabla-titulo">
              <FiCheckCircle />
              {materias.find(m => m.id === materiaSeleccionada)?.nombre}
            </h2>

            {loadingAlumnos ? (
              <div className="loading">
                <FiLoader />
                <span>Cargando alumnos...</span>
              </div>
            ) : alumnos.length === 0 ? (
              <div className="sin-datos">
                <FiUser />
                <p>No hay alumnos en esta materia</p>
              </div>
            ) : (
              <>
                <table className="tabla-asistencia">
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th style={{ textAlign: "center" }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumnos.map((al) => (
                      <tr key={al.id_alumno}>
                        <td className="tabla-alumno">
                          <FiUser style={{ display: "inline", marginRight: "8px" }} />
                          {al.nombre} {al.apellido}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div className="acciones">
                            <button
                              className={`boton-estado ${
                                asistencia[al.id_alumno] === "presente" ? "activo presente" : ""
                              }`}
                              onClick={() => cambiarEstado(al.id_alumno, "presente")}
                              title="Presente"
                            >
                              <FiCheck style={{ display: "inline", marginRight: "4px" }} />
                              Presente
                            </button>

                            <button
                              className={`boton-estado ${
                                asistencia[al.id_alumno] === "ausente" ? "activo ausente" : ""
                              }`}
                              onClick={() => cambiarEstado(al.id_alumno, "ausente")}
                              title="Ausente"
                            >
                              <FiX style={{ display: "inline", marginRight: "4px" }} />
                              Ausente
                            </button>

                            <button
                              className={`boton-estado ${
                                asistencia[al.id_alumno] === "tardanza" ? "activo tardanza" : ""
                              }`}
                              onClick={() => cambiarEstado(al.id_alumno, "tardanza")}
                              title="Tardanza"
                            >
                              <FiClock style={{ display: "inline", marginRight: "4px" }} />
                              Tardanza
                            </button>

                            <button
                              className={`boton-estado ${
                                asistencia[al.id_alumno] === "justificado" ? "activo justificado" : ""
                              }`}
                              onClick={() => cambiarEstado(al.id_alumno, "justificado")}
                              title="Justificado"
                            >
                              <FiAlertCircle style={{ display: "inline", marginRight: "4px" }} />
                              Justificado
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {alumnos.length > 0 && (
                  <button 
                    className="guardar-btn" 
                    onClick={guardarAsistencia}
                    disabled={guardando}
                  >
                    {guardando ? (
                      <>
                        <FiLoader style={{ animation: "spin 1s linear infinite" }} />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <FiSave />
                        Guardar Asistencia
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AsistenciaDocente;