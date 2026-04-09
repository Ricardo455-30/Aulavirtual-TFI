import { useEffect, useState } from "react";
import axios from "axios";

const NotasAlumnos = () => {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");

  const [boletin, setBoletin] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // 🔹 cargar cursos
  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/cursos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCursos(res.data);
    } catch (error) {
      console.error("Error al cargar cursos", error);
    }
  };

  // 🔹 cargar boletín por curso
  const cargarBoletin = async (id_curso) => {
    if (!id_curso) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:8000/api/boletin/curso/${id_curso}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 🔥 AGRUPAR POR ALUMNO
      const agrupado = {};

      res.data.forEach((item) => {
        const key = item.id_alumno;

        if (!agrupado[key]) {
          agrupado[key] = {
            alumno: `${item.nombre} ${item.apellido}`,
            materias: [],
          };
        }

        agrupado[key].materias.push({
          materia: item.materia,
          t1: item.t1,
          t2: item.t2,
          t3: item.t3,
          final: item.final,
        });
      });

      setBoletin(Object.values(agrupado));
    } catch (error) {
      console.error("Error al obtener boletín", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">📊 Boletín de Alumnos</h1>

      {/* 🔹 SELECT CURSO */}
      <select
        className="input"
        value={cursoSeleccionado}
        onChange={(e) => {
          const value = e.target.value;
          setCursoSeleccionado(value);
          cargarBoletin(value);
        }}
      >
        <option value="">Seleccionar curso</option>
        {cursos.map((c) => (
          <option key={c.id_curso} value={c.id_curso}>
            {c.nombre} {c.division}
          </option>
        ))}
      </select>

      {/* 🔹 CONTENIDO */}
      {loading ? (
        <p style={{ marginTop: "20px" }}>Cargando boletín...</p>
      ) : boletin.length === 0 ? (
        <p style={{ marginTop: "20px" }}>Seleccioná un curso</p>
      ) : (
        boletin.map((alumno, index) => (
          <div key={index} className="card" style={{ marginTop: "20px" }}>
            <h3>{alumno.alumno}</h3>

            <table className="table">
              <thead>
                <tr>
                  <th>Materia</th>
                  <th>1° Trim</th>
                  <th>2° Trim</th>
                  <th>3° Trim</th>
                  <th>Final</th>
                </tr>
              </thead>

              <tbody>
                {alumno.materias.map((m, i) => (
                  <tr key={i}>
                    <td>{m.materia}</td>
                    <td>{m.t1 || "-"}</td>
                    <td>{m.t2 || "-"}</td>
                    <td>{m.t3 || "-"}</td>
                    <td>{m.final || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default NotasAlumnos;