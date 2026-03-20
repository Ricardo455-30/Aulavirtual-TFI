import { useEffect, useState } from "react";
import axios from "axios";

const GestionUsuarios = ({ rol }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: "", apellido: "", email: "", contraseña: "" });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const token = localStorage.getItem("token");
  const BASE_URL = "http://localhost:8000/api/admin";

  const cargarUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/usuarios`, {
        params: { rol, page, limit },
        headers: { Authorization: `Bearer ${token}` },
      });

      // Guardamos array de usuarios
      setUsuarios(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setError("No se pudieron cargar los usuarios.");
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, [rol, page]);

  const toggleEstado = async (id_usuario) => {
    try {
      await axios.patch(`${BASE_URL}/usuarios/${id_usuario}/estado`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      cargarUsuarios();
    } catch (err) { console.error(err); }
  };

  const cambiarPassword = async (id_usuario) => {
    const nuevaPass = prompt("Ingrese nueva contraseña:");
    if (!nuevaPass) return;
    try {
      await axios.patch(`${BASE_URL}/usuarios/${id_usuario}/password`, { contraseña: nuevaPass }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Contraseña actualizada");
    } catch (err) { console.error(err); }
  };

  const crearNuevoUsuario = async () => {
    if (!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.contraseña)
      return alert("Complete todos los campos obligatorios");
    try {
      await axios.post(`${BASE_URL}/usuarios`, { ...nuevoUsuario, rol }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNuevoUsuario({ nombre: "", apellido: "", email: "", contraseña: "" });
      cargarUsuarios();
    } catch (err) {
      console.error(err);
      alert("Error creando usuario");
    }
  };

  const nextPage = () => { if (page < totalPages) setPage(page + 1); };
  const prevPage = () => { if (page > 1) setPage(page - 1); };

  return (
    <div className="section-container">
      <h2>Gestión de {rol}s</h2>

      <div style={{ marginBottom: 20 }}>
        <h3>Agregar nuevo {rol}</h3>
        <input type="text" placeholder="Nombre" value={nuevoUsuario.nombre}
          onChange={e => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })} />
        <input type="text" placeholder="Apellido" value={nuevoUsuario.apellido}
          onChange={e => setNuevoUsuario({ ...nuevoUsuario, apellido: e.target.value })} />
        <input type="email" placeholder="Email" value={nuevoUsuario.email}
          onChange={e => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })} />
        <input type="password" placeholder="Contraseña" value={nuevoUsuario.contraseña}
          onChange={e => setNuevoUsuario({ ...nuevoUsuario, contraseña: e.target.value })} />
        <button onClick={crearNuevoUsuario}>Crear {rol}</button>
      </div>

      {loading && <p>Cargando usuarios...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div className="table-container">
          {usuarios.length === 0 ? (
            <p>No se encontraron usuarios.</p>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id_usuario}>
                      <td>{u.nombre} {u.apellido}</td>
                      <td>{u.email}</td>
                      <td>{u.estado}</td>
                      <td>
                        <button onClick={() => toggleEstado(u.id_usuario)}>Cambiar estado</button>
                        <button onClick={() => cambiarPassword(u.id_usuario)}>Cambiar contraseña</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination">
                <button onClick={prevPage} disabled={page === 1}>Anterior</button>
                <span>Página {page} de {totalPages}</span>
                <button onClick={nextPage} disabled={page === totalPages}>Siguiente</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;