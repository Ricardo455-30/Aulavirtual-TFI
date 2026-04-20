import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/materias.css";
import { 
  FiBookOpen, 
  FiUsers, 
  FiUpload, 
  FiFile, 
  FiDownload, 
  FiEye,
  FiEdit2,
  FiSave,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
  FiInfo
} from "react-icons/fi";
import Modal from "../Modal.jsx";

const MisMaterias = ({ selectedCiclo }) => {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [contenidos, setContenidos] = useState([]);
  const [showContenidos, setShowContenidos] = useState(false);
  const [loadingContenidos, setLoadingContenidos] = useState(false);
  const [editingDescripcion, setEditingDescripcion] = useState(null);
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: null, texto: "" });

  if (!selectedCiclo) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        <FiInfo size={48} style={{ marginBottom: "16px", opacity: 0.6 }} />
        <h3>Selecciona un ciclo lectivo</h3>
        <p>Elige un ciclo lectivo para ver tus materias asignadas.</p>
      </div>
    );
  }

  const openModal = (materia) => {
    setSelectedMateria(materia);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMateria(null);
    setTitulo("");
    setDescripcion("");
    setArchivo(null);
  };

  const verContenidos = async (materia) => {
    setLoadingContenidos(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8000/api/materias/contenidos/${materia.id_materia}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setContenidos(response.data);
      setSelectedMateria(materia);
      setShowContenidos(true);
    } catch (error) {
      console.error("Error al obtener contenidos:", error);
      alert("Error al cargar contenidos");
    } finally {
      setLoadingContenidos(false);
    }
  };

  const cerrarContenidos = () => {
    setShowContenidos(false);
    setContenidos([]);
    setSelectedMateria(null);
  };

  const iniciarEdicionDescripcion = (materia) => {
    setEditingDescripcion(materia.id_materia);
    setNuevaDescripcion(materia.descripcion || "");
  };

  const cancelarEdicion = () => {
    setEditingDescripcion(null);
    setNuevaDescripcion("");
  };

  const guardarDescripcion = async (id_materia) => {
    try {
      setGuardando(true);
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:8000/api/materias/${id_materia}`,
        { descripcion: nuevaDescripcion },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Actualizar la materia en el estado local
      setMaterias(materias.map(m => 
        m.id_materia === id_materia 
          ? { ...m, descripcion: nuevaDescripcion }
          : m
      ));

      setMensaje({ tipo: "exito", texto: "Descripción actualizada correctamente" });
      setTimeout(() => setMensaje({ tipo: null, texto: "" }), 3000);
      setEditingDescripcion(null);
    } catch (error) {
      setMensaje({ tipo: "error", texto: "Error al actualizar descripción: " + (error.response?.data?.error || error.message) });
      console.error("Error al actualizar descripción:", error);
    } finally {
      setGuardando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo || !archivo) {
      alert("Título y archivo son obligatorios");
      return;
    }

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descripcion", descripcion);
    formData.append("id_materia", selectedMateria.id_materia);
    formData.append("archivo", archivo);

    try {
      const token = localStorage.getItem("token");
      if (selectedCiclo) {
        formData.append("id_ciclo", selectedCiclo);
      }
      await axios.post(
        "http://localhost:8000/api/materias/contenidos",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Contenido subido correctamente");
      closeModal();
    } catch (error) {
      console.error("Error al subir contenido:", error);
      console.error("Response data:", error.response?.data);
      alert(`Error al subir contenido: ${error.response?.data?.error || error.message}`);
    }
  };

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
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
        console.error("Error al obtener materias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, [selectedCiclo]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
        <FiLoader style={{ animation: "spin 1s linear infinite", fontSize: "30px", marginBottom: "10px" }} />
        <p>Cargando materias...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px", background: "#f5f7fa", minHeight: "100vh" }}>
      {/* MENSAJES */}
      {mensaje.tipo && (
        <div
          style={{
            background: mensaje.tipo === "exito" ? "#e8f5e9" : "#ffebee",
            border: `2px solid ${mensaje.tipo === "exito" ? "#4CAF50" : "#f44336"}`,
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: mensaje.tipo === "exito" ? "#2e7d32" : "#c62828",
          }}
        >
          {mensaje.tipo === "exito" ? <FiCheckCircle /> : <FiAlertCircle />}
          {mensaje.texto}
        </div>
      )}

      <h1 style={{ marginBottom: "30px", color: "#222", display: "flex", alignItems: "center", gap: "10px" }}>
        <FiBookOpen style={{ fontSize: "28px" }} /> Mis Materias
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "25px",
      }}>
        {materias.length > 0 ? (
          materias.map((m) => (
            <div 
              key={m.id_materia} 
              style={{
                background: "#fff",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              }}
            >
              {/* HEADER MATERIA */}
              <div style={{
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                padding: "20px",
                color: "#fff",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                  <FiBookOpen style={{ fontSize: "24px" }} />
                  <h3 style={{ margin: 0, fontSize: "18px" }}>{m.nombre || m.materia}</h3>
                </div>
                <p style={{ margin: 0, opacity: 0.9, fontSize: "14px" }}>Curso: <strong>{m.curso}</strong></p>
              </div>

              {/* DESCRIPCIÓN */}
              <div style={{ padding: "20px" }}>
                {editingDescripcion === m.id_materia ? (
                  <div style={{ marginBottom: "15px" }}>
                    <textarea
                      value={nuevaDescripcion}
                      onChange={(e) => setNuevaDescripcion(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "2px solid #1976d2",
                        fontFamily: "inherit",
                        fontSize: "14px",
                        minHeight: "80px",
                        resize: "vertical",
                      }}
                      placeholder="Descripción de la materia..."
                    />
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                      <button
                        onClick={() => guardarDescripcion(m.id_materia)}
                        disabled={guardando}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: guardando ? "#ccc" : "#4CAF50",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: guardando ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "5px",
                          fontSize: "14px",
                        }}
                      >
                        {guardando ? <FiLoader style={{ animation: "spin 1s linear infinite" }} /> : <FiSave />}
                        Guardar
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "#f44336",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "5px",
                          fontSize: "14px",
                        }}
                      >
                        <FiX /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: "15px" }}>
                    <p style={{
                      fontSize: "14px",
                      color: "#555",
                      fontStyle: m.descripcion ? "normal" : "italic",
                      color: m.descripcion ? "#555" : "#999",
                      margin: 0,
                      minHeight: "50px",
                    }}>
                      {m.descripcion || "Sin descripción"}
                    </p>
                  </div>
                )}

                {/* BOTONES */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginTop: "15px",
                }}>
                  <button
                    onClick={() => iniciarEdicionDescripcion(m)}
                    style={{
                      padding: "12px",
                      background: "#1976d2",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#1565c0"}
                    onMouseLeave={(e) => e.target.style.background = "#1976d2"}
                  >
                    <FiEdit2 /> Editar
                  </button>

                  <button
                    className="secondary"
                    onClick={() => verContenidos(m)}
                    style={{
                      padding: "12px",
                      background: "#6a1b9a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#5a0e7e"}
                    onMouseLeave={(e) => e.target.style.background = "#6a1b9a"}
                  >
                    <FiEye /> Contenidos
                  </button>

                  <button
                    className="primary"
                    onClick={() => openModal(m)}
                    style={{
                      gridColumn: "1 / -1",
                      padding: "12px",
                      background: "#00897b",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#00695c"}
                    onMouseLeave={(e) => e.target.style.background = "#00897b"}
                  >
                    <FiUpload /> Subir Contenido
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{
            gridColumn: "1 / -1",
            textAlign: "center",
            padding: "60px 20px",
            background: "#fff",
            borderRadius: "12px",
            color: "#999",
          }}>
            <FiBookOpen style={{ fontSize: "48px", marginBottom: "15px", opacity: 0.5 }} />
            <p style={{ fontSize: "16px" }}>No tienes materias asignadas...</p>
          </div>
        )}
      </div>

      {showContenidos && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "80vh",
            overflow: "auto",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px",
              borderBottom: "1px solid #eee",
              position: "sticky",
              top: 0,
              background: "#fff",
            }}>
              <h3 style={{ margin: 0 }}>
                Contenidos: {selectedMateria?.nombre || selectedMateria?.materia}
              </h3>
              <button
                onClick={cerrarContenidos}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              {loadingContenidos ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <FiLoader style={{ animation: "spin 1s linear infinite", fontSize: "30px", color: "#1976d2" }} />
                  <p>Cargando contenidos...</p>
                </div>
              ) : contenidos.length > 0 ? (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "15px",
                }}>
                  {contenidos.map((contenido) => (
                    <div
                      key={contenido.id_contenido}
                      style={{
                        background: "#f9f9f9",
                        border: "1px solid #eee",
                        borderRadius: "8px",
                        padding: "15px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f0f0f0";
                        e.currentTarget.style.borderColor = "#1976d2";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#f9f9f9";
                        e.currentTarget.style.borderColor = "#eee";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <FiFile style={{ marginTop: "4px", color: "#1976d2", flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: "0 0 5px 0", color: "#222" }}>{contenido.titulo}</h4>
                          {contenido.descripcion && (
                            <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#666" }}>
                              {contenido.descripcion}
                            </p>
                          )}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <small style={{ color: "#999" }}>
                              {new Date(contenido.creado_en).toLocaleDateString()}
                            </small>
                            <a
                              href={`http://localhost:8000/uploads/archivos_registros/contenidos/${contenido.archivo}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 12px",
                                background: "#1976d2",
                                color: "#fff",
                                textDecoration: "none",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: "600",
                                transition: "background 0.2s",
                              }}
                              onMouseEnter={(e) => e.target.style.background = "#1565c0"}
                              onMouseLeave={(e) => e.target.style.background = "#1976d2"}
                            >
                              <FiDownload /> Descargar
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                  <FiFile style={{ fontSize: "40px", marginBottom: "10px", opacity: 0.5 }} />
                  <p>No hay contenidos subidos para esta materia.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <Modal title={`Subir Contenido - ${selectedMateria?.nombre || selectedMateria?.materia}`} onClose={closeModal}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                Título: <span style={{ color: "#f44336" }}>*</span>
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #eee",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                placeholder="Ingresa el título del contenido"
                onFocus={(e) => e.target.style.borderColor = "#1976d2"}
                onBlur={(e) => e.target.style.borderColor = "#eee"}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                Descripción:
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #eee",
                  borderRadius: "6px",
                  fontSize: "14px",
                  minHeight: "100px",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                  resize: "vertical",
                }}
                placeholder="Descripción opcional del contenido..."
                onFocus={(e) => e.target.style.borderColor = "#1976d2"}
                onBlur={(e) => e.target.style.borderColor = "#eee"}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                Archivo: <span style={{ color: "#f44336" }}>*</span>
              </label>
              <input
                type="file"
                name="archivo"
                onChange={(e) => setArchivo(e.target.files[0])}
                required
                style={{
                  padding: "12px",
                  border: "2px dashed #1976d2",
                  borderRadius: "6px",
                  cursor: "pointer",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              {archivo && (
                <p style={{ fontSize: "13px", color: "#4CAF50", marginTop: "8px" }}>
                  ✓ {archivo.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              style={{
                padding: "12px 24px",
                background: "#00897b",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.background = "#00695c"}
              onMouseLeave={(e) => e.target.style.background = "#00897b"}
            >
              <FiUpload style={{ marginRight: "8px" }} />
              Subir
            </button>
          </form>
        </Modal>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MisMaterias;