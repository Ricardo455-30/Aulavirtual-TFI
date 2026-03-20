import React, { useEffect, useState } from "react";
import { getCursos, getAlumnosPorCurso, guardarNotasCurso } from "../../services/services";

const CalificacionesSection = () => {

  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [notas, setNotas] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    const data = await getCursos();

    const normalizados = data.map((c) => ({
      id: c.id_curso,
      curso: `${c.anio}° ${c.division}`,
      sub: `Turno ${c.turno}`,
    }));

    setCursos(normalizados);
  };

  const seleccionarCurso = async (id) => {
    setCursoSeleccionado(id);

    const data = await getAlumnosPorCurso(id);
    setAlumnos(data);

    const notasIniciales = {};
    data.forEach((a) => {
      notasIniciales[a.id_alumno] = a.calificacion || "";
    });

    setNotas(notasIniciales);
  };

  const handleNotaChange = (id, valor) => {
    setNotas({ ...notas, [id]: valor });
  };

  const guardarNotas = async () => {
    try {
      const notasArray = alumnos.map((a) => ({
        id_alumno: a.id_alumno,
        nota: notas[a.id_alumno],
      }));

      await guardarNotasCurso(cursoSeleccionado, notasArray);
      alert("Notas guardadas");

    } catch {
      alert("Error");
    }
  };

  return (
    <div>

      <h2 className="section-title">Calificaciones</h2>

      <div className="cursos-grid">
        {cursos.map((c) => (
          <div
            key={c.id}
            onClick={() => seleccionarCurso(c.id)}
            className="curso-card"
          >
            <div className="curso-titulo">{c.curso}</div>
            <div>{c.sub}</div>
          </div>
        ))}
      </div>

      {cursoSeleccionado && (
        <div style={{ marginTop: 30 }}>
          <h3>Alumnos</h3>

          <table className="tabla-pro">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DNI</th>
                <th>Nota</th>
              </tr>
            </thead>

            <tbody>
              {alumnos.map((a) => (
                <tr key={a.id_alumno}>
                  <td>{a.nombre}</td>
                  <td>{a.apellido}</td>
                  <td>{a.dni}</td>

                  <td>
                    <input
                      className="input-nota"
                      disabled={!modoEdicion}
                      value={notas[a.id_alumno] ?? ""}
                      onChange={(e) =>
                        handleNotaChange(a.id_alumno, e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="acciones">
            <button className="btn-warning" onClick={() => setModoEdicion(!modoEdicion)}>
              Editar
            </button>

            <button className="btn-success" onClick={guardarNotas}>
              Guardar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CalificacionesSection;