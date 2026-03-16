import { useEffect, useState } from "react";
import axios from "axios";
import TareaCard from "./TareaCard";

const TareasSection = ({ idAsignacion }) => {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (idAsignacion) {
      obtenerTareas();
    }
  }, [idAsignacion]);

  const obtenerTareas = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `http://localhost:8000/api/tareas/asignacion/${idAsignacion}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTareas(res.data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar tareas");
    } finally {
      setLoading(false);
    }
  };

  const entregarTarea = async (idTarea, archivo, respuesta) => {
    const formData = new FormData();
    formData.append("id_tarea", idTarea);
    formData.append("respuesta", respuesta);

    if (archivo) {
      formData.append("archivo", archivo);
    }

    try {
      await axios.post(
        "http://localhost:8000/api/entregas",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert("✅ Tarea enviada correctamente");

      // 🔥 Recargar tareas después de entregar
      obtenerTareas();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error al entregar");
    }
  };

  if (!idAsignacion) return <p>No hay asignación seleccionada</p>;
  if (loading) return <p>Cargando tareas...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="tareas-container">
      {tareas.length === 0 ? (
        <p>No hay tareas disponibles</p>
      ) : (
        tareas.map((tarea) => (
          <TareaCard
            key={tarea.id_tarea}
            tarea={tarea}
            onEntregar={entregarTarea}
          />
        ))
      )}
    </div>
  );
};

export default TareasSection;