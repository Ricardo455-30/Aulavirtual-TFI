// src/components/admin/UsersSection.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiDownload, FiX, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
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

const formatearFechaCorta = (fecha) => {
  if (!fecha) return "-";
  return new Date(fecha).toLocaleDateString("es-AR");
};

const UsersSection = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [rolActivo, setRolActivo] = useState("alumno");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("ACTIVO");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarExport, setMostrarExport] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [toast, setToast] = useState(null);

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sesión expirada");
      navigate("/");
      return null;
    }
    return token;
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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
        `http://localhost:8000/api/usuarios?${params.toString()}`,
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

      await fetch(`http://localhost:8000/api/usuarios/${id}/estado`, {
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

      await fetch(`http://localhost:8000/api/usuarios/${id}/password`, {
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


const exportarExcel = async () => {
    try {
      setExportando(true);
      
      const usuariosFiltrados = usuarios
        .filter((u) =>
          u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
          u.email.toLowerCase().includes(busqueda.toLowerCase())
        )
        .filter((u) =>
          filtroEstado ? u.estado.toLowerCase() === filtroEstado.toLowerCase() : true
        );

      if (usuariosFiltrados.length === 0) {
        showToast("No hay datos para exportar", "error");
        setExportando(false);
        return;
      }

      // HOJA 1: Datos Detallados
      const dataDetallada = usuariosFiltrados.map((u, index) => ({
        "N°": index + 1,
        Nombre: u.nombre,
        Apellido: u.apellido,
        Email: u.email,
        Rol: u.rol.charAt(0).toUpperCase() + u.rol.slice(1),
        Estado: u.estado,
        "Fecha Creación": formatearFechaCorta(u.createdAt),
      }));

      // HOJA 2: Resumen Estadísticas
      const estadisticas = {
        "Total Usuarios": usuariosFiltrados.length,
        "Activos": usuariosFiltrados.filter(u => u.estado === "Activo").length,
        "Inactivos": usuariosFiltrados.filter(u => u.estado === "Inactivo").length,
        "Pendientes": usuariosFiltrados.filter(u => u.estado === "Pendiente").length,
        "Rechazados": usuariosFiltrados.filter(u => u.estado === "Rechazado").length,
      };

      const rolesCount = roles.map(rol => ({
        "Rol": rol.charAt(0).toUpperCase() + rol.slice(1),
        "Cantidad": usuariosFiltrados.filter(u => u.rol === rol).length
      }));

      // Crear workbook
      const wb = XLSX.utils.book_new();

      // === HOJA 1: Datos ===
      const ws1 = XLSX.utils.json_to_sheet(dataDetallada);
      
      // Título
      XLSX.utils.sheet_add_aoa(ws1, [["REPORTE DE USUARIOS - " + rolActivo.toUpperCase()]], { origin: "A1" });
      XLSX.utils.sheet_add_aoa(ws1, [["Generado: " + formatearFecha(new Date())]], { origin: "A2" });
      XLSX.utils.sheet_add_aoa(ws1, [[""]], { origin: "A3" }); // espacio
      
      ws1["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }
      ];

      // Estilos título
      ["A1", "A2"].forEach(cell => {
        if (ws1[cell]) {
          ws1[cell].s = {
            font: { name: "Calibri", sz: 14, bold: true, color: { rgb: "FFFFFFFF" } },
            fill: { fgColor: { rgb: "FF1F4E78" } },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
      });

      // Estilos encabezado
      Object.keys(dataDetallada[0]).forEach((key, colIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: 4, c: colIdx });
        if (ws1[cellRef]) {
          ws1[cellRef].s = {
            font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFFFF" } },
            fill: { fgColor: { rgb: "FF366092" } },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: {
              top: { style: "thin", color: { rgb: "FF000000" } },
              bottom: { style: "thin", color: { rgb: "FF000000" } },
              left: { style: "thin", color: { rgb: "FF000000" } },
              right: { style: "thin", color: { rgb: "FF000000" } }
            }
          };
        }
      });

      // Estilos datos
      dataDetallada.forEach((row, rowIdx) => {
        Object.keys(row).forEach((key, colIdx) => {
          const cellRef = XLSX.utils.encode_cell({ r: 5 + rowIdx, c: colIdx });
          if (ws1[cellRef]) {
            const bgColor = rowIdx % 2 === 0 ? "FFEBF4f7" : "FFD9E8F5";
            ws1[cellRef].s = {
              font: { name: "Calibri", sz: 10 },
              fill: { fgColor: { rgb: bgColor } },
              alignment: { horizontal: key === "Email" ? "left" : "center", vertical: "center" },
              border: {
                top: { style: "thin", color: { rgb: "FFB4C7E7" } },
                bottom: { style: "thin", color: { rgb: "FFB4C7E7" } },
                left: { style: "thin", color: { rgb: "FFB4C7E7" } },
                right: { style: "thin", color: { rgb: "FFB4C7E7" } }
              }
            };
          }
        });
      });

      ws1["!cols"] = [
        { wch: 5 }, { wch: 18 }, { wch: 18 }, { wch: 25 }, 
        { wch: 12 }, { wch: 12 }, { wch: 15 }
      ];
      ws1["!rows"] = [{ hpx: 25 }, { hpx: 20 }, { hpx: 5 }];

      XLSX.utils.book_append_sheet(wb, ws1, "Usuarios");

      // === HOJA 2: Estadísticas ===
      const ws2 = XLSX.utils.json_to_sheet([]);
      XLSX.utils.sheet_add_aoa(ws2, [["ESTADÍSTICAS DE USUARIOS"]], { origin: "A1" });
      XLSX.utils.sheet_add_aoa(ws2, [[""]], { origin: "A2" });
      XLSX.utils.sheet_add_aoa(ws2, [["ESTADO"]], { origin: "A3" });
      
      let row = 4;
      Object.entries(estadisticas).forEach(([label, value]) => {
        XLSX.utils.sheet_add_aoa(ws2, [[label, value]], { origin: `A${row}` });
        row++;
      });

      XLSX.utils.sheet_add_aoa(ws2, [[""]], { origin: `A${row}` });
      row++;
      XLSX.utils.sheet_add_aoa(ws2, [["POR ROL"]], { origin: `A${row}` });
      row++;

      rolesCount.forEach(item => {
        XLSX.utils.sheet_add_aoa(ws2, [[item.Rol, item.Cantidad]], { origin: `A${row}` });
        row++;
      });

      // Estilos hoja 2
      ws2["A1"].s = {
        font: { name: "Calibri", sz: 14, bold: true, color: { rgb: "FFFFFFFF" } },
        fill: { fgColor: { rgb: "FF1F4E78" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      ws2["!cols"] = [{ wch: 25 }, { wch: 15 }];

      XLSX.utils.book_append_sheet(wb, ws2, "Estadísticas");

      // Exportar
      XLSX.writeFile(wb, `Reporte_Usuarios_${rolActivo}_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast("Archivo Excel exportado correctamente ✓", "success");
      setMostrarExport(false);
    } catch (error) {
      console.error("Error exportando Excel:", error);
      showToast("Error al exportar Excel", "error");
    } finally {
      setExportando(false);
    }
  };

  // ========== EXPORTAR A PDF ==========
  const exportarPDF = async () => {
  try {
    setExportando(true);

    const usuariosFiltrados = usuarios
      .filter((u) =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase())
      )
      .filter((u) =>
        filtroEstado ? u.estado.toLowerCase() === filtroEstado.toLowerCase() : true
      );

    if (usuariosFiltrados.length === 0) {
      showToast("No hay datos para exportar", "error");
      setExportando(false);
      return;
    }

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // ===== PORTADA =====
    pdf.setFillColor(31, 78, 120);
    pdf.rect(0, 0, pageWidth, 50, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.text("REPORTE DE USUARIOS", pageWidth / 2, 20, { align: "center" });

    pdf.setFontSize(14);
    pdf.text(rolActivo.toUpperCase(), pageWidth / 2, 35, { align: "center" });

    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(11);
    pdf.text(`Generado: ${formatearFecha(new Date())}`, margin, pageHeight - 20);
    pdf.text(`Total de registros: ${usuariosFiltrados.length}`, margin, pageHeight - 15);

    // ===== TABLA =====
    pdf.addPage();

    pdf.setTextColor(31, 78, 120);
    pdf.setFontSize(16);
    pdf.text("Detalle de Usuarios", margin, margin);

    const columns = ["#", "Nombre", "Apellido", "Email", "Rol", "Estado", "Fecha"];

    const data = usuariosFiltrados.map((u, idx) => [
      idx + 1,
      u.nombre,
      u.apellido,
      u.email,
      u.rol.charAt(0).toUpperCase() + u.rol.slice(1),
      u.estado,
      formatearFechaCorta(u.createdAt)
    ]);

    // ✅ USO CORRECTO
    autoTable(pdf, {
      head: [columns],
      body: data,
      startY: margin + 8,
      theme: "grid",
      headStyles: {
        fillColor: [54, 96, 146],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center"
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [235, 244, 247]
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" }
      }
    });

    // ===== ESTADÍSTICAS =====
    pdf.addPage();

    pdf.setTextColor(31, 78, 120);
    pdf.setFontSize(16);
    pdf.text("Estadísticas", margin, margin);

    let yPos = margin + 15;

    const estados = ["Activo", "Inactivo", "Pendiente", "Rechazado"];

    pdf.setFontSize(12);
    pdf.text("Por Estado:", margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    estados.forEach(estado => {
      const count = usuariosFiltrados.filter(u => u.estado === estado).length;
      pdf.text(`${estado}: ${count}`, margin + 10, yPos);
      yPos += 7;
    });

    yPos += 5;

    pdf.setFontSize(12);
    pdf.text("Por Rol:", margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    roles.forEach(rol => {
      const count = usuariosFiltrados.filter(u => u.rol === rol).length;
      pdf.text(`${rol.charAt(0).toUpperCase() + rol.slice(1)}: ${count}`, margin + 10, yPos);
      yPos += 7;
    });

    pdf.save(`Reporte_Usuarios_${rolActivo}_${new Date().toISOString().split('T')[0]}.pdf`);

    showToast("Archivo PDF exportado correctamente ✓", "success");
    setMostrarExport(false);

  } catch (error) {
    console.error("Error exportando PDF:", error);
    showToast("Error al exportar PDF", "error");
  } finally {
    setExportando(false);
  }
};

  // ========== EXPORTAR A CSV ==========
  const exportarCSV = async () => {
    try {
      setExportando(true);

      const usuariosFiltrados = usuarios
        .filter((u) =>
          u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
          u.email.toLowerCase().includes(busqueda.toLowerCase())
        )
        .filter((u) =>
          filtroEstado ? u.estado.toLowerCase() === filtroEstado.toLowerCase() : true
        );

      if (usuariosFiltrados.length === 0) {
        showToast("No hay datos para exportar", "error");
        setExportando(false);
        return;
      }

      const headers = ["#", "Nombre", "Apellido", "Email", "Rol", "Estado", "Fecha Creación"];
      const rows = usuariosFiltrados.map((u, idx) => [
        idx + 1,
        `"${u.nombre}"`,
        `"${u.apellido}"`,
        `"${u.email}"`,
        u.rol,
        u.estado,
        formatearFechaCorta(u.createdAt)
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `Usuarios_${rolActivo}_${new Date().toISOString().split('T')[0]}.csv`);
      
      showToast("Archivo CSV exportado correctamente ✓", "success");
      setMostrarExport(false);
    } catch (error) {
      console.error("Error exportando CSV:", error);
      showToast("Error al exportar CSV", "error");
    } finally {
      setExportando(false);
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
      {/* TOAST */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}

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
          </div>

          <div className="actions-bar">
            <button className="btn-refresh" onClick={() => obtenerUsuarios(page)}>
              Actualizar
            </button>
            <button className="btn-export" onClick={() => setMostrarExport(!mostrarExport)} disabled={exportando}>
              <FiDownload /> Exportar {exportando ? "..." : ""}
            </button>
          </div>

          {/* MODAL DE EXPORTACIÓN */}
          {mostrarExport && (
            <div className="export-modal-overlay" onClick={() => setMostrarExport(false)}>
              <div className="export-modal" onClick={(e) => e.stopPropagation()}>
                <div className="export-header">
                  <h3>📊 Opciones de Exportación</h3>
                  <button className="close-btn" onClick={() => setMostrarExport(false)}>
                    <FiX />
                  </button>
                </div>

                <div className="export-options">
                  <button 
                    className="export-option excel" 
                    onClick={exportarExcel}
                    disabled={exportando}
                  >
                    <div className="export-icon">📋</div>
                    <div className="export-content">
                      <h4>Excel (.xlsx)</h4>
                      <p>Datos en 2 hojas: Usuarios y Estadísticas</p>
                    </div>
                    <div className="export-arrow">→</div>
                  </button>

                  <button 
                    className="export-option pdf" 
                    onClick={exportarPDF}
                    disabled={exportando}
                  >
                    <div className="export-icon">📄</div>
                    <div className="export-content">
                      <h4>PDF (.pdf)</h4>
                      <p>Reporte profesional de 3 páginas</p>
                    </div>
                    <div className="export-arrow">→</div>
                  </button>

                  <button 
                    className="export-option csv" 
                    onClick={exportarCSV}
                    disabled={exportando}
                  >
                    <div className="export-icon">📑</div>
                    <div className="export-content">
                      <h4>CSV (.csv)</h4>
                      <p>Formato compatible con cualquier base de datos</p>
                    </div>
                    <div className="export-arrow">→</div>
                  </button>
                </div>

                <div className="export-footer">
                  <p>💡 Selecciona el formato que mejor se ajuste a tus necesidades</p>
                </div>
              </div>
            </div>
          )}

          <div className="section-divider"></div>

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