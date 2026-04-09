import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/materias.css";
import { FiBookOpen, FiUsers, FiUpload, FiFile, FiDownload, FiEye } from "react-icons/fi";
import Modal from "../Modal.jsx";

const MisMaterias = () => {
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
  }, []);

  if (loading) {
    return <p className="loading">Cargando materias...</p>;
  }

  return (
    <div className="materias-container">
      <h2>Mis Materias</h2>

      <div className="materias-grid">
        {materias.length > 0 ? (
          materias.map((m) => (
            <div key={m.id} className="materia-card">
              <div className="materia-header">
                <FiBookOpen />
                <h3>{m.materia}</h3>
              </div>

              <p className="curso">
                Curso: <strong>{m.curso}</strong>
              </p>

              <div className="materia-actions">
                <button>
                  <FiUsers /> Ver alumnos
                </button>

                <button className="secondary" onClick={() => verContenidos(m)}>
                  <FiEye /> Ver contenidos
                </button>

                <button className="primary" onClick={() => openModal(m)}>
                  <FiUpload /> Subir Contenido
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No tienes materias asignadas.</p>
        )}
      </div>

      {showContenidos && (
        <div className="contenidos-container">
          <div className="contenidos-header">
            <h3>Contenidos de {selectedMateria?.materia} - {selectedMateria?.curso}</h3>
            <button className="cerrar-btn" onClick={cerrarContenidos}>×</button>
          </div>

          {loadingContenidos ? (
            <p className="loading">Cargando contenidos...</p>
          ) : contenidos.length > 0 ? (
            <div className="contenidos-grid">
              {contenidos.map((contenido) => (
                <div key={contenido.id_contenido} className="contenido-card">
                  <div className="contenido-header">
                    <FiFile />
                    <h4>{contenido.titulo}</h4>
                  </div>

                  {contenido.descripcion && (
                    <p className="contenido-descripcion">{contenido.descripcion}</p>
                  )}

                  <div className="contenido-footer">
                    <small>Subido: {new Date(contenido.creado_en).toLocaleDateString()}</small>
                    <a
                      href={`http://localhost:8000/uploads/archivos_registros/contenidos/${contenido.archivo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn"
                    >
                      <FiDownload /> Descargar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-contenidos">No hay contenidos subidos para esta materia.</p>
          )}
        </div>
      )}

      {modalOpen && (
        <Modal title="Subir Contenido" onClose={closeModal}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Título:</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Descripción:</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Archivo:</label>
              <input
                type="file"
                name="archivo"
                onChange={(e) => setArchivo(e.target.files[0])}
                required
              />
            </div>

            <button type="submit" className="btn-submit">
              Subir
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MisMaterias;