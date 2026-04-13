import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUsers,
  FiBook,
  FiCheck,
  FiAlertCircle,
  FiChevronDown,
  FiArrowRight,
  FiLoader,
} from "react-icons/fi";
import "../../css/AsignarCurso.css";

const AsignarCurso = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [selectedAlumno, setSelectedAlumno] = useState("");
  const [selectedCurso, setSelectedCurso] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const alumnoSeleccionado = alumnos.find(
    (a) => String(a.id_alumno) === String(selectedAlumno)
  );
  const cursoSeleccionado = cursos.find(
    (c) => String(c.id_curso) === String(selectedCurso)
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [alumnosRes, cursosRes] = await Promise.all([
          axios.get("http://localhost:8000/api/alumnos", { headers }),
          axios.get("http://localhost:8000/api/cursos", { headers }),
        ]);

        setAlumnos(alumnosRes.data || []);
        setCursos(cursosRes.data || []);
      } catch (err) {
        console.error("Error al cargar alumnos o cursos", err);
        setError(
          "No se pudieron cargar los alumnos o cursos. Volvé a intentar más tarde."
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!selectedAlumno || !selectedCurso) {
      setError("Seleccioná un alumno y un curso antes de continuar.");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(
        "http://localhost:8000/api/relaciones/alumno-curso",
        {
          id_alumno: selectedAlumno,
          id_curso: selectedCurso,
        },
        { headers }
      );

      setMessage(
        `✓ Curso asignado correctamente a ${alumnoSeleccionado ? `${alumnoSeleccionado.nombre} ${alumnoSeleccionado.apellido}` : "el alumno"}`
      );

      // Limpiar después de 2s
      setTimeout(() => {
        setSelectedAlumno("");
        setSelectedCurso("");
        setMessage("");
      }, 2000);
    } catch (err) {
      console.error("Error al asignar curso", err);
      setError(
        err.response?.data?.error ||
          "No se pudo asignar el curso. Intentá de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="asignar-loading">
        <div className="loader-spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="asignar-curso-container">
      {/* Header */}
      <div className="asignar-header">
        <div className="header-content">
          <h1 className="asignar-title">
            <FiBook className="title-icon" />
            Asignar Curso
          </h1>
          <p className="asignar-subtitle">
            Asigna o cambia el curso de un alumno. Si ya tiene asignado un
            curso, será reemplazado.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="alert alert-success">
          <FiCheck className="alert-icon" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          <FiAlertCircle className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form className="asignar-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Selección de Alumno */}
          <div className="form-group">
            <label className="form-label">
              <FiUsers className="label-icon" />
              Selecciona un Alumno
            </label>
            <div className="select-wrapper">
              <select
                className="form-select"
                id="alumno"
                value={selectedAlumno}
                onChange={(e) => setSelectedAlumno(e.target.value)}
                required
              >
                <option value="">-- Elige un alumno --</option>
                {alumnos.map((alumno) => (
                  <option key={alumno.id_alumno} value={alumno.id_alumno}>
                    {alumno.nombre} {alumno.apellido}
                    {alumno.legajo ? ` (${alumno.legajo})` : ""}
                  </option>
                ))}
              </select>
              <FiChevronDown className="select-icon" />
            </div>
          </div>

          {/* Flecha o Indicador */}
          <div className="form-arrow">
            <FiArrowRight className="arrow-icon" />
          </div>

          {/* Selección de Curso */}
          <div className="form-group">
            <label className="form-label">
              <FiBook className="label-icon" />
              Selecciona un Curso
            </label>
            <div className="select-wrapper">
              <select
                className="form-select"
                id="curso"
                value={selectedCurso}
                onChange={(e) => setSelectedCurso(e.target.value)}
                required
              >
                <option value="">-- Elige un curso --</option>
                {cursos.map((curso) => (
                  <option key={curso.id_curso} value={curso.id_curso}>
                    {curso.nombre}
                    {curso.anio ? ` - ${curso.anio}°` : ""}
                    {curso.division ? ` (${curso.division})` : ""}
                  </option>
                ))}
              </select>
              <FiChevronDown className="select-icon" />
            </div>
          </div>
        </div>

        {/* Preview Card */}
        {selectedAlumno && selectedCurso && (
          <div className="preview-card">
            <h3 className="preview-title">Vista Previa de la Asignación</h3>
            <div className="preview-content">
              <div className="preview-item">
                <span className="preview-label">Alumno:</span>
                <span className="preview-value">
                  {alumnoSeleccionado?.nombre} {alumnoSeleccionado?.apellido}
                </span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Curso:</span>
                <span className="preview-value">
                  {cursoSeleccionado?.nombre}
                  {cursoSeleccionado?.anio ? ` ${cursoSeleccionado?.anio}°` : ""}
                  {cursoSeleccionado?.division ? ` (${cursoSeleccionado?.division})` : ""}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Button */}
        <button
          className={`btn-submit ${
            !selectedAlumno || !selectedCurso ? "disabled" : ""
          } ${isSubmitting ? "loading" : ""}`}
          type="submit"
          disabled={isSubmitting || !selectedAlumno || !selectedCurso}
        >
          {isSubmitting ? (
            <>
              <FiLoader className="btn-icon spin" />
              Guardando...
            </>
          ) : (
            <>
              <FiCheck className="btn-icon" />
              Asignar Curso
            </>
          )}
        </button>
      </form>

      {/* Info Card */}
      <div className="info-card">
        <h3 className="info-title">💡 Información</h3>
        <ul className="info-list">
          <li>Un alumno solo puede pertenecer a un curso a la vez</li>
          <li>Si asignas un nuevo curso, el anterior será reemplazado</li>
          <li>Los cambios se guardan inmediatamente</li>
        </ul>
      </div>
    </div>
  );
};

export default AsignarCurso;