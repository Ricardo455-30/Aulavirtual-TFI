import React, { useEffect, useState } from "react";
import { getCursosDocente, getAlumnosPorCurso, guardarAsistencia } from "../../services/services";

const AsistenciaSection = () => {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);

  const fechaHoy = new Date().toISOString().split("T")[0];

  // Cargar solo los cursos asignados al docente
  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      const data = await getCursosDocente();
      const normalizados = data.map((c) => ({
        id: c.id_curso,
        curso: `${c.anio}° ${c.division}`,
        sub: `Turno ${c.turno}`,
      }));
      setCursos(normalizados);
    } catch (error) {
      console.error("Error al cargar cursos del docente:", error);
    }
  };

  const seleccionarCurso = async (id) => {
    setCursoSeleccionado(id);
    try {
      const data = await getAlumnosPorCurso(id);
      setAlumnos(data);

      // Inicializamos asistencias como "Presente"
      const asistenciasIniciales = {};
      data.forEach((a) => {
        asistenciasIniciales[a.id_alumno] = "Presente";
      });
      setAsistencias(asistenciasIniciales);
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
      setAlumnos([]);
      setAsistencias({});
    }
  };

  const handleAsistenciaChange = (id, valor) => {
    setAsistencias({ ...asistencias, [id]: valor });
  };

  const guardar = async () => {
    try {
      const asistenciasArray = alumnos.map((a) => ({
        id_alumno: a.id_alumno,
        id_curso: cursoSeleccionado,
        fecha: fechaHoy,
        estado: asistencias[a.id_alumno],
      }));

      await guardarAsistencia(asistenciasArray);
      alert("✅ Guardado correctamente");
    } catch (error) {
      console.error(error);
      alert("❌ Error al guardar asistencias");
    }
  };

  return (
    <div>
      <h2 className="section-title">Asistencias</h2>

      <div className="cursos-grid">
        {cursos.length === 0 && <p>No tienes cursos asignados.</p>}
        {cursos.map((c) => (
          <div
            key={c.id}
            onClick={() => seleccionarCurso(c.id)}
            className={`curso-card ${cursoSeleccionado === c.id ? "selected" : ""}`}
          >
            <div className="curso-titulo">{c.curso}</div>
            <div>{c.sub}</div>
          </div>
        ))}
      </div>

      {cursoSeleccionado && alumnos.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>Alumnos</h3>

          <table className="tabla-pro">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DNI</th>
                <th>Asistencia</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              {alumnos.map((a) => (
                <tr key={a.id_alumno}>
                  <td>{a.nombre}</td>
                  <td>{a.apellido}</td>
                  <td>{a.dni}</td>
                  <td>
                    <select
                      className="select-asistencia"
                      disabled={!modoEdicion}
                      value={asistencias[a.id_alumno]}
                      onChange={(e) => handleAsistenciaChange(a.id_alumno, e.target.value)}
                    >
                      <option>Presente</option>
                      <option>Ausente</option>
                      <option>Tarde</option>
                    </select>
                  </td>
                  <td>{fechaHoy}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="acciones">
            <button className="btn-warning" onClick={() => setModoEdicion(!modoEdicion)}>
              {modoEdicion ? "Cancelar edición" : "Editar"}
            </button>

            <button className="btn-success" onClick={guardar}>
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsistenciaSection;