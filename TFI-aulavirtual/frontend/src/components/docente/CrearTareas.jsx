import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/docente.css";
import {
  FiBookOpen,
  FiPlus,
  FiSave,
  FiX,
  FiAlertCircle,
  FiLoader,
  FiCalendar,
  FiFileText,
  FiTrash2,
  FiCheckSquare,
  FiCheckCircle,
} from "react-icons/fi";
import Modal from "../Modal.jsx";

const CrearTareas = () => {
  // Estados principales
  const [materias, setMaterias] = useState([]);
  const [tareas, setTareas] = useState([]);
  
  // Estados de selección
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(1); // Default a 1
  
  // Estados de carga
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [loadingTareas, setLoadingTareas] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  // Estados de formulario
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
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
  }, []);

  // ========================
  // 2️⃣ CARGAR TAREAS
  // ========================
  const cargarTareas = async (id_materia, id_curso) => {
    try {
      setLoadingTareas(true);
      setTareas([]);
      setMateriaSeleccionada(id_materia);
      setCursoSeleccionado(id_curso);

      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:8000/api/tareas?id_materia=${id_materia}&id_curso=${id_curso}`,
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
  // 3️⃣ CREAR TAREA
  // ========================
  const crearTarea = async () => {
    if (!titulo.trim()) {
      mostrarMensaje("error", "El título es obligatorio");
      return;
    }

    try {
      setGuardando(true);
      const token = localStorage.getItem("token");
      
      await axios.post(
        "http://localhost:8000/api/tareas",
        {
          id_materia: materiaSeleccionada,
          id_curso: cursoSeleccionado,
          titulo: titulo.trim(),
          descripcion: descripcion.trim() || null,
          fecha_entrega: fechaEntrega || null,
          fecha_creacion: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      mostrarMensaje("éxito", "Tarea creada correctamente");
      limpiarFormulario();
      setModalOpen(false);
      
      // Recargar tareas
      if (materiaSeleccionada) {
        cargarTareas(materiaSeleccionada);
      }
    } catch (err) {
      mostrarMensaje(
        "error",
        "Error al crear tarea: " + (err.response?.data?.error || err.message)
      );
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  // ========================
  // 4️⃣ ELIMINAR TAREA
  // ========================
  const eliminarTarea = async (id_tarea) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
      return;
    }

    try {
      setGuardando(true);
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `http://localhost:8000/api/tareas/${id_tarea}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      mostrarMensaje("éxito", "Tarea eliminada correctamente");
      
      // Recargar tareas
      if (materiaSeleccionada) {
        cargarTareas(materiaSeleccionada);
      }
    } catch (err) {
      mostrarMensaje(
        "error",
        "Error al eliminar tarea: " + (err.response?.data?.error || err.message)
      );
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  // ========================
  // 5️⃣ AUXILIARES
  // ========================
  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => {
      setMensaje({ tipo: null, texto: "" });
    }, 5000);
  };

  const limpiarFormulario = () => {
    setTitulo("");
    setDescripcion("");
    setFechaEntrega("");
  };

  const cerrarModal = () => {
    setModalOpen(false);
    limpiarFormulario();
  };

  // ========================
  // RENDERS
  // ========================
  return (
    <div className="docente-container">
      <div className="docente-content">
        <div className="page-header">
          <FiFileText className="page-icon" />
          <h1>Crear Tareas</h1>
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
            <div className="header-tareas">
              <div className="seccion-header">
                <FiCheckSquare />
                <h2>Tareas de la Materia</h2>
              </div>
              <button
                className="btn btn-primario"
                onClick={() => setModalOpen(true)}
              >
                <FiPlus /> Nueva Tarea
              </button>
            </div>

            {loadingTareas ? (
              <div className="loading">
                <FiLoader className="spinner" />
                Cargando tareas...
              </div>
            ) : tareas.length === 0 ? (
              <div className="sin-datos">
                <FiAlertCircle />
                No hay tareas creadas. 
                <button 
                  className="btn btn-primario" 
                  onClick={() => setModalOpen(true)}
                  style={{ marginTop: "15px" }}
                >
                  <FiPlus /> Crear Primera Tarea
                </button>
              </div>
            ) : (
              <div className="tareas-lista">
                {tareas.map((tarea) => (
                  <div key={tarea.id_tarea} className="tarea-item">
                    <div className="tarea-header">
                      <h3>{tarea.titulo}</h3>
                      <button
                        className="btn btn-pequeño btn-cancelar"
                        onClick={() => eliminarTarea(tarea.id_tarea)}
                        disabled={guardando}
                        title="Eliminar tarea"
                      >
                        <FiTrash2 />
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
      </div>

      {/* MODAL: CREAR TAREA */}
      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={cerrarModal}>
          <div className="modal-contenido">
            <div className="modal-header">
              <FiFileText />
              <h2>Crear Nueva Tarea</h2>
            </div>
            <div className="formulario">
              <div className="form-group">
                <label htmlFor="titulo">Título *</label>
                <input
                  id="titulo"
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Investigación sobre React"
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe qué deben hacer los alumnos..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fechaEntrega">
                  <FiCalendar className="label-icon" /> Fecha de Entrega
                </label>
                <input
                  id="fechaEntrega"
                  type="date"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                />
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-primario"
                  onClick={crearTarea}
                  disabled={guardando}
                >
                  {guardando ? (
                    <>
                      <FiLoader className="spinner-pequeño" /> Creando...
                    </>
                  ) : (
                    <>
                      <FiSave /> Crear Tarea
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

export default CrearTareas;
