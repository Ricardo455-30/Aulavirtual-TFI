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

      const wb = XLSX.utils.book_new();

      // ==================== HOJA 1: PORTADA PROFESIONAL ====================
      const wsCover = XLSX.utils.json_to_sheet([]);
      
      // Banner superior decorativo
      for (let i = 0; i < 8; i++) {
        const cell = XLSX.utils.encode_cell({ r: 0, c: i });
        wsCover[cell] = { t: "s", v: "" };
        wsCover[cell].s = { fill: { fgColor: { rgb: "FF1F4E78" } } };
      }
      
      for (let i = 0; i < 8; i++) {
        const cell = XLSX.utils.encode_cell({ r: 1, c: i });
        wsCover[cell] = { t: "s", v: "" };
        wsCover[cell].s = { fill: { fgColor: { rgb: "FF366092" } } };
      }

      // Logo/Icono con texto
      XLSX.utils.sheet_add_aoa(wsCover, [["🎓 AULA VIRTUAL - SISTEMA DE GESTIÓN"]], { origin: "B3" });
      wsCover["B3"].s = {
        font: { name: "Calibri", sz: 26, bold: true, color: { rgb: "FF1F4E78" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      // Subtítulo
      XLSX.utils.sheet_add_aoa(wsCover, [["REPORTE INTEGRAL DE USUARIOS"]], { origin: "B5" });
      wsCover["B5"].s = {
        font: { name: "Calibri", sz: 18, bold: true, color: { rgb: "FF4472C4" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      // Rol destacado
      XLSX.utils.sheet_add_aoa(wsCover, [[`Role: ${rolActivo.toUpperCase()}`]], { origin: "B7" });
      wsCover["B7"].s = {
        font: { name: "Calibri", sz: 16, bold: true, color: { rgb: "FFFFFFFF" } },
        fill: { fgColor: { rgb: "FF70AD47" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      // Fecha
      XLSX.utils.sheet_add_aoa(wsCover, [[`Generado: ${formatearFecha(new Date())}`]], { origin: "B9" });
      wsCover["B9"].s = {
        font: { name: "Calibri", sz: 13, color: { rgb: "FF595959" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      // Estadísticas rápidas
      const totalActivos = usuariosFiltrados.filter(u => u.estado === "Activo").length;
      const totalInactivos = usuariosFiltrados.filter(u => u.estado === "Inactivo").length;
      const totalPendientes = usuariosFiltrados.filter(u => u.estado === "Pendiente").length;

      XLSX.utils.sheet_add_aoa(wsCover, [[""]], { origin: "B11" });
      XLSX.utils.sheet_add_aoa(wsCover, [["RESUMEN RÁPIDO"]], { origin: "B12" });
      wsCover["B12"].s = {
        font: { name: "Calibri", sz: 14, bold: true, color: { rgb: "FFFFFFFF" } },
        fill: { fgColor: { rgb: "FFED7D31" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      // Stats boxes
      const statsData = [
        [`✓ TOTAL: ${usuariosFiltrados.length}`, "FF4472C4"],
        [`✓ ACTIVOS: ${totalActivos}`, "FF00B050"],
        [`✗ INACTIVOS: ${totalInactivos}`, "FFF79646"],
        [`⏳ PENDIENTES: ${totalPendientes}`, "FFFFFF00"]
      ];

      statsData.forEach((stat, idx) => {
        const row = 13 + idx;
        XLSX.utils.sheet_add_aoa(wsCover, [[stat[0]]], { origin: `B${row}` });
        const cell = XLSX.utils.encode_cell({ r: row - 1, c: 1 });
        wsCover[cell].s = {
          font: { name: "Calibri", sz: 14, bold: true, color: { rgb: "FFFFFFFF" } },
          fill: { fgColor: { rgb: stat[1] } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      });

      wsCover["!cols"] = Array(8).fill({ wch: 22 });
      wsCover["!rows"] = Array(20).fill({ hpx: 28 });

      XLSX.utils.book_append_sheet(wb, wsCover, "📊 Portada");

      // ==================== HOJA 2: TABLA PRINCIPAL ====================
      const dataDetallada = usuariosFiltrados.map((u, index) => ({
        "Nº": index + 1,
        "👤 NOMBRE": u.nombre,
        "APELLIDO": u.apellido,
        "📧 EMAIL": u.email,
        "👥 ROL": u.rol.charAt(0).toUpperCase() + u.rol.slice(1),
        "🎯 ESTADO": u.estado,
        "📅 FECHA": formatearFechaCorta(u.createdAt),
      }));

      const ws1 = XLSX.utils.json_to_sheet(dataDetallada);

      // Encabezados con merge decorativo
      XLSX.utils.sheet_add_aoa(ws1, [["📋 LISTADO COMPLETO DE USUARIOS"]], { origin: "A1" });
      XLSX.utils.sheet_add_aoa(ws1, [[`Total de registros: ${usuariosFiltrados.length} | Generado: ${formatearFecha(new Date())}`]], { origin: "A2" });
      XLSX.utils.sheet_add_aoa(ws1, [[""]], { origin: "A3" });

      ws1["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }
      ];

      // Título principal
      ws1["A1"].s = {
        font: { name: "Calibri", sz: 18, bold: true, color: { rgb: "FFFFFFFF" } },
        fill: { fgColor: { rgb: "FF1F4E78" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      ws1["A2"].s = {
        font: { name: "Calibri", sz: 12, color: { rgb: "FFFFFFFF" } },
        fill: { fgColor: { rgb: "FF366092" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      // Colores para encabezados
      const headerColors = [
        "FF4472C4", "FF70AD47", "FFED7D31", "FFC5504D", 
        "FF4472C4", "FF70AD47", "FFED7D31"
      ];

      Object.keys(dataDetallada[0]).forEach((key, colIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: 4, c: colIdx });
        if (ws1[cellRef]) {
          ws1[cellRef].s = {
            font: { name: "Calibri", sz: 12, bold: true, color: { rgb: "FFFFFFFF" } },
            fill: { fgColor: { rgb: headerColors[colIdx] } },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: {
              top: { style: "medium", color: { rgb: "FFFFFFFF" } },
              bottom: { style: "medium", color: { rgb: "FFFFFFFF" } },
              left: { style: "medium", color: { rgb: "FFFFFFFF" } },
              right: { style: "medium", color: { rgb: "FFFFFFFF" } }
            }
          };
        }
      });

      // Función color por rol
      const getColorByRol = (rol) => {
        const colors = {
          alumno: "FF4472C4",
          docente: "FF70AD47",
          directivo: "FFED7D31",
          superadmin: "FFC5504D"
        };
        return colors[rol.toLowerCase()] || "FFB4C7E7";
      };

      // Función color por estado
      const getColorByEstado = (estado) => {
        const colors = {
          "Activo": "FF00B050",
          "Inactivo": "FFF79646",
          "Pendiente": "FFFFFF00",
          "Rechazado": "FFFF0000"
        };
        return colors[estado] || "FFEBF4f7";
      };

      // Datos con colores dinámicos
      dataDetallada.forEach((row, rowIdx) => {
        Object.keys(row).forEach((key, colIdx) => {
          const cellRef = XLSX.utils.encode_cell({ r: 5 + rowIdx, c: colIdx });
          if (ws1[cellRef]) {
            let bgColor = "FFEBF4F7";
            let fontColor = "FF000000";

            if (key === "👥 ROL") {
              bgColor = getColorByRol(row["👥 ROL"]);
              fontColor = "FFFFFFFF";
            } else if (key === "🎯 ESTADO") {
              bgColor = getColorByEstado(row["🎯 ESTADO"]);
              fontColor = "FFFFFFFF";
            } else {
              bgColor = rowIdx % 2 === 0 ? "FFEBF4F7" : "FFF0F5FF";
            }

            ws1[cellRef].s = {
              font: { 
                name: "Calibri", 
                sz: 11, 
                bold: key === "👥 ROL" || key === "🎯 ESTADO",
                color: { rgb: fontColor }
              },
              fill: { fgColor: { rgb: bgColor } },
              alignment: { 
                horizontal: key === "📧 EMAIL" ? "left" : "center", 
                vertical: "center" 
              },
              border: {
                top: { style: "thin", color: { rgb: "FFD3D3D3" } },
                bottom: { style: "thin", color: { rgb: "FFD3D3D3" } },
                left: { style: "thin", color: { rgb: "FFD3D3D3" } },
                right: { style: "thin", color: { rgb: "FFD3D3D3" } }
              }
            };
          }
        });
      });

      ws1["!cols"] = [
        { wch: 6 }, { wch: 16 }, { wch: 16 }, { wch: 30 }, 
        { wch: 14 }, { wch: 14 }, { wch: 16 }
      ];
      ws1["!rows"] = [
        { hpx: 28 }, { hpx: 22 }, { hpx: 8 }, { hpx: 0 },
        { hpx: 28 },
        ...Array(dataDetallada.length).fill({ hpx: 24 })
      ];

      XLSX.utils.book_append_sheet(wb, ws1, "👥 Usuarios");

      // ==================== HOJA 3: ANÁLISIS ESTADÍSTICO ====================
      const ws2 = XLSX.utils.json_to_sheet([]);

      XLSX.utils.sheet_add_aoa(ws2, [["📊 ANÁLISIS ESTADÍSTICO COMPLETO"]], { origin: "A1" });
      ws2["A1"].s = {
        font: { name: "Calibri", sz: 18, bold: true, color: { rgb: "FFFFFFFF" } },
        fill: { fgColor: { rgb: "FF1F4E78" } }
      };

      // Sección 1: General
      XLSX.utils.sheet_add_aoa(ws2, [[""]], { origin: "A2" });
      XLSX.utils.sheet_add_aoa(ws2, [["📈 ESTADÍSTICAS GENERALES"]], { origin: "A3" });
      ws2["A3"].s = {
        font: { name: "Calibri", sz: 14, bold: true, color: { rgb: "FFFFFFFF" } },
        fill: { fgColor: { rgb: "FF4472C4" } }
      };

      const generalStats = [
        ["Total de Usuarios", usuariosFiltrados.length, "FF4472C4"],
        ["Activos ✓", totalActivos, "FF00B050"],
        ["Inactivos ✗", totalInactivos, "FFF79646"],
        ["Pendientes ⏳", totalPendientes, "FFFFFF00"],
        ["Rechazados ✘", usuariosFiltrados.filter(u => u.estado === "Rechazado").length, "FFFF0000"]
      ];

      let row = 4;
      generalStats.forEach(stat => {
        XLSX.utils.sheet_add_aoa(ws2, [[stat[0], stat[1]]], { origin: `A${row}` });
        const cellA = XLSX.utils.encode_cell({ r: row - 1, c: 0 });
        const cellB = XLSX.utils.encode_cell({ r: row - 1, c: 1 });
        
        ws2[cellA].s = {
          font: { name: "Calibri", sz: 12, bold: true, color: { rgb: "FFFFFFFF" } },
          fill: { fgColor: { rgb: stat[2] } },
          alignment: { horizontal: "left", vertical: "center" }
        };
        ws2[cellB].s = {
          font: { name: "Calibri", sz: 12, bold: true, color: { rgb: "FFFFFFFF" } },
          fill: { fgColor: { rgb: stat[2] } },
          alignment: { horizontal: "center", vertical: "center" }
        };
        row++;
      });

      // Sección 2: Por Rol
      row += 2;
      XLSX.utils.sheet_add_aoa(ws2, [["👥 DISTRIBUCIÓN POR ROL"]], { origin: `A${row}` });
      ws2[XLSX.utils.encode_cell({ r: row - 1, c: 0 })].s = {
        font: { name: "Calibri", sz: 14, bold: true, color: { rgb: "FFFFFFFF" } },
        fill: { fgColor: { rgb: "FF70AD47" } }
      };
      row++;

      roles.forEach(rol => {
        const count = usuariosFiltrados.filter(u => u.rol === rol).length;
        const roleDisplay = rol.charAt(0).toUpperCase() + rol.slice(1);
        XLSX.utils.sheet_add_aoa(ws2, [[roleDisplay, count]], { origin: `A${row}` });
        
        const cellA = XLSX.utils.encode_cell({ r: row - 1, c: 0 });
        const cellB = XLSX.utils.encode_cell({ r: row - 1, c: 1 });
        const roleColor = getColorByRol(rol);
        
        ws2[cellA].s = {
          font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFFFF" } },
          fill: { fgColor: { rgb: roleColor } },
          alignment: { horizontal: "left", vertical: "center" }
        };
        ws2[cellB].s = {
          font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFFFF" } },
          fill: { fgColor: { rgb: roleColor } },
          alignment: { horizontal: "center", vertical: "center" }
        };
        row++;
      });

      // Sección 3: Por Estado
      row += 2;
      XLSX.utils.sheet_add_aoa(ws2, [["🎯 DISTRIBUCIÓN POR ESTADO"]], { origin: `A${row}` });
      ws2[XLSX.utils.encode_cell({ r: row - 1, c: 0 })].s = {
        font: { name: "Calibri", sz: 14, bold: true, color: { rgb: "FFFFFFFF" } },
        fill: { fgColor: { rgb: "FFED7D31" } }
      };
      row++;

      const estadosDistrib = [
        ["Activo", totalActivos, "FF00B050"],
        ["Inactivo", totalInactivos, "FFF79646"],
        ["Pendiente", totalPendientes, "FFFFFF00"],
        ["Rechazado", usuariosFiltrados.filter(u => u.estado === "Rechazado").length, "FFFF0000"]
      ];

      estadosDistrib.forEach(stat => {
        XLSX.utils.sheet_add_aoa(ws2, [[stat[0], stat[1]]], { origin: `A${row}` });
        const cellA = XLSX.utils.encode_cell({ r: row - 1, c: 0 });
        const cellB = XLSX.utils.encode_cell({ r: row - 1, c: 1 });
        
        ws2[cellA].s = {
          font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFFFF" } },
          fill: { fgColor: { rgb: stat[2] } },
          alignment: { horizontal: "left", vertical: "center" }
        };
        ws2[cellB].s = {
          font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFFFF" } },
          fill: { fgColor: { rgb: stat[2] } },
          alignment: { horizontal: "center", vertical: "center" }
        };
        row++;
      });

      ws2["!cols"] = [{ wch: 35 }, { wch: 18 }];

      XLSX.utils.book_append_sheet(wb, ws2, "📊 Estadísticas");

      // Exportar
      XLSX.writeFile(wb, `📊 Reporte_Usuarios_${rolActivo}_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast("✨ Archivo Excel exportado correctamente ✓", "success");
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

      // Función para codificar estados con símbolos
      const encodeEstado = (estado) => {
        const symbols = {
          "Activo": "✓ Activo",
          "Inactivo": "✗ Inactivo",
          "Pendiente": "⏳ Pendiente",
          "Rechazado": "✘ Rechazado"
        };
        return symbols[estado] || estado;
      };

      // Función para codificar rol con símbolo
      const encodeRol = (rol) => {
        const symbols = {
          "alumno": "👤 Alumno",
          "docente": "👨‍🏫 Docente",
          "directivo": "🎓 Directivo",
          "superadmin": "👨‍💼 Superadmin"
        };
        return symbols[rol] || rol;
      };

      const headers = ["#", "Nombre", "Apellido", "Email", "Rol", "Estado", "Fecha Creación"];
      const rows = usuariosFiltrados.map((u, idx) => [
        idx + 1,
        u.nombre,
        u.apellido,
        u.email,
        encodeRol(u.rol.toLowerCase()),
        encodeEstado(u.estado),
        formatearFechaCorta(u.createdAt)
      ]);

      // Construir CSV mejorado
      const csvContent = [
        // Encabezado decorativo
        "REPORTE DE USUARIOS",
        `Rol: ${rolActivo.toUpperCase()}`,
        `Generado: ${formatearFecha(new Date())}`,
        `Total de registros: ${usuariosFiltrados.length}`,
        "",
        // Tabla de datos
        headers.join(","),
        ...rows.map(row => 
          row.map(cell => {
            // Escapar comillas y quoteado
            const str = String(cell);
            return str.includes(",") || str.includes('"') || str.includes("\n")
              ? `"${str.replace(/"/g, '""')}"` 
              : str;
          }).join(",")
        ),
        "",
        // Estadísticas
        "ESTADÍSTICAS",
        "",
        "Estado,Cantidad",
        `✓ Activo,${usuariosFiltrados.filter(u => u.estado === "Activo").length}`,
        `✗ Inactivo,${usuariosFiltrados.filter(u => u.estado === "Inactivo").length}`,
        `⏳ Pendiente,${usuariosFiltrados.filter(u => u.estado === "Pendiente").length}`,
        `✘ Rechazado,${usuariosFiltrados.filter(u => u.estado === "Rechazado").length}`,
        "",
        "Rol,Cantidad",
        ...roles.map(rol => `👤 ${rol.charAt(0).toUpperCase() + rol.slice(1)},${usuariosFiltrados.filter(u => u.rol === rol).length}`)
      ].join("\n");

      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
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