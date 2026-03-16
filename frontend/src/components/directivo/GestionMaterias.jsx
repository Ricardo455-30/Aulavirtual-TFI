import { useEffect, useState } from "react";
import axios from "axios";

const GestionMaterias = () => {
  const [materias, setMaterias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [carga, setCarga] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState(null); // 🖼 Foto de la materia

  const token = localStorage.getItem("token");
  const BASE_URL = "http://localhost:8000/api"; // Ajustá según tu backend

  // ==========================
  // CARGAR MATERIAS
  // ==========================
  const cargarMaterias = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/materias`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaterias(res.data);
    } catch (error) {
      console.error("Error cargando materias:", error);
    }
  };

  useEffect(() => {
    cargarMaterias();
  }, []);

  // ==========================
  // CREAR MATERIA CON FOTO
  // ==========================
  const crearMateria = async () => {
    if (!nombre.trim() || !carga.trim()) return;

    try {
      const formData = new FormData();
      formData.append("nombre_materia", nombre);
      formData.append("carga_horaria", carga);
      formData.append("descripcion", descripcion);
      if (foto) formData.append("foto", foto); // agregar foto si hay

      await axios.post(`${BASE_URL}/materias`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // ⚠ necesario para subir archivos
        },
      });

      // Limpiar campos
      setNombre("");
      setCarga("");
      setDescripcion("");
      setFoto(null);
      cargarMaterias();
    } catch (error) {
      console.error("Error creando materia:", error);
    }
  };

  // ==========================
  // DESACTIVAR MATERIA
  // ==========================
  const eliminarMateria = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/materias/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      cargarMaterias();
    } catch (error) {
      console.error("Error eliminando materia:", error);
    }
  };

  return (
    <div className="section-container">
      <h2>Gestión de Materias</h2>

      <div className="form-inline">
        <input
          type="text"
          placeholder="Nombre de la materia"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="number"
          placeholder="Carga horaria"
          value={carga}
          onChange={(e) => setCarga(e.target.value)}
        />
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFoto(e.target.files[0])} // captura la foto
        />
        <button onClick={crearMateria}>Crear</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Carga</th>
              <th>Foto</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {materias.map((m) => (
              <tr key={m.id_materia}>
                <td>{m.nombre_materia}</td>
                <td>{m.carga_horaria} hs</td>
                <td>
                  {m.foto ? (
                    <img
                      src={`${BASE_URL}/${m.foto}`} // ajustar según tu ruta en el backend
                      alt={m.nombre_materia}
                      width={50}
                    />
                  ) : (
                    "Sin foto"
                  )}
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => eliminarMateria(m.id_materia)}
                  >
                    Desactivar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionMaterias;