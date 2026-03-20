import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from "../../assets/icono.png";
import "../../css/ADMIN/users.css";

const roles = ["alumno", "docente", "tutor", "directivo", "admin"];
const limitDefault = 10;

const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  return new Date(fecha).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const UsersSection = () => {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [rolActivo, setRolActivo] = useState("alumno");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sesión expirada");
      navigate("/");
      return null;
    }
    return token;
  };

  // CARGAR USUARIOS DESDE BACKEND CON PAGINACIÓN
  const obtenerUsuarios = async (pagina = page) => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(
        `http://localhost:8000/api/admin/usuarios?rol=${rolActivo}&page=${pagina}&limit=${limitDefault}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Error en la respuesta:", res.status, text);
        setUsuarios([]);
        setError("No se pudieron cargar los usuarios");
        return;
      }

      const json = await res.json();
      if (!json.data || !Array.isArray(json.data)) {
        console.error("Datos inválidos del backend:", json);
        setUsuarios([]);
        setError("Datos inválidos de usuarios");
        return;
      }

      const usuariosNormalizados = json.data.map((u) => ({
        id: u.id,
        nombre: u.nombre || "-",
        apellido: u.apellido || "",
        email: u.email || "-",
        rol: u.rol ? u.rol.toLowerCase() : "sin rol",
        estado: u.estado ? u.estado.toLowerCase() : "inactivo",
        createdAt: u.createdAt || null,
      }));

      setUsuarios(usuariosNormalizados);
      setPage(json.page);
      setTotalPages(json.totalPages);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setUsuarios([]);
      setError("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerUsuarios(1); // reiniciar a la página 1 al cambiar rol
  }, [rolActivo]);

  const cambiarEstado = async (id) => {
    try {
      const token = getToken();
      if (!token) return;
      await fetch(`http://localhost:8000/api/admin/usuarios/${id}/estado`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      obtenerUsuarios(page);
    } catch (error) {
      console.error(error);
    }
  };

  const cambiarPassword = async (id) => {
    const nueva = prompt("Nueva contraseña (mín 6 caracteres):");
    if (!nueva || nueva.length < 6) return alert("Contraseña inválida");

    try {
      const token = getToken();
      if (!token) return;

      await fetch(`http://localhost:8000/api/admin/usuarios/${id}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contraseña: nueva }),
      });

      alert("Contraseña actualizada");
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    try {
      const token = getToken();
      if (!token) return;

      await fetch(`http://localhost:8000/api/admin/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      obtenerUsuarios(page);
    } catch (error) {
      console.error(error);
    }
  };

  // FILTRADO EN EL CLIENTE (por búsqueda y estado)
  const usuariosFiltrados = usuarios
    .filter((u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase())
    )
    .filter((u) => (filtroEstado ? u.estado === filtroEstado.toLowerCase() : true));

  const stats = {
    total: usuarios.length,
    activos: usuarios.filter((u) => u.estado === "activo").length,
    inactivos: usuarios.filter((u) => u.estado === "inactivo").length,
    rolActual: usuarios.filter((u) => u.rol === rolActivo).length,
  };

  const exportarExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Usuarios");

      const response = await fetch(logo);
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      const imageId = workbook.addImage({ buffer, extension: "png" });
      worksheet.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: 150, height: 70 } });

      worksheet.mergeCells("C1:F2");
      const titulo = worksheet.getCell("C1");
      titulo.value = "Sistema Institucional - Reporte de Usuarios";
      titulo.font = { size: 16, bold: true };
      titulo.alignment = { vertical: "middle", horizontal: "center" };

      const startRow = 5;
      const headers = ["ID", "Nombre", "Apellido", "Email", "Rol", "Estado", "Creado"];
      headers.forEach((header, index) => {
        const cell = worksheet.getCell(startRow, index + 1);
        cell.value = header;
        cell.font = { bold: true };
      });

      usuariosFiltrados.forEach((u, i) => {
        const row = worksheet.getRow(startRow + 1 + i);
        row.values = [
          u.id,
          u.nombre,
          u.apellido,
          u.email,
          u.rol,
          u.estado,
          formatearFecha(u.createdAt),
        ];
      });

      worksheet.columns.forEach((column) => {
        column.width = 22;
      });

      const bufferExcel = await workbook.xlsx.writeBuffer();
      const blobExcel = new Blob([bufferExcel], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blobExcel, `Reporte_Usuarios_${rolActivo}_pagina${page}.xlsx`);
    } catch (e) {
      console.error("Error exportando Excel:", e);
    }
  };

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPages) return;
    obtenerUsuarios(nuevaPagina);
  };

  return (
    <div className="users-section">
      <h2>Gestión de Usuarios</h2>
      {error && <div className="error-msg">{error}</div>}
      {loading && <div>Cargando usuarios...</div>}

      {!loading && !error && (
        <>
          {/* STATS */}
          <div className="users-stats">
            <div className="stat-card"><h4>Total</h4><p>{stats.total}</p></div>
            <div className="stat-card"><h4>Activos</h4><p>{stats.activos}</p></div>
            <div className="stat-card"><h4>Inactivos</h4><p>{stats.inactivos}</p></div>
            <div className="stat-card"><h4>{rolActivo.toUpperCase()}</h4><p>{stats.rolActual}</p></div>
          </div>

          {/* TABS */}
          <div className="tabs">
            {roles.map((rol) => (
              <button
                key={rol}
                className={`tab-btn ${rolActivo === rol ? "active" : ""}`}
                onClick={() => setRolActivo(rol)}
              >
                {rol.toUpperCase()}
              </button>
            ))}
          </div>

          {/* FILTROS */}
          <div className="filters">
            <input
              type="text"
              placeholder="Buscar usuario por nombre, email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <button className="btn-refresh" onClick={() => obtenerUsuarios(page)}>Actualizar</button>
          </div>

          <button className="btn-export" onClick={exportarExcel}>Exportar Reporte</button>

          {/* TABLA */}
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr><td colSpan={4}>No hay usuarios para mostrar</td></tr>
              ) : (
                usuariosFiltrados.map((user) => (
                  <tr key={user.id}>
                    <td className="user-cell">
                      <div className="avatar">{user.nombre?.charAt(0) || "?"}</div>
                      <div>
                        <strong>{user.nombre} {user.apellido}</strong>
                        <br />
                        <span className="user-email">{user.email}</span>
                      </div>
                    </td>
                    <td><span className={`estado ${user.estado}`}>{user.estado}</span></td>
                    <td>{formatearFecha(user.createdAt)}</td>
                    <td>
                      <button className="btn-estado" onClick={() => cambiarEstado(user.id)}>Estado</button>
                      <button className="btn-password" onClick={() => cambiarPassword(user.id)}>Password</button>
                      <button className="btn-delete" onClick={() => eliminarUsuario(user.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINACIÓN */}
          <div className="pagination">
            <button onClick={() => cambiarPagina(page - 1)} disabled={page === 1}>Anterior</button>
            <span>Página {page} de {totalPages}</span>
            <button onClick={() => cambiarPagina(page + 1)} disabled={page === totalPages}>Siguiente</button>
          </div>
        </>
      )}
    </div>
  );
};

export default UsersSection;