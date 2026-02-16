import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from "../../assets/icono.png";
import "../../css/ADMIN/users.css";

const roles = ["alumno", "docente", "tutor", "directivo", "admin"];

const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  return new Date(fecha).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const esMismaFecha = (fechaISO, filtroFecha) => {
  if (!filtroFecha) return true;
  const fechaUsuario = new Date(fechaISO).toISOString().split("T")[0];
  return fechaUsuario === filtroFecha;
};

const UsersSection = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [rolActivo, setRolActivo] = useState("alumno");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  // =========================
  // OBTENER TOKEN
  // =========================
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sesión expirada");
      navigate("/");
      return null;
    }
    return token;
  };

  // =========================
  // OBTENER USUARIOS
  // =========================
  const obtenerUsuarios = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch("http://localhost:8000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        alert("No autorizado");
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      const data = await res.json();
      setUsuarios(data);

    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // =========================
  // CAMBIAR ESTADO
  // =========================
  const cambiarEstado = async (id) => {
    try {
      const token = getToken();
      if (!token) return;

      await fetch(`http://localhost:8000/api/users/${id}/estado`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      obtenerUsuarios();

    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  };

  // =========================
  // CAMBIAR PASSWORD
  // =========================
  const cambiarPassword = async (id) => {
    const nueva = prompt("Nueva contraseña:");
    if (!nueva) return;

    try {
      const token = getToken();
      if (!token) return;

      await fetch(`http://localhost:8000/api/users/${id}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: nueva }),
      });

      alert("Contraseña actualizada");

    } catch (error) {
      console.error("Error actualizando contraseña:", error);
    }
  };

  // =========================
  // FILTROS
  // =========================
  const usuariosFiltrados = usuarios
    .filter((u) => u.rol === rolActivo)
    .filter(
      (u) =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase())
    )
    .filter((u) => (filtroEstado ? u.estado === filtroEstado : true))
    .filter((u) => esMismaFecha(u.createdAt, filtroFecha));

  // =========================
  // EXPORTAR EXCEL
  // =========================
  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Usuarios");

    const response = await fetch(logo);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    const imageId = workbook.addImage({
      buffer,
      extension: "png",
    });

    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 150, height: 70 },
    });

    worksheet.mergeCells("C1:F2");
    const titulo = worksheet.getCell("C1");
    titulo.value = "Sistema Institucional - Reporte de Usuarios";
    titulo.font = { size: 16, bold: true };
    titulo.alignment = { vertical: "middle", horizontal: "center" };

    worksheet.getCell("C3").value = `Fecha de exportación: ${new Date().toLocaleString(
      "es-AR"
    )}`;

    const startRow = 5;

    const headers = [
      "ID",
      "Nombre",
      "Apellido",
      "Email",
      "Rol",
      "Estado",
      "Creado",
      "Modificado",
    ];

    headers.forEach((header, index) => {
      const cell = worksheet.getCell(startRow, index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "003366" },
      };
      cell.alignment = { horizontal: "center" };
    });

    usuariosFiltrados.forEach((u, i) => {
      const row = worksheet.getRow(startRow + 1 + i);
      row.values = [
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.rol.toUpperCase(),
        u.estado.toUpperCase(),
        formatearFecha(u.createdAt),
        formatearFecha(u.updatedAt),
      ];
    });

    worksheet.columns.forEach((column) => {
      column.width = 22;
    });

    const bufferExcel = await workbook.xlsx.writeBuffer();
    const blobExcel = new Blob([bufferExcel], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blobExcel, `Reporte_Usuarios_${rolActivo}.xlsx`);
  };

  return (
    <div className="users-section">
      <h2>Gestión de Usuarios</h2>

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
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>

        <input
          type="date"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
        />
      </div>

      <button className="btn-export" onClick={exportarExcel}>
        Exportar Reporte Institucional
      </button>

      {/* TABLA */}
      <table className="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Creado</th>
            <th>Modificado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map((user) => (
            <tr key={user.id}>
              <td>{user.nombre} {user.apellido}</td>
              <td>{user.email}</td>
              <td>
                <span className={`estado ${user.estado}`}>
                  {user.estado}
                </span>
              </td>
              <td>{formatearFecha(user.createdAt)}</td>
              <td>{formatearFecha(user.updatedAt)}</td>
              <td>
                <button
                  className="btn-estado"
                  onClick={() => cambiarEstado(user.id)}
                >
                  Estado
                </button>

                <button
                  className="btn-password"
                  onClick={() => cambiarPassword(user.id)}
                >
                  Password
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersSection;
