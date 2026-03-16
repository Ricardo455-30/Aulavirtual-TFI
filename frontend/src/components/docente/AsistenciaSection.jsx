import React, { useEffect, useState } from "react";
import { getCursos } from "../../services/cursos.services";
import { getAlumnosPorCurso } from "../../services/alumnos.services";
import { guardarAsistencia } from "../../services/asistencias.services";

const AsistenciaSection = () => {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);

  const fechaHoy = new Date().toISOString().split("T")[0];

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

    const asistenciasIniciales = {};

    data.forEach((a) => {
      asistenciasIniciales[a.id_alumno] = "Presente";
    });

    setAsistencias(asistenciasIniciales);
  };

  const handleAsistenciaChange = (id_alumno, valor) => {
    setAsistencias({
      ...asistencias,
      [id_alumno]: valor,
    });
  };

  const guardar = async () => {
  try {

    const asistenciasArray = alumnos.map((a) => ({
      id_alumno: a.id_alumno,
      id_curso: cursoSeleccionado,
      fecha: fechaHoy,
      estado: asistencias[a.id_alumno],
    }));

    console.log("Asistencias a enviar:", asistenciasArray);

    const res = await guardarAsistencia(asistenciasArray);

    alert("✅ Asistencias guardadas correctamente");

    console.log("Respuesta del servidor:", res);

  } catch (error) {

    console.error("Error al guardar:", error);

    alert("❌ Error al guardar asistencias");

  }
};

  return (
    <div>
      <h2>Asistencias</h2>

      <div style={styles.grid}>
        {cursos.map((c) => (
          <div
            key={c.id}
            onClick={() => seleccionarCurso(c.id)}
            style={styles.card}
          >
            <div style={styles.cardCurso}>{c.curso}</div>
            <div>{c.sub}</div>
          </div>
        ))}
      </div>

      {cursoSeleccionado && (
        <div style={{ marginTop: 30 }}>
          <h3>Alumnos</h3>

          <table style={styles.table}>
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
                      disabled={!modoEdicion}
                      value={asistencias[a.id_alumno] || "Presente"}
                      onChange={(e) =>
                        handleAsistenciaChange(a.id_alumno, e.target.value)
                      }
                    >
                      <option value="Presente">Presente</option>
                      <option value="Ausente">Ausente</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Ausente justificado">Ausente justificado</option>
                        
                      
                    </select>
                  </td>

                  <td>{fechaHoy}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.botones}>
            <button
              onClick={() => setModoEdicion(!modoEdicion)}
              style={styles.botonEditar}
            >
              Editar asistencia
            </button>

            <button onClick={guardar} style={styles.botonGuardar}>
              Guardar asistencia
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 12,
  },

  card: {
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: 15,
    cursor: "pointer",
    background: "white",
  },

  cardCurso: {
    fontSize: 20,
    fontWeight: "bold",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 20,
  },

  botones: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },

  botonGuardar: {
    padding: "8px 16px",
    borderRadius: 6,
    border: "none",
    background: "#14a937",
    color: "white",
    cursor: "pointer",
  },

  botonEditar: {
    padding: "8px 16px",
    borderRadius: 6,
    border: "none",
    background: "#f0ad4e",
    color: "white",
    cursor: "pointer",
  },
};

export default AsistenciaSection;