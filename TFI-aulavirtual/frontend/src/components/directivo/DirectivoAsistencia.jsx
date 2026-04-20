import React, { useEffect, useState } from "react";
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FiDownload,
  FiFileText,
  FiLoader,
  FiFilter,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiGrid,
  FiList,
  FiBarChart2,
  FiUsers,
  FiBook,
  FiInfo,
} from "react-icons/fi";
import "../../css/DirectivoAsistencia.css";

const DirectivoAsistencia = ({ selectedCiclo }) => {
  const [cursos, setCursos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [asistencia, setAsistencia] = useState([]);

  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [busquedaAlumno, setBusquedaAlumno] = useState("");
  const [vistaCards, setVistaCards] = useState(true);

  const [loadingCursos, setLoadingCursos] = useState(true);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [loadingAsistencia, setLoadingAsistencia] = useState(false);
  const [error, setError] = useState(null);

  // 📚 OBTENER CURSOS
  useEffect(() => {
    if (!selectedCiclo) return;

    const fetchCursos = async () => {
      try {
        setLoadingCursos(true);
        setError(null);
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:8000/api/materias/cursos", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            id_ciclo: selectedCiclo || undefined,
          },
        });

        setCursos(res.data || []);
      } catch (err) {
        const errorMsg =
          "Error al cargar cursos: " + (err.response?.data?.error || err.message);
        setError(errorMsg);
        console.error("❌", errorMsg);
      } finally {
        setLoadingCursos(false);
      }
    };

    fetchCursos();
  }, [selectedCiclo]);

  // 📖 OBTENER MATERIAS DEL CURSO
  useEffect(() => {
    if (!cursoSeleccionado) {
      setMaterias([]);
      setMateriaSeleccionada("");
      return;
    }

    const fetchMaterias = async () => {
      try {
        setLoadingMaterias(true);
        setError(null);
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:8000/api/materias", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMaterias(res.data || []);
      } catch (err) {
        console.warn("⚠️ Error cargando materias:", err.message);
        setMaterias([]);
      } finally {
        setLoadingMaterias(false);
      }
    };

    fetchMaterias();
  }, [cursoSeleccionado]);

  // 📋 OBTENER ASISTENCIA
  const obtenerAsistencia = async () => {
    if (!cursoSeleccionado) {
      setError("Selecciona un curso");
      return;
    }

    try {
      setLoadingAsistencia(true);
      setError(null);
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:8000/api/asistencia/reporte", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          cursoId: cursoSeleccionado,
          materiaId: materiaSeleccionada || undefined,
          id_ciclo: selectedCiclo ? parseInt(selectedCiclo) : 3, // Usar ciclo activo (2026) por defecto
        },
      });

      if (!res.data || res.data.length === 0) {
        setError("No hay registros de asistencia para este curso");
      }

      const dataNormalizado = (res.data || []).map((d) => ({
        ...d,
        estado: d.estado ? d.estado.toLowerCase() : "sin registrar",
      }));

      setAsistencia(dataNormalizado);
    } catch (err) {
      const errorMsg =
        "Error al obtener asistencia: " + (err.response?.data?.error || err.message);
      setError(errorMsg);
      setAsistencia([]);
    } finally {
      setLoadingAsistencia(false);
    }
  };

  // 📊 AGRUPAR POR ALUMNO
  const alumnosAgrupados = () => {
    const agrupado = {};

    asistencia.forEach((d) => {
      const key = d.id_alumno ? `alumno_${d.id_alumno}` : `${d.nombre || ""}_${d.apellido || ""}`.trim();

      if (!agrupado[key]) {
        agrupado[key] = {
          id_alumno: d.id_alumno,
          nombre: d.nombre || "Sin nombre",
          apellido: d.apellido || "Sin apellido",
          asistencias: [],
        };
      }

      agrupado[key].asistencias.push({
        fecha: d.fecha,
        estado: (d.estado || "sin registrar").toLowerCase(),
        materia: d.materia,
      });
    });

    return Object.values(agrupado)
      .map((alumno) => {
        const total = alumno.asistencias.length;
        const presentes = alumno.asistencias.filter(
          (a) => a.estado === "presente"
        ).length;
        const ausentes = alumno.asistencias.filter(
          (a) => a.estado === "ausente"
        ).length;
        const justificados = alumno.asistencias.filter(
          (a) => a.estado === "justificado"
        ).length;
        const sinRegistrar = total - presentes - ausentes - justificados;

        return {
          ...alumno,
          total,
          presentes,
          ausentes,
          justificados,
          sinRegistrar,
          porcentaje: total > 0 ? Math.round((presentes / total) * 100) : 0,
        };
      })
      .filter((alumno) => {
        if (!busquedaAlumno) return true;
        const nombreCompleto = `${alumno.apellido} ${alumno.nombre}`.toLowerCase();
        return nombreCompleto.includes(busquedaAlumno.toLowerCase());
      });
  };

  // 📥 EXPORTAR EXCEL PROFESIONAL
  const exportarExcel = async () => {
    if (asistencia.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const cursoData = cursos.find((c) => c.id_curso === parseInt(cursoSeleccionado));
    const cursoLabel =
      cursoData?.curso_display ||
      cursoData?.nombre ||
      `${cursoData?.anio || "?"}° ${cursoData?.division || "?"}`;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Aula Virtual";
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.properties.title = `Reporte de Asistencia ${cursoLabel}`;

    const logoUrl = new URL("../../assets/icono.png", import.meta.url);
    let logoId;
    try {
      const response = await fetch(logoUrl);
      const buffer = await response.arrayBuffer();
      logoId = workbook.addImage({ buffer, extension: "png" });
    } catch (error) {
      console.warn("No se pudo cargar el logo para el Excel:", error);
    }

    const resumenSheet = workbook.addWorksheet("Resumen por Alumno", {
      views: [{ state: "frozen", ySplit: 5 }],
    });

    if (logoId) {
      resumenSheet.addImage(logoId, {
        tl: { col: 0, row: 0 },
        ext: { width: 120, height: 60 },
      });
    }

    resumenSheet.mergeCells("C1", "H2");
    const titleCell = resumenSheet.getCell("C1");
    titleCell.value = "REPORTE DE ASISTENCIA";
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.font = { size: 16, bold: true, color: { argb: "FF1976D2" } };

    resumenSheet.addRow([]);
    resumenSheet.addRow([]);
    resumenSheet.addRow([]);

    const headerRow = resumenSheet.addRow([
      "Apellido",
      "Nombre",
      "Presentes",
      "Ausentes",
      "Justificados",
      "Sin Registrar",
      "Total",
      "% Asistencia",
    ]);

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1976D2" },
      };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
      };
    });

    resumenSheet.columns = [
      { key: "apellido", width: 18 },
      { key: "nombre", width: 18 },
      { key: "presentes", width: 12 },
      { key: "ausentes", width: 12 },
      { key: "justificados", width: 14 },
      { key: "sinRegistrar", width: 14 },
      { key: "total", width: 10 },
      { key: "porcentaje", width: 15 },
    ];

    alumnosAgrupados().forEach((alumno, index) => {
      const row = resumenSheet.addRow({
        apellido: alumno.apellido,
        nombre: alumno.nombre,
        presentes: alumno.presentes,
        ausentes: alumno.ausentes,
        justificados: alumno.justificados,
        sinRegistrar: alumno.sinRegistrar,
        total: alumno.total,
        porcentaje: `${alumno.porcentaje}%`,
      });

      if (index % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF3F6FB" },
          };
        });
      }
    });

    resumenSheet.addRow([]);
    const totalRow = resumenSheet.addRow([
      "TOTAL ALUMNOS",
      alumnosAgrupados().length,
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    totalRow.font = { bold: true };

    // ===== HOJA 2: REGISTRO DETALLADO =====
    const detallesSheet = workbook.addWorksheet("Registro Detallado", {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    detallesSheet.columns = [
      { header: "Apellido", key: "apellido", width: 18 },
      { header: "Nombre", key: "nombre", width: 18 },
      { header: "Materia", key: "materia", width: 30 },
      { header: "Fecha", key: "fecha", width: 16 },
      { header: "Estado", key: "estado", width: 18 },
      { header: "Observaciones", key: "observaciones", width: 30 },
    ];

    const detallesHeader = detallesSheet.getRow(1);
    detallesHeader.height = 22;
    detallesHeader.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1976D2" },
      };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFB0C4DE" } },
      };
    });

    asistencia.forEach((d, index) => {
      const row = detallesSheet.addRow({
        apellido: d.apellido || "",
        nombre: d.nombre || "",
        materia: d.materia || "Sin especificar",
        fecha: d.fecha,
        estado:
          d.estado === "presente"
            ? "✓ Presente"
            : d.estado === "ausente"
            ? "✗ Ausente"
            : d.estado === "justificado"
            ? "📄 Justificado"
            : "⚪ Sin Registrar",
        observaciones: "",
      });

      row.eachCell((cell) => {
        cell.border = {
          bottom: { style: "hair", color: { argb: "FFDCDCDC" } },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });

      if (index % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
          };
        });
      }
    });

    detallesSheet.addRow([]);
    detallesSheet.addRow(["Total registros", asistencia.length]);
    detallesSheet.getRow(detallesSheet.lastRow.number).font = { bold: true };

    // ===== HOJA 3: ESTADÍSTICAS =====
    const statsSheet = workbook.addWorksheet("Estadísticas", {
      views: [{ state: "frozen", ySplit: 3 }],
    });
    statsSheet.columns = [
      { width: 28 },
      { width: 22 },
    ];

    statsSheet.mergeCells("A1", "B1");
    const statsTitle = statsSheet.getCell("A1");
    statsTitle.value = "ESTADÍSTICAS DE ASISTENCIA";
    statsTitle.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    statsTitle.alignment = { horizontal: "center", vertical: "middle" };
    statsTitle.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1976D2" },
    };
    statsSheet.getRow(1).height = 28;

    statsSheet.addRow([]);
    statsSheet.addRow(["Curso", cursoLabel]);
    statsSheet.addRow(["Fecha de generación", new Date().toLocaleDateString("es-AR")]);
    statsSheet.addRow(["Total de alumnos", alumnosAgrupados().length]);
    statsSheet.addRow(["Total de registros", asistencia.length]);

    const summaryHeaderRow = statsSheet.addRow([]);
    statsSheet.mergeCells(`A${summaryHeaderRow.number}:B${summaryHeaderRow.number}`);
    const summaryHeaderCell = statsSheet.getCell(`A${summaryHeaderRow.number}`);
    summaryHeaderCell.value = "RESUMEN POR ESTADO";
    summaryHeaderCell.font = { bold: true, color: { argb: "FF1976D2" } };
    summaryHeaderCell.alignment = { horizontal: "left", vertical: "middle" };

    const presentCount = asistencia.filter((a) => a.estado === "presente").length;
    const absentCount = asistencia.filter((a) => a.estado === "ausente").length;
    const justifiedCount = asistencia.filter((a) => a.estado === "justificado").length;
    const attendanceAvg = `${Math.round((presentCount / (asistencia.length || 1)) * 100)}%`;

    const statRows = [
      ["Presentes", presentCount],
      ["Ausentes", absentCount],
      ["Justificados", justifiedCount],
      ["Promedio de asistencia", attendanceAvg],
    ];

    statRows.forEach(([label, value], index) => {
      const row = statsSheet.addRow([label, value]);
      row.eachCell((cell) => {
        cell.border = {
          bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
        };
      });
      if (index % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF7F9FC" },
          };
        });
      }
      row.getCell(1).font = { bold: true };
      row.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
    });

    const noteRow = statsSheet.addRow(["Nota", "Los valores están calculados sobre los registros de asistencia cargados."]);
    noteRow.getCell(1).font = { italic: true, color: { argb: "FF6B7280" } };
    noteRow.getCell(2).alignment = { wrapText: true };
    statsSheet.getRow(noteRow.number).height = 24;

    statsSheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", horizontal: cell.col === 2 ? "center" : "left" };
      });
    });

    const filename = `Asistencia_${cursoLabel}_${new Date().toISOString().split("T")[0]}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      filename
    );
  };

  // 🖨️ EXPORTAR PDF PROFESIONAL
  const exportarPDF = () => {
    if (asistencia.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    // ===== PORTADA =====
    // Gradient background (simulado con color sólido)
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont(undefined, "bold");
    doc.text("REPORTE DE ASISTENCIA", pageWidth / 2, pageHeight / 2 - 20, {
      align: "center",
    });

    // Separador
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(2);
    doc.line(
      margin,
      pageHeight / 2 - 5,
      pageWidth - margin,
      pageHeight / 2 - 5
    );

    // Información del reporte
    doc.setFontSize(14);
    doc.setFont(undefined, "normal");
    const cursoData = cursos.find((c) => c.id_curso === parseInt(cursoSeleccionado));
    const cursoLabel =
      cursoData?.curso_display ||
      cursoData?.nombre ||
      `${cursoData?.anio || "?"}° ${cursoData?.division || "?"}`;

    doc.text(`Curso: ${cursoLabel}`, pageWidth / 2, pageHeight / 2 + 15, {
      align: "center",
    });
    doc.text(
      `Fecha: ${new Date().toLocaleDateString("es-AR")}`,
      pageWidth / 2,
      pageHeight / 2 + 25,
      { align: "center" }
    );

    doc.setFontSize(11);
    doc.setTextColor(200, 200, 200);
    doc.text(
      `Generado el ${new Date().toLocaleString("es-AR")}`,
      pageWidth / 2,
      pageHeight - margin - 10,
      { align: "center" }
    );

    // NUEVA PÁGINA - ESTADÍSTICAS
    doc.addPage();
    yPos = margin;

    doc.setTextColor(25, 118, 210);
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("📊 ESTADÍSTICAS GENERALES", margin, yPos);

    yPos += 12;
    doc.setDrawColor(25, 118, 210);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 10;
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");

    const totalAlumnos = alumnosAgrupados().length;
    const totalRegistros = asistencia.length;
    const totalPresentes = asistencia.filter(
      (a) => a.estado === "presente"
    ).length;
    const totalAusentes = asistencia.filter(
      (a) => a.estado === "ausente"
    ).length;
    const totalJustificados = asistencia.filter(
      (a) => a.estado === "justificado"
    ).length;
    const promedioAsistencia =
      totalRegistros > 0
        ? Math.round((totalPresentes / totalRegistros) * 100)
        : 0;

    const estadisticas = [
      ["Total de Alumnos", String(totalAlumnos)],
      ["Total de Registros", String(totalRegistros)],
      ["", ""],
      ["Presentes", String(totalPresentes)],
      ["Ausentes", String(totalAusentes)],
      ["Justificados", String(totalJustificados)],
      ["", ""],
      ["Promedio General de Asistencia", `${promedioAsistencia}%`],
    ];

    estadisticas.forEach((dato) => {
      if (dato[0] === "") {
        yPos += 3;
      } else {
        doc.text(`${dato[0]}:`, margin + 5, yPos);
        doc.setFont(undefined, "bold");
        doc.text(dato[1], pageWidth - margin - 20, yPos, { align: "right" });
        doc.setFont(undefined, "normal");
        yPos += 8;
      }
    });

    yPos += 8;

    // Tabla de resumen por alumno
    doc.setTextColor(25, 118, 210);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("👥 RESUMEN POR ALUMNO", margin, yPos);

    yPos += 8;
    autoTable(doc, {
      startY: yPos,
      head: [["Alumno", "Presentes", "Ausentes", "Justificados", "Total", "% Asistencia"]],
      body: alumnosAgrupados().map((alumno) => [
        `${alumno.apellido}, ${alumno.nombre}`,
        String(alumno.presentes),
        String(alumno.ausentes),
        String(alumno.justificados),
        String(alumno.total),
        `${alumno.porcentaje}%`,
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [50, 50, 50],
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      rowPageBreak: "avoid",
      didDrawPage: function (data) {
        // Pie de página
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.getHeight();
        const pageCount = doc.internal.pages.length - 1;

        doc.setTextColor(150, 150, 150);
        doc.setFontSize(10);
        doc.text(
          `Página ${data.pageNumber}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      },
    });

    // NUEVA PÁGINA - REGISTRO DETALLADO
    doc.addPage();
    yPos = margin;

    doc.setTextColor(25, 118, 210);
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("📋 REGISTRO DETALLADO DE ASISTENCIA", margin, yPos);

    yPos += 10;
    doc.setDrawColor(25, 118, 210);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 8;

    // Tabla detallada
    autoTable(doc, {
      startY: yPos,
      head: [["Alumno", "Materia", "Fecha", "Estado"]],
      body: asistencia.map((d) => {
        const estadoEmoji =
          d.estado === "presente"
            ? "✓ Presente"
            : d.estado === "ausente"
            ? "✗ Ausente"
            : d.estado === "justificado"
            ? "📄 Justificado"
            : "⚪ Sin Reg.";

        return [
          `${d.apellido || ""} ${d.nombre || ""}`.trim(),
          d.materia || "Sin especificar",
          d.fecha,
          estadoEmoji,
        ];
      }),
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [50, 50, 50],
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        3: { halign: "center" },
      },
      rowPageBreak: "avoid",
      didDrawPage: function (data) {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.getHeight();

        doc.setTextColor(150, 150, 150);
        doc.setFontSize(10);
        doc.text(
          `Página ${data.pageNumber}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      },
    });

    // Guardar archivo
    const filename = `Asistencia_${cursoLabel}_${new Date()
      .toISOString()
      .split("T")[0]}.pdf`;
    doc.save(filename);
  };

  const alumnosData = alumnosAgrupados();

  if (!selectedCiclo) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        <FiInfo size={48} style={{ marginBottom: "16px", opacity: 0.6 }} />
        <h3>Selecciona un ciclo lectivo</h3>
        <p>Elige un ciclo lectivo para ver la asistencia.</p>
      </div>
    );
  }

  return (
    <div className="asistencia-container">
      {/* Header */}
      <div className="asistencia-header">
        <div className="header-content">
          <h1 className="header-title">
            <FiBarChart2
              className="header-icon"
              title="Reporte de asistencia"
              aria-label="Icono de reporte de asistencia"
            />
            Control de Asistencia
          </h1>
          <p className="header-subtitle">
            Visualiza y exporta reportes detallados de asistencia
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <FiAlertCircle className="alert-icon" />
          <span>{error}</span>
          <button
            className="alert-close"
            onClick={() => setError(null)}
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="filters-section">
        <div className="filters-grid">
          {/* Curso */}
          <div className="filter-group">
            <label className="filter-label">
              <FiUsers className="filter-icon" />
              Selecciona un Curso
            </label>
            <div className="select-wrapper">
              <select
                className="filter-select"
                value={cursoSeleccionado}
                onChange={(e) => {
                  setCursoSeleccionado(e.target.value);
                  setMateriaSeleccionada("");
                  setAsistencia([]);
                }}
                disabled={loadingCursos}
              >
                <option value="">
                  {loadingCursos ? "Cargando..." : "-- Elige un curso --"}
                </option>
                {cursos && cursos.length > 0 ? (
                  cursos.map((c) => {
                    const label =
                      c.curso_display ||
                      c.nombre ||
                      `${c.anio || "?"}° ${c.division || "?"}`.trim();
                    return (
                      <option key={c.id_curso} value={c.id_curso}>
                        {label}
                      </option>
                    );
                  })
                ) : (
                  <option disabled>No hay cursos disponibles</option>
                )}
              </select>
            </div>
          </div>

          {/* Materia */}
          {cursoSeleccionado && (
            <div className="filter-group">
              <label className="filter-label">
                <FiBook className="filter-icon" />
                Materia (Opcional)
              </label>
              <div className="select-wrapper">
                <select
                  className="filter-select"
                  value={materiaSeleccionada}
                  onChange={(e) => setMateriaSeleccionada(e.target.value)}
                  disabled={loadingMaterias || materias.length === 0}
                >
                  <option value="">
                    {loadingMaterias
                      ? "Cargando..."
                      : materias.length === 0
                      ? "Sin materias"
                      : "Todas"}
                  </option>
                  {materias &&
                    materias.map((m) => (
                      <option
                        key={m.id_materia || m.nombre}
                        value={m.id_materia || ""}
                      >
                        {m.nombre}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {/* Botón Buscar */}
          <div className="filter-group">
            <button
              className={`btn-search ${loadingAsistencia ? "loading" : ""}`}
              onClick={obtenerAsistencia}
              disabled={!cursoSeleccionado || loadingAsistencia}
            >
              {loadingAsistencia ? (
                <>
                  <FiLoader className="btn-icon spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <FiFilter className="btn-icon" />
                  Buscar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Búsqueda de Alumno + Vista + Exportar */}
        {asistencia.length > 0 && (
          <>
            <div className="filters-actions">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder="🔍 Buscar alumno..."
                  value={busquedaAlumno}
                  onChange={(e) => setBusquedaAlumno(e.target.value)}
                />
              </div>

              <div className="view-toggle">
                <button
                  className={`toggle-btn ${vistaCards ? "active" : ""}`}
                  onClick={() => setVistaCards(true)}
                >
                  <FiGrid /> Cards
                </button>
                <button
                  className={`toggle-btn ${!vistaCards ? "active" : ""}`}
                  onClick={() => setVistaCards(false)}
                >
                  <FiList /> Tabla
                </button>
              </div>

              <div className="export-buttons">
                <button className="btn-export excel" onClick={exportarExcel}>
                  <FiDownload /> Excel
                </button>
                <button className="btn-export pdf" onClick={exportarPDF}>
                  <FiFileText /> PDF
                </button>
              </div>
            </div>

            <div className="stats-summary">
              <div className="summary-card">
                <span>Total de alumnos</span>
                <strong>{alumnosData.length}</strong>
              </div>
              <div className="summary-card">
                <span>Registros</span>
                <strong>{asistencia.length}</strong>
              </div>
              <div className="summary-card">
                <span>Asistencia promedio</span>
                <strong>
                  {Math.round(
                    (asistencia.filter((a) => a.estado === "presente").length /
                      (asistencia.length || 1)) *
                      100
                  )}%
                </strong>
              </div>
              <div className="summary-card">
                <span>Vista actual</span>
                <strong>{vistaCards ? "Cards" : "Tabla"}</strong>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Contenido */}
      {asistencia.length === 0 ? (
        <div className="empty-state">
          <FiAlertCircle className="empty-icon" />
          <p>Selecciona un curso y haz clic en buscar para ver la asistencia</p>
        </div>
      ) : vistaCards ? (
        // VISTA CARDS
        <div className="content-section">
          <div className="results-header">
            <h2 className="results-title">
              <FiUsers className="title-icon" />
              Resumen por Alumno
            </h2>
            <span className="results-count">{alumnosData.length}</span>
          </div>

          <div className="cards-grid">
            {alumnosData.map((alumno, idx) => (
              <div
                key={alumno.id_alumno || idx}
                className="alumno-card"
              >
                {/* Header */}
                <div className="card-header">
                  <div className="card-name">
                    {alumno.apellido}, {alumno.nombre}
                  </div>
                  <div className="card-percentage">{alumno.porcentaje}%</div>
                </div>

                {/* Stats */}
                <div className="card-stats">
                  <div className="stat-item presente">
                    <div className="stat-value">{alumno.presentes}</div>
                    <div className="stat-label">Presentes</div>
                  </div>
                  <div className="stat-item ausente">
                    <div className="stat-value">{alumno.ausentes}</div>
                    <div className="stat-label">Ausentes</div>
                  </div>
                  <div className="stat-item justificado">
                    <div className="stat-value">{alumno.justificados}</div>
                    <div className="stat-label">Justificados</div>
                  </div>
                  <div className="stat-item total">
                    <div className="stat-value">{alumno.total}</div>
                    <div className="stat-label">Total</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${alumno.porcentaje}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // VISTA TABLA
        <div className="content-section">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Presentes</th>
                  <th>Ausentes</th>
                  <th>Justificados</th>
                  <th>Total</th>
                  <th>Asistencia %</th>
                </tr>
              </thead>
              <tbody>
                {alumnosData.map((alumno, idx) => (
                  <tr key={alumno.id_alumno || idx}>
                    <td className="alumno-nombre">
                      {alumno.apellido}, {alumno.nombre}
                    </td>
                    <td className="stat-presente">{alumno.presentes}</td>
                    <td className="stat-ausente">{alumno.ausentes}</td>
                    <td className="stat-justificado">{alumno.justificados}</td>
                    <td className="stat-total">{alumno.total}</td>
                    <td className="stat-porcentaje">
                      <span className="percentage-badge">
                        {alumno.porcentaje}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectivoAsistencia;