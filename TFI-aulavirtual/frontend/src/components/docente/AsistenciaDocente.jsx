import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/asistencia.css";

const AsistenciaDocente = () => {
  const [materias, setMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [alumnos, setAlumnos] = useState([]);
  const [asistencia, setAsistencia] = useState({});
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);

  // 🔹 Obtener materias del docente
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
      }
    };

    fetchMaterias();
  }, []);

  // 🔹 Obtener alumnos según materia
  useEffect(() => {
    const fetchAlumnos = async () => {
      if (!materiaSeleccionada) return;

      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://localhost:8000/api/asistencia/alumnos/${materiaSeleccionada}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAlumnos(res.data);

        // Inicializar asistencia
        const estadoInicial = {};
        res.data.forEach((al) => {
          estadoInicial[al.id_alumno] = "presente";
        });
        setAsistencia(estadoInicial);

      } catch (error) {
        console.error("Error al obtener alumnos:", error);
      }
    };

    fetchAlumnos();
  }, [materiaSeleccionada]);

  // 🔹 Cambiar estado
  const cambiarEstado = (id_alumno, estado) => {
    setAsistencia({
      ...asistencia,
      [id_alumno]: estado,
    });
  };

  // 🔹 Guardar asistencia
  const guardarAsistencia = async () => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        dmc_id: materiaSeleccionada,
        fecha,
        asistencias: Object.entries(asistencia).map(([alumno_id, estado]) => ({
          alumno_id,
          estado,
        })),
      };

      await axios.post(
        "http://localhost:8000/api/asistencia",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Asistencia guardada correctamente");
    } catch (error) {
      console.error("Error al guardar asistencia:", error);
      alert("❌ Error al guardar asistencia");
    }
  };

  return (
    <div className="asistencia-container">
      <h2>Asistencia</h2>

      {/* Filtros */}
      <div className="asistencia-filtros">
        <select
          value={materiaSeleccionada}
          onChange={(e) => setMateriaSeleccionada(e.target.value)}
        >
          <option value="">Seleccionar materia</option>
          {materias.map((m) => (
            <option key={m.id} value={m.id}>
              {m.materia} - {m.curso}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <table className="tabla-asistencia">
        <thead>
          <tr>
            <th>Alumno</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map((al) => (
            <tr key={al.id_alumno}>
              <td>{al.nombre} {al.apellido}</td>
              <td>
                <div className="acciones">
                  <button
                    className={
                      asistencia[al.id_alumno] === "presente" ? "activo presente" : ""
                    }
                    onClick={() => cambiarEstado(al.id_alumno, "presente")}
                  >
                    Presente
                  </button>

                  <button
                    className={
                      asistencia[al.id_alumno] === "ausente" ? "activo ausente" : ""
                    }
                    onClick={() => cambiarEstado(al.id_alumno, "ausente")}
                  >
                    Ausente
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Acción */}
      {alumnos.length > 0 && (
        <button className="guardar-btn" onClick={guardarAsistencia}>
          Guardar Asistencia
        </button>
      )}
    </div>
  );
};

export default AsistenciaDocente;