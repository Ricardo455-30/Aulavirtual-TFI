import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/alumnoEnviarTareas.css";
import {
  FiBookOpen,
  FiFileText,
  FiUpload,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiAlertCircle,
  FiLoader,
  FiStar,
  FiCalendar,
  FiMessageSquare,
  FiFile,
  FiX,
  FiEye,
} from "react-icons/fi";
import Modal from "../Modal.jsx";

const EnviarTareas = () => {
  // Estados principales
  const [materias, setMaterias] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [entregas, setEntregas] = useState({});
  
  // Estados de selección
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  
  // Estados de carga
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [loadingTareas, setLoadingTareas] = useState(false);
  const [enviando, setEnviando] = useState(false);
  
  // Estados de formulario
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [comentario, setComentario] = useState("");
  const [tareaActiva, setTareaActiva] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEntregaOpen, setModalEntregaOpen] = useState(false);
  const [entregaVisualizando, setEntregaVisualizando] = useState(null);
  
  // Estados de mensajes
  const [mensaje, setMensaje] = useState({ tipo: null, texto: "" });

  // ========================
  // CARGAR INFORMACIÓN DEL ALUMNO
  // ========================
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setLoadingMaterias(true);
        const token = localStorage.getItem("token");
        
        // Obtener materias del alumno
        const resMaterias = await axios.get(
          "http://localhost:8000/api/alumnos/mis-materias",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMaterias(resMaterias.data || []);
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message;
        console.error("Error completo:", err);
        console.error("Respuesta del servidor:", err.response?.data);
        mostrarMensaje(
          "error",
          "Error al cargar materias: " + errorMsg
        );
      } finally {
        setLoadingMaterias(false);
      }
    };

    fetchDatos();
  }, []);

  // ========================
  // CARGAR TAREAS DEL ALUMNO
  // ========================
  const cargarTareas = async (id_materia, id_curso) => {
    try {
      setLoadingTareas(true);
      setTareas([]);
      setMateriaSeleccionada(id_materia);
      setCursoSeleccionado(id_curso);

      const token = localStorage.getItem("token");
      
      // Obtener tareas del alumno (con estado de entregas incluido)
      const res = await axios.get(
        `http://localhost:8000/api/entregas/tareas/${id_materia}/${id_curso}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const tareasData = res.data || [];
      setTareas(tareasData);

      // Mapear entregas por id_tarea para acceso rápido
      const entregasMap = {};
      tareasData.forEach((tarea) => {
        // Si tiene entrega asociada, guardarla
        if (tarea.entrega) {
          entregasMap[tarea.id_tarea] = tarea.entrega;
        }
      });
      setEntregas(entregasMap);
    } catch (err) {
      mostrarMensaje(
        "error",
        "Error al cargar tareas: " + (err.response?.data?.error || err.message)
      );
      console.error(err);
    } finally {
      setLoadingTareas(false);
    }
  };

  // ========================
  // SUBIR/ACTUALIZAR TAREA
  // ========================
  const enviarTarea = async (id_tarea) => {
    if (!archivoSeleccionado && !comentario) {
      mostrarMensaje("error", "Debes subir un archivo o agregar un comentario");
      return;
    }

    try {
      setEnviando(true);
      const token = localStorage.getItem("token");

      // Crear FormData para enviar archivo + comentario
      const formData = new FormData();
      formData.append("id_tarea", id_tarea);
      if (archivoSeleccionado) {
        formData.append("archivo", archivoSeleccionado);
      }
      if (comentario) {
        formData.append("comentario", comentario);
      }

      console.log("Enviando tarea:");
      console.log("  - id_tarea:", id_tarea);
      console.log("  - archivo:", archivoSeleccionado?.name || "sin archivo");
      console.log("  - comentario:", comentario);

      const res = await axios.post(
        "http://localhost:8000/api/entregas",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Respuesta del servidor:", res.data);

      mostrarMensaje("success", "Tarea entregada correctamente");
      
      // Limpiar formulario y recargar
      setArchivoSeleccionado(null);
      setComentario("");
      setModalOpen(false);
      setTareaActiva(null);
      
      // Recargar tareas
      if (materiaSeleccionada && cursoSeleccionado) {
        cargarTareas(materiaSeleccionada, cursoSeleccionado);
      }
    } catch (err) {
      console.error("Error completo:", err);
      console.error("Response:", err.response?.data);
      console.error("Status:", err.response?.status);
      mostrarMensaje(
        "error",
        "Error al enviar tarea: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setEnviando(false);
    }
  };

  // ========================
  // DESCARGAR ARCHIVO
  // ========================
  const descargarArchivo = async (id_entrega) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/entregas/descargar/${id_entrega}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        mostrarMensaje("error", error.error || "Error al descargar archivo");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tarea_${id_entrega}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      mostrarMensaje("success", "Archivo descargado correctamente");
    } catch (err) {
      mostrarMensaje("error", "Error al descargar archivo");
      console.error("Error en descargarArchivo:", err);
    }
  };

  // ========================
  // ELIMINAR ENTREGA
  // ========================
  const eliminarEntrega = async (id_entrega) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta entrega?")) {
      return;
    }

    try {
      setEnviando(true);
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `http://localhost:8000/api/entregas/${id_entrega}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      mostrarMensaje("success", "Entrega eliminada correctamente");
      setModalEntregaOpen(false);
      
      // Recargar tareas
      if (materiaSeleccionada && cursoSeleccionado) {
        cargarTareas(materiaSeleccionada, cursoSeleccionado);
      }
    } catch (err) {
      mostrarMensaje(
        "error",
        "Error al eliminar entrega: " + (err.response?.data?.error || err.message)
      );
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  // ========================
  // AUXILIARES
  // ========================
  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => {
      setMensaje({ tipo: null, texto: "" });
    }, 5000);
  };

  const abrirModalEnvio = (tarea) => {
    setTareaActiva(tarea);
    setArchivoSeleccionado(null);
    setComentario("");
    setModalOpen(true);
  };

  const cerrarModalEnvio = () => {
    setModalOpen(false);
    setTareaActiva(null);
    setArchivoSeleccionado(null);
    setComentario("");
  };

  const abrirModalEntrega = (tarea) => {
    setEntregaVisualizando(tarea);
    setModalEntregaOpen(true);
  };

  const cerrarModalEntrega = () => {
    setModalEntregaOpen(false);
    setEntregaVisualizando(null);
  };

  const obtenerEstadoColor = (estado) => {
    const colores = {
      Pendiente: "#FF9800",
      Entregado: "#2196F3",
      Corregido: "#4CAF50",
    };
    return colores[estado] || "#9E9E9E";
  };

  const obtenerEstadoLabel = (estado) => {
    const labels = {
      Pendiente: "⏳ Pendiente",
      Entregado: "📤 Entregado",
      Corregido: "✅ Corregido",
    };
    return labels[estado] || estado;
  };

  const verificarVencida = (fecha_entrega) => {
    if (!fecha_entrega) return false;
    return new Date(fecha_entrega) < new Date();
  };

  // ========================
  // RENDERS
  // ========================
  return (
    <div className="alumno-container">
      <div className="alumno-content">
        {/* SECCIÓN: SELECCIONAR MATERIA */}
        <div className="seccion-tareas">
          <h2><FiBookOpen /> Mis Materias</h2>
          {loadingMaterias ? (
            <div className="loading">
              <FiLoader className="spinner" />
              Cargando materias...
            </div>
          ) : materias.length === 0 ? (
            <div className="sin-datos">
              <FiAlertCircle />
              No tienes materias inscritas
            </div>
          ) : (
            <div className="materias-grid">
              {materias.map((materia) => (
                <div
                  key={materia.id_materia}
                  className={`materia-card ${
                    materiaSeleccionada === materia.id_materia ? "activa" : ""
                  }`}
                  onClick={() => cargarTareas(materia.id_materia, materia.id_curso)}
                >
                  <div className="materia-icon">
                    <FiBookOpen />
                  </div>
                  <h3>{materia.nombre}</h3>
                  {materia.descripcion && (
                    <p className="descripcion">{materia.descripcion}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECCIÓN: TAREAS */}
        {materiaSeleccionada && (
          <div className="seccion-tareas">
            <h2><FiFileText /> Tareas Disponibles</h2>
            {loadingTareas ? (
              <div className="loading">
                <FiLoader className="spinner" />
                Cargando tareas...
              </div>
            ) : tareas.length === 0 ? (
              <div className="sin-datos">
                <FiFileText />
                No hay tareas en esta materia
              </div>
            ) : (
              <div className="tareas-lista-alumno">
                {tareas.map((tarea) => {
                  const entrega = entregas[tarea.id_tarea];
                  const vencida = verificarVencida(tarea.fecha_entrega);

                  return (
                    <div
                      key={tarea.id_tarea}
                      className={`tarea-card-alumno ${
                        entrega ? `estado-${entrega.estado.toLowerCase()}` : ""
                      } ${vencida ? "vencida" : ""}`}
                    >
                      <div className="tarea-header-alumno">
                        <div className="tarea-info">
                          <h3>{tarea.titulo}</h3>
                          {tarea.descripcion && (
                            <p className="descripcion">{tarea.descripcion}</p>
                          )}
                        </div>
                        {entrega && (
                          <span
                            className="estado-badge"
                            style={{ backgroundColor: obtenerEstadoColor(entrega.estado) }}
                          >
                            {obtenerEstadoLabel(entrega.estado)}
                          </span>
                        )}
                      </div>

                      <div className="tarea-meta">
                        {tarea.fecha_entrega && (
                          <div className={`fecha ${vencida ? "vencida" : ""}`}>
                            <FiCalendar />
                            <span>Vence: {new Date(tarea.fecha_entrega).toLocaleDateString()}</span>
                            {vencida && <span className="badge-vencida">Vencida</span>}
                          </div>
                        )}
                      </div>

                      <div className="tarea-acciones-alumno">
                        {entrega ? (
                          <>
                            <button
                              className="btn btn-pequeño btn-ver"
                              onClick={() => abrirModalEntrega(tarea)}
                            >
                              <FiEye /> Ver Entrega
                            </button>
                            {entrega.estado !== "Corregido" && (
                              <button
                                className="btn btn-pequeño btn-actualizar"
                                onClick={() => abrirModalEnvio(tarea)}
                              >
                                <FiUpload /> Actualizar
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            className="btn btn-pequeño btn-enviar"
                            onClick={() => abrirModalEnvio(tarea)}
                            disabled={vencida}
                          >
                            <FiUpload /> Enviar
                          </button>
                        )}
                      </div>

                      {entrega?.nota && (
                        <div className="calificacion-badge">
                          <FiStar /> Calificación: <strong>{entrega.nota}/10</strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: ENVIAR TAREA */}
      {modalOpen && tareaActiva && (
        <Modal isOpen={modalOpen} onClose={cerrarModalEnvio}>
          <div className="modal-contenido">
            <h2><FiUpload /> Enviar Tarea</h2>
            <div className="formulario">
              <div className="form-group">
                <label>
                  Tarea: <strong>{tareaActiva.titulo}</strong>
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="archivo">
                  <FiFile /> Archivo
                  <span className="opcional">(opcional)</span>
                </label>
                <div className="input-archivo">
                  <input
                    id="archivo"
                    type="file"
                    onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
                    style={{ display: "none" }}
                  />
                  <div 
                    className="file-info"
                    onClick={() => document.getElementById("archivo").click()}
                    style={{ cursor: "pointer" }}
                  >
                    {archivoSeleccionado ? (
                      <>
                        <FiFile /> {archivoSeleccionado.name}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setArchivoSeleccionado(null);
                          }}
                          className="btn-limpiar"
                        >
                          <FiX />
                        </button>
                      </>
                    ) : (
                      <>
                        <FiUpload /> Haz clic para seleccionar archivo
                        <span className="tamaño-max">(Máx 10MB)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="comentario">
                  <FiMessageSquare /> Comentarios
                  <span className="opcional">(opcional)</span>
                </label>
                <textarea
                  id="comentario"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Agrrega notas sobre tu entrega..."
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-primario"
                  onClick={() => enviarTarea(tareaActiva.id_tarea)}
                  disabled={enviando}
                >
                  {enviando ? (
                    <>
                      <FiLoader className="spinner-pequeño" /> Enviando...
                    </>
                  ) : (
                    <>
                      <FiUpload /> Enviar Tarea
                    </>
                  )}
                </button>
                <button
                  className="btn btn-cancelar"
                  onClick={cerrarModalEnvio}
                  disabled={enviando}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: VER ENTREGA */}
      {modalEntregaOpen && entregaVisualizando && entregas[entregaVisualizando.id_tarea] && (
        <Modal isOpen={modalEntregaOpen} onClose={cerrarModalEntrega}>
          <div className="modal-contenido">
            <h2><FiDownload /> Detalles de Entrega</h2>
            <div className="entrega-detalles">
              <div className="detalle-row">
                <label>Tarea:</label>
                <span>{entregaVisualizando.titulo}</span>
              </div>

              <div className="detalle-row">
                <label>Estado:</label>
                <span
                  className="estado-badge"
                  style={{
                    backgroundColor: obtenerEstadoColor(entregas[entregaVisualizando.id_tarea].estado),
                  }}
                >
                  {obtenerEstadoLabel(entregas[entregaVisualizando.id_tarea].estado)}
                </span>
              </div>

              <div className="detalle-row">
                <label>Fecha de Entrega:</label>
                <span>
                  {entregas[entregaVisualizando.id_tarea].fecha_entrega
                    ? new Date(entregas[entregaVisualizando.id_tarea].fecha_entrega).toLocaleString()
                    : "-"}
                </span>
              </div>

              {entregas[entregaVisualizando.id_tarea].archivo && (
                <div className="detalle-row">
                  <label>Archivo:</label>
                  <button
                    className="btn btn-pequeño btn-descarga"
                    onClick={() =>
                      descargarArchivo(entregas[entregaVisualizando.id_tarea].id_entrega)
                    }
                  >
                    <FiDownload /> Descargar
                  </button>
                </div>
              )}

              {entregas[entregaVisualizando.id_tarea].comentario && (
                <div className="detalle-row">
                  <label>Tu Comentario:</label>
                  <p className="comentario-text">
                    {entregas[entregaVisualizando.id_tarea].comentario}
                  </p>
                </div>
              )}

              {entregas[entregaVisualizando.id_tarea].nota && (
                <div className="detalle-row calificado">
                  <label>Calificación:</label>
                  <span className="nota-grande">
                    {entregas[entregaVisualizando.id_tarea].nota}/10
                  </span>
                </div>
              )}

              <div className="form-actions">
                {entregas[entregaVisualizando.id_tarea].estado !== "Corregido" && (
                  <>
                    <button
                      className="btn btn-actualizar"
                      onClick={() => {
                        cerrarModalEntrega();
                        abrirModalEnvio(entregaVisualizando);
                      }}
                    >
                      <FiUpload /> Actualizar Entrega
                    </button>
                    <button
                      className="btn btn-cancelar"
                      onClick={() => {
                        eliminarEntrega(entregas[entregaVisualizando.id_tarea].id_entrega);
                      }}
                      disabled={enviando}
                    >
                      {enviando ? (
                        <>
                          <FiLoader className="spinner-pequeño" /> Eliminando...
                        </>
                      ) : (
                        <>
                          <FiX /> Eliminar
                        </>
                      )}
                    </button>
                  </>
                )}
                <button className="btn btn-secundario" onClick={cerrarModalEntrega}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EnviarTareas;
