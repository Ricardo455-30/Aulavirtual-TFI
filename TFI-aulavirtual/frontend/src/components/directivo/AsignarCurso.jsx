import React, { useEffect, useState } from "react";
import axios from "axios";

const AsignarCurso = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [selectedAlumno, setSelectedAlumno] = useState("");
  const [selectedCurso, setSelectedCurso] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
        setError("No se pudieron cargar los alumnos o cursos. Volvé a intentar más tarde.");
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

      const alumno = alumnos.find((a) => String(a.id_alumno) === String(selectedAlumno));
      setMessage(
        `Curso asignado correctamente a ${alumno ? `${alumno.nombre} ${alumno.apellido}` : "el alumno"}`
      );
      setSelectedAlumno("");
      setSelectedCurso("");
    } catch (err) {
      console.error("Error al asignar curso", err);
      setError(err.response?.data?.error || "No se pudo asignar el curso. Intentá de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="asignar-curso-section">
      <div className="asignar-curso-header">
        <h2>Asignar o cambiar curso a un alumno</h2>
        <p>Elegí un alumno y asignale el curso correspondiente. Si ya tiene curso, se reemplazará por el nuevo.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <form className="asignar-curso-form" onSubmit={handleSubmit}>
        <label htmlFor="alumno">Alumno</label>
        <select
          id="alumno"
          value={selectedAlumno}
          onChange={(e) => setSelectedAlumno(e.target.value)}
        >
          <option value="">Seleccionar alumno</option>
          {alumnos.map((alumno) => (
            <option key={alumno.id_alumno} value={alumno.id_alumno}>
              {alumno.nombre} {alumno.apellido} {alumno.legajo ? `- ${alumno.legajo}` : ""}
            </option>
          ))}
        </select>

        <label htmlFor="curso">Curso</label>
        <select
          id="curso"
          value={selectedCurso}
          onChange={(e) => setSelectedCurso(e.target.value)}
        >
          <option value="">Seleccionar curso</option>
          {cursos.map((curso) => (
            <option key={curso.id_curso} value={curso.id_curso}>
              {curso.nombre} {curso.anio ? `- ${curso.anio}` : ""} {curso.division ? `(${curso.division})` : ""}
            </option>
          ))}
        </select>

        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Asignar curso"}
        </button>
      </form>
    </div>
  );
};

export default AsignarCurso;