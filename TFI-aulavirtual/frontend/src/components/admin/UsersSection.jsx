// src/components/admin/UsersSection.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../../css/UsersSection.css";

// Roles sincronizados con DB
const roles = ["alumno", "docente", "directivo", "superadmin"];
const limitDefault = 10;

// Mapeo de IDs a nombres de rol
const rolesMap = {
  1: "superadmin",
  2: "directivo",
  3: "docente",
  4: "alumno",
};

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

  const obtenerUsuarios = async (pagina = page) => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) return;

      const params = new URLSearchParams({
        rol: rolActivo,
        estado: filtroEstado,
        busqueda,
        page: pagina,
        limit: limitDefault,
      });

      const res = await fetch(
        `http://localhost:8000/api/admin1/usuarios?${params.toString()}`,
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

      const usuariosNormalizados = (json.data || []).map((u) => ({
        id: u.id,
        nombre: u.nombre || "-",
        apellido: u.apellido || "",
        email: u.email || "-",
        // Normalización de rol usando rolesMap
        rol: typeof u.rol === "string"
          ? u.rol.toLowerCase()
          : typeof u.rol === "number"
          ? rolesMap[u.rol] || "sin rol"
          : u.rol && u.rol.nombre
          ? u.rol.nombre.toLowerCase()
          : "sin rol",
        estado: u.estado
          ? u.estado.charAt(0).toUpperCase() + u.estado.slice(1).toLowerCase()
          : "Inactivo",
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
    obtenerUsuarios(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolActivo, filtroEstado, busqueda]);

  const cambiarEstado = async (id) => {
    try {
      const token = getToken();
      if (!token) return;

      await fetch(`http://localhost:8000/api/admin1/usuarios/${id}/estado`, {
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

      await fetch(`http://localhost:8000/api/admin1/usuarios/${id}/password`, {
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


const exportarExcel = () => {
  try {
    const usuariosFiltrados = usuarios
      .filter((u) =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase())
      )
      .filter((u) =>
        filtroEstado ? u.estado.toLowerCase() === filtroEstado.toLowerCase() : true
      );

    const data = usuariosFiltrados.map((u, index) => ({
      "N°": index + 1,
      Nombre: u.nombre,
      Apellido: u.apellido,
      Email: u.email,
      Rol: u.rol.charAt(0).toUpperCase() + u.rol.slice(1),
      Estado: u.estado,
      "Fecha de Creación": formatearFecha(u.createdAt),
    }));

    // Crear worksheet
    const worksheet = XLSX.utils.json_to_sheet(data, { origin: 2 }); // empezar en fila 3 para dejar espacio al título y encabezado

    // Título
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [["Reporte de Usuarios - Sistema Institucional"]],
      { origin: "A1" }
    );
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: Object.keys(data[0]).length - 1 } },
    ];
    worksheet["A1"].s = {
      font: { name: "Arial", sz: 16, bold: true, color: { rgb: "FFFFFFFF" } },
      fill: { fgColor: { rgb: "FF0D47A1" } }, // azul oscuro
      alignment: { horizontal: "center", vertical: "center" },
    };

    // Encabezado
    const headerColor = "FF1976D2"; // azul medio
    const headerFont = { name: "Arial", sz: 12, bold: true, color: { rgb: "FFFFFFFF" } };

    Object.keys(data[0]).forEach((key, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 2, c: colIdx }); // encabezado fila 3
      if (!worksheet[cellRef]) return;
      worksheet[cellRef].s = {
        fill: { fgColor: { rgb: headerColor } },
        font: headerFont,
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "FF000000" } },
          bottom: { style: "thin", color: { rgb: "FF000000" } },
          left: { style: "thin", color: { rgb: "FF000000" } },
          right: { style: "thin", color: { rgb: "FF000000" } },
        },
      };
    });

    // Estilo filas con degradé azul
    const startRow = 3; // fila de datos
    data.forEach((row, rowIdx) => {
      const colorIntensity = 240 - rowIdx * 5; // degradé: más claro hacia abajo
      const hex = colorIntensity.toString(16).padStart(2, "0");
      const bgColor = `FF${hex}${hex}FF`; // azul claro variando el azul
      Object.keys(row).forEach((key, colIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: startRow + rowIdx, c: colIdx });
        if (!worksheet[cellRef]) return;
        worksheet[cellRef].s = {
          fill: { fgColor: { rgb: bgColor } },
          alignment: { horizontal: "left", vertical: "center" },
          font: { name: "Arial", sz: 11 },
          border: {
            top: { style: "thin", color: { rgb: "FF000000" } },
            bottom: { style: "thin", color: { rgb: "FF000000" } },
            left: { style: "thin", color: { rgb: "FF000000" } },
            right: { style: "thin", color: { rgb: "FF000000" } },
          },
        };
      });
    });

    // Ajustar ancho de columnas
    const maxWidths = data[0]
      ? Object.keys(data[0]).map((key) => {
          return Math.max(
            key.length,
            ...data.map((row) => (row[key] ? row[key].toString().length : 0))
          );
        })
      : [];
    worksheet["!cols"] = maxWidths.map((w) => ({ wch: w + 5 }));

    // Crear workbook y exportar
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, `Reporte_Usuarios_${rolActivo}_pagina${page}.xlsx`);
  } catch (error) {
    console.error("Error exportando Excel:", error);
  }
};

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPages) return;
    obtenerUsuarios(nuevaPagina);
  };

  const usuariosFiltrados = usuarios
    .filter((u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase())
    )
    .filter((u) =>
      filtroEstado ? u.estado.toLowerCase() === filtroEstado.toLowerCase() : true
    );

  const stats = {
    total: usuarios.length,
    activos: usuarios.filter((u) => u.estado.toLowerCase() === "activo").length,
    inactivos: usuarios.filter((u) => u.estado.toLowerCase() === "inactivo").length,
    rolActual: usuarios.filter((u) => u.rol === rolActivo).length,
  };

  return (
    <div className="users-section">
      <h2>Gestión de Usuarios</h2>
      {error && <div className="error-msg">{error}</div>}
      {loading && <div>Cargando usuarios...</div>}

      {!loading && !error && (
        <>
          <div className="users-stats">
            <div className="stat-card">
              <h4>Activos</h4>
              <p>{stats.activos}</p>
            </div>
            <div className="stat-card">
              <h4>Inactivos</h4>
              <p>{stats.inactivos}</p>
            </div>
            <div className="stat-card">
              <h4>{rolActivo.toUpperCase()}</h4>
              <p>{stats.rolActual}</p>
            </div>
          </div>

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

          <div className="filters">
            <input
              type="text"
              placeholder="Buscar usuario por nombre, email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Rechazado">Rechazado</option>
            </select>
            <button className="btn-refresh" onClick={() => obtenerUsuarios(page)}>
              Actualizar
            </button>
          </div>

          <button className="btn-export" onClick={exportarExcel}>
            Exportar Reporte
          </button>

          <table className="users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5}>No hay usuarios para mostrar</td>
                </tr>
              ) : (
                usuariosFiltrados.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td className="user-cell">
                      <div className="avatar">{user.nombre?.charAt(0) || "?"}</div>
                      <div>
                        <strong>
                          {user.nombre} {user.apellido}
                        </strong>
                        <br />
                        <span className="user-email">{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`estado ${user.estado.toLowerCase()}`}>
                        {user.estado}
                      </span>
                    </td>
                    <td>{formatearFecha(user.createdAt)}</td>
                    <td>
                      <button className="btn-estado" onClick={() => cambiarEstado(user.id)}>
                        Estado
                      </button>
                      <button className="btn-password" onClick={() => cambiarPassword(user.id)}>
                        Password
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={() => cambiarPagina(page - 1)} disabled={page === 1}>
              Anterior
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button onClick={() => cambiarPagina(page + 1)} disabled={page === totalPages}>
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UsersSection;