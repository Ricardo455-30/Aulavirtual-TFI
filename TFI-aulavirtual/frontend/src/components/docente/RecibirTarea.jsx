import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/docente.css";
import {
  FiBookOpen,
  FiFileText,
  FiSave,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiAlertCircle,
  FiLoader,
  FiStar,
  FiUser,
  FiCalendar,
  FiEdit2,
  FiList,
} from "react-icons/fi";
import Modal from "../Modal.jsx";

const RecibirTarea = ({ idCiclo }) => {
  // Estados principales
  const [materias, setMaterias] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [entregas, setEntregas] = useState([]);
  
  // Estados de selección
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [entregaSeleccionada, setEntregaSeleccionada] = useState(null);
  
  // Estados de carga
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [loadingTareas, setLoadingTareas] = useState(false);
  const [loadingEntregas, setLoadingEntregas] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  // Estados de formulario
  const [nota, setNota] = useState("");
  const [comentario, setComentario] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  
  // Estados de mensajes
  const [mensaje, setMensaje] = useState({ tipo: null, texto: "" });

  // ========================
  // 1️⃣ CARGAR MATERIAS
  // ========================
  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        setLoadingMaterias(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:8000/api/materias/docente",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMaterias(res.data || []);
      } catch (err) {
        mostrarMensaje(
          "error",
          "Error al cargar materias: " + (err.response?.data?.error || err.message)
        );
        console.error(err);
      } finally {
        setLoadingMaterias(false);
      }
    };

    fetchMaterias();
  }, [idCiclo]);

  // ========================
  // 2️⃣ CARGAR TAREAS
  // ========================
  const cargarTareas = async (id_materia, id_curso) => {
    try {
      setLoadingTareas(true);
      setTareas([]);
      setEntregas([]);
      setMateriaSeleccionada(id_materia);
      setCursoSeleccionado(id_curso);
      setTareaSeleccionada(null);

      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:8000/api/tareas?id_materia=${id_materia}&id_curso=${id_curso}&id_ciclo=${idCiclo}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTareas(res.data || []);
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
  // 3️⃣ CARGAR ENTREGAS (CON DATOS DEL ALUMNO)
  // ========================
  const cargarEntregas = async (id_tarea) => {
    try {
      setLoadingEntregas(true);
      setEntregas([]);
      setTareaSeleccionada(id_tarea);

      const token = localStorage.getItem("token");
      // El endpoint debe retornar entregas con datos del alumno (INNER JOIN)
      const res = await axios.get(
        `http://localhost:8000/api/entregas/tarea/${id_tarea}?with_alumno=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Asegurar que cada entrega tiene los datos del alumno
      const entregasConAlumno = (res.data || []).map(e => ({
        ...e,
        alumno_nombre: e.alumno_nombre || e.nombre || "Desconocido",
        alumno_email: e.alumno_email || e.email || "sin-email"
      }));
      setEntregas(entregasConAlumno);
    } catch (err) {
      mostrarMensaje(
        "error",
        "Error al cargar entregas: " + (err.response?.data?.error || err.message)
      );
      console.error(err);
    } finally {
      setLoadingEntregas(false);
    }
  };

  // ========================
  // 4️⃣ CALIFICAR ENTREGA
  // ========================
  const calificarEntrega = async (id_entrega) => {
    if (!nota || nota < 0 || nota > 10) {
      mostrarMensaje("error", "La nota debe estar entre 0 y 10");
      return;
    }

    try {
      setGuardando(true);
      const token = localStorage.getItem("token");
      
      await axios.put(
        `http://localhost:8000/api/entregas/${id_entrega}/calificar`,
        {
          nota: parseFloat(nota),
          comentario: comentario || "",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      mostrarMensaje("éxito", "Entrega calificada correctamente");
      setNota("");
      setComentario("");
      setModalOpen(false);
      
      // Recargar entregas
      if (tareaSeleccionada) {
        cargarEntregas(tareaSeleccionada);
      }
    } catch (err) {
      mostrarMensaje(
        "error",
        "Error al calificar: " + (err.response?.data?.error || err.message)
      );
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  // ========================
  // 5️⃣ DESCARGAR ARCHIVO
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
  // 6️⃣ AUXILIARES
  // ========================
  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => {
      setMensaje({ tipo: null, texto: "" });
    }, 5000);
  };

  const abrirModalCalificar = (entrega) => {
    setEntregaSeleccionada(entrega);
    setNota(entrega.nota ? entrega.nota.toString() : "");
    setComentario(entrega.comentario || "");
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEntregaSeleccionada(null);
    setNota("");
    setComentario("");
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
      Pendiente: "Pendiente",
      Entregado: "Entregado",
      Corregido: "Corregido",
    };
    return labels[estado] || estado;
  };

  const obtenerEstadoIcono = (estado) => {
    const iconos = {
      Pendiente: <FiClock />,
      Entregado: <FiDownload />,
      Corregido: <FiCheckCircle />,
    };
    return iconos[estado] || null;
  };

  // ========================
  // RENDERS
  // ========================
  return (
    <div className="docente-container">
      <div className="docente-content">
        <div className="page-header">
          <FiList className="page-icon" />
          <h1>Recibir Tareas</h1>
        </div>

        {/* MENSAJE DE ESTADO */}
        {mensaje.texto && (
          <div className={`mensaje mensaje-${mensaje.tipo}`}>
            {mensaje.tipo === "éxito" ? <FiCheckCircle /> : <FiAlertCircle />}
            {mensaje.texto}
          </div>
        )}

        {/* SECCIÓN: SELECCIONAR MATERIA */}
        <div className="seccion-tareas">
          <div className="seccion-header">
            <FiBookOpen />
            <h2>Mis Materias</h2>
          </div>
          {loadingMaterias ? (
            <div className="loading">
              <FiLoader className="spinner" />
              Cargando materias...
            </div>
          ) : materias.length === 0 ? (
            <div className="sin-datos">
              <FiAlertCircle />
              No tienes materias asignadas
            </div>
          ) : (
            <div className="materias-grid">
              {materias.map((materia) => (
                <div
                  key={materia.id_materia}
                  className="materia-card"
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
            <div className="seccion-header">
              <FiFileText />
              <h2>Tareas de la Materia</h2>
            </div>
            {loadingTareas ? (
              <div className="loading">
                <FiLoader className="spinner" />
                Cargando tareas...
              </div>
            ) : tareas.length === 0 ? (
              <div className="sin-datos">
                <FiFileText />
                No hay tareas creadas
              </div>
            ) : (
              <div className="tareas-lista">
                {tareas.map((tarea) => (
                  <div
                    key={tarea.id_tarea}
                    className={`tarea-item ${
                      tareaSeleccionada === tarea.id_tarea ? "activa" : ""
                    }`}
                  >
                    <div className="tarea-header">
                      <h3>{tarea.titulo}</h3>
                      <button
                        className="btn btn-secundario"
                        onClick={() => cargarEntregas(tarea.id_tarea)}
                      >
                        Ver Entregas
                      </button>
                    </div>
                    {tarea.descripcion && (
                      <p className="descripcion">{tarea.descripcion}</p>
                    )}
                    {tarea.fecha_entrega && (
                      <div className="fecha">
                        <FiCalendar /> Vence: {new Date(tarea.fecha_entrega).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN: ENTREGAS */}
        {tareaSeleccionada && (
          <div className="seccion-tareas">
            <div className="seccion-header">
              <FiDownload />
              <h2>Entregas Recibidas</h2>
            </div>
            {loadingEntregas ? (
              <div className="loading">
                <FiLoader className="spinner" />
                Cargando entregas...
              </div>
            ) : entregas.length === 0 ? (
              <div className="sin-datos">
                <FiAlertCircle />
                No hay entregas aún
              </div>
            ) : (
              <div className="entregas-tabla">
                <div className="tabla-header">
                  <div className="col-alumno">Alumno</div>
                  <div className="col-estado">Estado</div>
                  <div className="col-fecha">Fecha Entrega</div>
                  <div className="col-nota">Nota</div>
                  <div className="col-acciones">Acciones</div>
                </div>

                {entregas.map((entrega) => (
                  <div key={entrega.id_entrega} className="tabla-fila">
                    <div className="col-alumno">
                      <FiUser /> {entrega.alumno_nombre}
                      <br />
                      <small>{entrega.alumno_email}</small>
                    </div>
                    <div className="col-estado">
                      <span
                        className="estado-badge"
                        style={{ backgroundColor: obtenerEstadoColor(entrega.estado) }}
                      >
                        {obtenerEstadoIcono(entrega.estado)}
                        {obtenerEstadoLabel(entrega.estado)}
                      </span>
                    </div>
                    <div className="col-fecha">
                      {entrega.fecha_entrega
                        ? new Date(entrega.fecha_entrega).toLocaleDateString()
                        : "-"}
                    </div>
                    <div className="col-nota">
                      {entrega.nota ? (
                        <span className="nota-badge">
                          <FiStar /> {entrega.nota}/10
                        </span>
                      ) : (
                        <span className="sin-nota">Sin calificar</span>
                      )}
                    </div>
                    <div className="col-acciones">
                      {entrega.archivo && (
                        <button
                          className="btn btn-pequeño btn-descarga"
                          onClick={() => descargarArchivo(entrega.id_entrega)}
                          title="Descargar archivo"
                        >
                          <FiDownload />
                        </button>
                      )}
                      <button
                        className="btn btn-pequeño btn-calificar"
                        onClick={() => abrirModalCalificar(entrega)}
                      >
                        <FiEdit2 /> Calificar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: CALIFICAR */}
      {modalOpen && entregaSeleccionada && (
        <Modal isOpen={modalOpen} onClose={cerrarModal}>
          <div className="modal-contenido">
            <div className="modal-header">
              <FiEdit2 />
              <h2>Calificar Entrega</h2>
            </div>
            <div className="formulario">
              <div className="form-group">
                <label>
                  Alumno: <strong>{entregaSeleccionada.alumno_nombre}</strong>
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="nota">Nota (0-10) *</label>
                <input
                  id="nota"
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Ej: 8.5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="comentario">Comentarios</label>
                <textarea
                  id="comentario"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Feedback para el alumno..."
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-primario"
                  onClick={() => calificarEntrega(entregaSeleccionada.id_entrega)}
                  disabled={guardando}
                >
                  {guardando ? (
                    <>
                      <FiLoader className="spinner-pequeño" /> Guardando...
                    </>
                  ) : (
                    <>
                      <FiSave /> Guardar Calificación
                    </>
                  )}
                </button>
                <button
                  className="btn btn-cancelar"
                  onClick={cerrarModal}
                  disabled={guardando}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RecibirTarea;
