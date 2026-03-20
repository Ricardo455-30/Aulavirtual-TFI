import React, { useEffect, useMemo, useState } from "react";
import { getCursos, getAlumnos } from "../../services/services";

const AlumnosSection = () => {

  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);

  const [loadingCursos, setLoadingCursos] = useState(false);
  const [errorCursos, setErrorCursos] = useState("");

  const [alumnos, setAlumnos] = useState([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [errorAlumnos, setErrorAlumnos] = useState("");

  const cargarCursos = async () => {
    setLoadingCursos(true);
    setErrorCursos("");

    try {
      const data = await getCursos();

      const normalizados = data.map((c) => ({
        id: c.id_curso ?? c.id ?? c.ID_CURSO,
        curso: `${c.anio}° ${c.division}`,
        sub: `Turno ${c.turno}`,
      }));

      setCursos(normalizados);

    } catch {
      setErrorCursos("No se pudieron cargar los cursos");
    } finally {
      setLoadingCursos(false);
    }
  };

  const cargarAlumnos = async () => {
    setLoadingAlumnos(true);
    setErrorAlumnos("");

    try {
      const data = await getAlumnos();
      setAlumnos(data);
    } catch {
      setErrorAlumnos("No se pudieron cargar los alumnos");
    } finally {
      setLoadingAlumnos(false);
    }
  };

  useEffect(() => {
    cargarCursos();
    cargarAlumnos();
  }, []);

  const alumnosFiltrados = useMemo(() => {
    if (!cursoSeleccionado) return [];
    return alumnos.filter(
      (a) => Number(a.id_curso) === Number(cursoSeleccionado)
    );
  }, [alumnos, cursoSeleccionado]);

  return (
    <div>

      <h2 className="section-title">Alumnos</h2>
      <p className="section-subtitle">Selecciona un curso</p>

      {loadingCursos && <p>Cargando cursos...</p>}
      {errorCursos && <p style={{ color: "crimson" }}>{errorCursos}</p>}

      {!loadingCursos && !errorCursos && (
        <div className="cursos-grid">
          {cursos.map((c) => (
            <div
              key={c.id}
              onClick={() => setCursoSeleccionado(c.id)}
              className="curso-card"
            >
              <div className="curso-titulo">{c.curso}</div>
              <div>{c.sub}</div>
            </div>
          ))}
        </div>
      )}

      {cursoSeleccionado && (
        <div style={{ marginTop: 30 }}>
          <h3>Alumnos del curso</h3>

          {loadingAlumnos && <p>Cargando alumnos...</p>}
          {errorAlumnos && <p style={{ color: "crimson" }}>{errorAlumnos}</p>}

          {!loadingAlumnos && (
            alumnosFiltrados.length === 0 ? (
              <p>No hay alumnos en este curso</p>
            ) : (
              <table className="tabla-pro">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>DNI</th>
                  </tr>
                </thead>

                <tbody>
                  {alumnosFiltrados.map((a) => (
                    <tr key={a.id_alumno}>
                      <td>{a.nombre}</td>
                      <td>{a.apellido}</td>
                      <td>{a.dni}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      )}

    </div>
  );
};

export default AlumnosSection;