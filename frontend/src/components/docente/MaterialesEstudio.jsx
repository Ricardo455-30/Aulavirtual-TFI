import React, { useState, useEffect } from "react";
import axios from "axios";

const MaterialesEstudio = () => {
  const [asignaciones, setAsignaciones] = useState([]); // materias del docente
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [selectedAsignacion, setSelectedAsignacion] = useState("");
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAsignaciones, setLoadingAsignaciones] = useState(true);

  const token = localStorage.getItem("token"); // si usas auth

  useEffect(() => {
    // traer materias/asignaciones del docente
    const fetchAsignaciones = async () => {
      try {
        setLoadingAsignaciones(true);
        const res = await axios.get("/api/materias", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Asegurarse de que siempre sea un array
        setAsignaciones(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error al traer asignaciones:", err);
        setAsignaciones([]);
      } finally {
        setLoadingAsignaciones(false);
      }
    };

    // traer materiales subidos
    const fetchMateriales = async () => {
      try {
        const res = await axios.get("/api/materiales", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMateriales(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error al traer materiales:", err);
        setMateriales([]);
      }
    };

    fetchAsignaciones();
    fetchMateriales();
  }, [token]);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) setArchivo(e.target.files[0]);
    else setArchivo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo || !titulo || !selectedAsignacion) {
      alert("Completa todos los campos y selecciona un archivo");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("titulo", titulo);
    formData.append("descripcion", descripcion);
    formData.append("id_asignacion", selectedAsignacion);

    setLoading(true);
    try {
      await axios.post("/api/materiales/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Material subido correctamente");
      setTitulo("");
      setDescripcion("");
      setArchivo(null);
      setSelectedAsignacion("");
      // refrescar la lista de materiales
      const res = await axios.get("/api/materiales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMateriales(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al subir material:", err);
      alert("Error al subir el material");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Subir Material de Estudio</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label>Materia/Asignación:</label>
          <select
            value={selectedAsignacion}
            onChange={(e) => setSelectedAsignacion(e.target.value)}
            className="border p-1 rounded w-full"
            disabled={loadingAsignaciones}
          >
            <option value="">
              {loadingAsignaciones ? "Cargando materias..." : "Selecciona una materia"}
            </option>
            {Array.isArray(asignaciones) &&
              asignaciones.map((a) => (
                <option key={a.id_asignacion} value={a.id_asignacion}>
                  {a.nombre_materia}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label>Título:</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="border p-1 rounded w-full"
          />
        </div>
        <div>
          <label>Descripción:</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="border p-1 rounded w-full"
          ></textarea>
        </div>
        <div>
          <label>Archivo (PDF, Video, etc.):</label>
          <input type="file" onChange={handleFileChange} />
        </div>
        <button
          type="submit"
          disabled={loading || loadingAsignaciones}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Subiendo..." : "Subir Material"}
        </button>
      </form>

      <h3 className="text-lg font-bold mt-6 mb-2">Materiales Subidos</h3>
      <ul>
        {Array.isArray(materiales) && materiales.length > 0 ? (
          materiales.map((m) => (
            <li key={m.id_material} className="border-b py-2">
              <strong>{m.titulo}</strong> - {m.descripcion} -{" "}
              <a
                href={m.archivo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600"
              >
                Ver archivo
              </a>
            </li>
          ))
        ) : (
          <li>No hay materiales subidos</li>
        )}
      </ul>
    </div>
  );
};

export default MaterialesEstudio;