import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/alumnoInscripcionMaterias.css";
import {
  FiBook,
  FiAlertCircle,
  FiLoader,
  FiCheckCircle,
  FiUserPlus,
} from "react-icons/fi";

const InscripcionMaterias = ({ idCiclo }) => {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: null, texto: "" });

  useEffect(() => {
    const fetchMaterias = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/api/alumnos/materias-disponibles", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMaterias(res.data);
      } catch (error) {
        console.error("Error al cargar materias", error);
        setError("No se pudieron cargar las materias. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  const inscribirse = async (id_materia) => {
    try {
      setSubmittingId(id_materia);
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8000/api/alumnos/inscribirse/${id_materia}`,
        { id_ciclo: idCiclo },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMaterias((prev) => prev.filter((materia) => materia.id_materia !== id_materia));
      setMensaje({ tipo: "success", texto: "¡Inscripción exitosa!" });
      setError(null);
      setTimeout(() => setMensaje({ tipo: null, texto: "" }), 5000);
    } catch (error) {
      console.error("Error al inscribirse", error);
      const errorMsg = error.response?.data?.error || "No se pudo completar la inscripción. Intenta de nuevo.";
      setError(errorMsg);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <section className="inscripcion-section">
      <div className="inscripcion-header">
        <div>
          <h2>
            <FiBook /> Materias Disponibles
          </h2>
          <p>Seleccioná una materia para cursar y al inscribirte la eliminamos de esta lista.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <FiAlertCircle />
          {error}
        </div>
      )}

      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo}`}>
          <FiCheckCircle />
          {mensaje.texto}
        </div>
      )}

      {loading ? (
        <div className="inscripcion-empty">
          <FiLoader className="spinner" />
          Cargando materias disponibles...
        </div>
      ) : materias.length === 0 ? (
        <div className="inscripcion-empty">
          <FiCheckCircle />
          No hay materias disponibles para inscribir en este momento.
        </div>
      ) : (
        <div className="inscripcion-grid">
          {materias.map((m) => (
            <div className="inscripcion-card" key={m.id_materia}>
              <div className="inscripcion-card-top">
                <span className="materia-tag">
                  <FiBook /> Materia
                </span>
                <span className="materia-id">#{m.id_materia}</span>
              </div>
              <h3>{m.nombre}</h3>
              <p>{m.descripcion || "Una nueva formación para mejorar tus conocimientos."}</p>
              <div className="inscripcion-actions">
                <button
                  className="btn btn-primary"
                  disabled={submittingId === m.id_materia}
                  onClick={() => inscribirse(m.id_materia)}
                >
                  {submittingId === m.id_materia ? (
                    <>
                      <FiLoader className="spinner" /> Inscribiendo...
                    </>
                  ) : (
                    <>
                      <FiUserPlus /> Inscribirme
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default InscripcionMaterias;