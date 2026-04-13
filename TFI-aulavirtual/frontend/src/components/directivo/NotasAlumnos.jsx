import { useEffect, useState } from "react";
import axios from "axios";
import {
  FiBarChart2,
  FiBook,
  FiDownload,
  FiChevronDown,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../css/NotasAlumnos.css";

const NotasAlumnos = () => {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [cursoData, setCursoData] = useState(null);
  const [boletins, setBoletin] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedAlumno, setExpandedAlumno] = useState(null);

  const token = localStorage.getItem("token");

  // 🔹 cargar cursos
  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/cursos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCursos(res.data);
    } catch (error) {
      console.error("Error al cargar cursos", error);
    }
  };

  // 🔹 cargar boletín por curso
  const cargarBoletin = async (id_curso) => {
    if (!id_curso) return;

    try {
      setLoading(true);

      // Obtener datos del curso
      const cursoSel = cursos.find(c => c.id_curso === parseInt(id_curso));
      setCursoData(cursoSel);

      const res = await axios.get(
        `http://localhost:8000/api/boletin/curso/${id_curso}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 🔥 AGRUPAR POR ALUMNO
      const agrupado = {};

      res.data.forEach((item) => {
        const key = item.id_alumno;

        if (!agrupado[key]) {
          agrupado[key] = {
            id_alumno: item.id_alumno,
            alumno: `${item.nombre} ${item.apellido}`,
            materias: [],
          };
        }

        agrupado[key].materias.push({
          materia: item.materia,
          t1: item.t1,
          t2: item.t2,
          t3: item.t3,
          final: item.final,
        });
      });

      setBoletin(Object.values(agrupado));
    } catch (error) {
      console.error("Error al obtener boletín", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Calcular promedio
  const calcularPromedio = (notas) => {
    const notasValidas = notas.filter((n) => n !== null && n !== undefined && n !== "-");
    if (notasValidas.length === 0) return "-";
    const suma = notasValidas.reduce((a, b) => a + (parseFloat(b) || 0), 0);
    return (suma / notasValidas.length).toFixed(2);
  };

  // 🔹 Obtener estado de nota
  const getEstadoNota = (nota) => {
    if (!nota || nota === "-") return "neutral";
    const n = parseFloat(nota);
    if (n >= 7) return "aprobado";
    return "desaprobado";
  };

  // 🔹 Generar PDF profesional
  const generarPDF = async () => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 15;

      // 🔹 ENCABEZADO
      pdf.setFillColor(59, 130, 246); // Azul
      pdf.rect(0, 0, pageWidth, 30, "F");

      // Logo/Título
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("AULA VIRTUAL", pageWidth / 2, 12, { align: "center" });
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text("Instituto Educativo", pageWidth / 2, 20, { align: "center" });

      yPosition = 45;

      // 🔹 INFORMACIÓN DEL CURSO
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("BOLETÍN DE CALIFICACIONES", 15, yPosition);

      yPosition += 10;
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(107, 114, 128);

      const fechaActual = new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      pdf.text(
        `Curso: ${cursoData?.nombre || "N/A"} ${cursoData?.division || ""}`,
        15,
        yPosition
      );
      yPosition += 6;
      pdf.text(`Fecha de emisión: ${fechaActual}`, 15, yPosition);
      yPosition += 12;

      // 🔹 TABLA DE ALUMNOS
      const tableData = boletins.map((alumno) => {
        const promedio = calcularPromedio(
          alumno.materias.map((m) => m.final).filter((f) => f && f !== "-")
        );
        const estado =
          promedio !== "-" && parseFloat(promedio) >= 7
            ? "✓ APROBADO"
            : promedio === "-"
            ? "-"
            : "✗ DESAPROBADO";

        return [alumno.alumno, promedio, estado];
      });

      autoTable(pdf, {
        head: [["Alumno", "Promedio Final", "Estado"]],
        body: tableData,
        startY: yPosition,
        margin: { left: 15, right: 15 },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          alignment: "center",
          fontSize: 11,
          padding: 8,
        },
        bodyStyles: {
          textColor: [31, 41, 55],
          fontSize: 10,
          padding: 7,
          alignment: "center",
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { alignment: "left", cellWidth: 90 },
          1: { alignment: "center", cellWidth: 40 },
          2: { alignment: "center", cellWidth: 40 },
        },
        didDrawPage: (data) => {
          // 🔹 PIE DE PÁGINA
          const pageCount = pdf.getNumberOfPages();
          const currentPage = data.pageNumber;

          pdf.setTextColor(107, 114, 128);
          pdf.setFontSize(9);
          pdf.text(
            `Página ${currentPage} de ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
          );
        },
      });

      // 🔹 DETALLES POR ALUMNO EN PÁGINAS ADICIONALES
      boletins.forEach((alumno, index) => {
        pdf.addPage();
        let y = 15;

        // Encabezado de página
        pdf.setFillColor(59, 130, 246);
        pdf.rect(0, 0, pageWidth, 25, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("DETALLES DE CALIFICACIONES", 15, 12);

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${alumno.alumno}`, 15, 22);

        y = 35;

        // Información del alumno
        pdf.setTextColor(31, 41, 55);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text("Resumen Académico", 15, y);

        y += 8;
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(107, 114, 128);

        const promedio = calcularPromedio(
          alumno.materias.map((m) => m.final).filter((f) => f && f !== "-")
        );
        const materiasAprobadas = alumno.materias.filter(
          (m) => m.final && parseFloat(m.final) >= 7
        ).length;
        const materiasDesaprobadas = alumno.materias.filter(
          (m) => m.final && parseFloat(m.final) < 7
        ).length;

        pdf.text(`Promedio General: ${promedio}`, 15, y);
        y += 6;
        pdf.text(`Materias Aprobadas: ${materiasAprobadas}`, 15, y);
        y += 6;
        pdf.text(`Materias Desaprobadas: ${materiasDesaprobadas}`, 15, y);
        y += 10;

        // Tabla de materias
        const materiasData = alumno.materias.map((m) => [
          m.materia,
          m.t1 || "-",
          m.t2 || "-",
          m.t3 || "-",
          m.final || "-",
        ]);

        autoTable(pdf, {
          head: [["Materia", "1° Trim", "2° Trim", "3° Trim", "Nota Final"]],
          body: materiasData,
          startY: y,
          margin: { left: 15, right: 15 },
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            alignment: "center",
            fontSize: 10,
          },
          bodyStyles: {
            textColor: [31, 41, 55],
            fontSize: 9,
            padding: 6,
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251],
          },
          columnStyles: {
            0: { alignment: "left", cellWidth: 60 },
            1: { alignment: "center" },
            2: { alignment: "center" },
            3: { alignment: "center" },
            4: { alignment: "center", fontStyle: "bold" },
          },
        });

        // Pie de página
        const pageNum = pdf.getNumberOfPages();
        pdf.setTextColor(107, 114, 128);
        pdf.setFontSize(9);
        pdf.text(
          `Página ${pageNum} de ${pdf.getNumberOfPages() + boletins.length - index - 1}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      });

      // 🔹 DESCARGAR
      const nombreArchivo = `Boletin_${cursoData?.nombre}_${cursoData?.division || ""}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(nombreArchivo);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF");
    }
  };

  return (
    <div className="notas-container">
      {/* 🔹 HEADER */}
      <div className="notas-header">
        <div className="header-info">
          <h1 className="notas-title">
            <FiBarChart2 className="icon" />
            Boletín de Calificaciones
          </h1>
          <p className="notas-subtitle">
            Gestiona y visualiza las notas de los alumnos por curso
          </p>
        </div>

        {boletins.length > 0 && (
          <button className="btn-descargar" onClick={generarPDF}>
            <FiDownload className="btn-icon" />
            Descargar PDF
          </button>
        )}
      </div>

      {/* 🔹 SELECTOR CON ESTILO */}
      <div className="selector-wrapper">
        <label className="selector-label">
          <FiBook className="label-icon" />
          Seleccionar curso:
        </label>
        <div className="select-container">
          <select
            className="select-curso"
            value={cursoSeleccionado}
            onChange={(e) => {
              const value = e.target.value;
              setCursoSeleccionado(value);
              cargarBoletin(value);
            }}
          >
            <option value="">-- Elige un curso --</option>
            {cursos.map((c) => (
              <option key={c.id_curso} value={c.id_curso}>
                {c.nombre} {c.division}
              </option>
            ))}
          </select>
          <FiChevronDown className="select-icon" />
        </div>
      </div>

      {/* 🔹 CONTENIDO */}
      {loading ? (
        <div className="estado-container">
          <div className="loader"></div>
          <p>Cargando boletín...</p>
        </div>
      ) : boletins.length === 0 ? (
        <div className="estado-container empty">
          <FiAlertCircle className="empty-icon" />
          <p>Selecciona un curso para ver el boletín</p>
        </div>
      ) : (
        <div className="alumnos-grid">
          {boletins.map((alumno, index) => {
            const promedio = calcularPromedio(
              alumno.materias.map((m) => m.final).filter((f) => f && f !== "-")
            );
            const isExpanded = expandedAlumno === index;

            return (
              <div
                key={index}
                className={`alumno-card ${isExpanded ? "expanded" : ""}`}
              >
                {/* 🔹 HEADER TARJETA */}
                <div
                  className="alumno-header"
                  onClick={() =>
                    setExpandedAlumno(isExpanded ? null : index)
                  }
                >
                  <div className="alumno-info">
                    <h3 className="alumno-nombre">{alumno.alumno}</h3>
                    <div className="promedio-badge">
                      Promedio: <strong>{promedio}</strong>
                    </div>
                  </div>

                  <div className="header-actions">
                    {promedio !== "-" && (
                      <span
                        className={`estado-promedio ${
                          parseFloat(promedio) >= 7
                            ? "aprobado"
                            : "desaprobado"
                        }`}
                      >
                        {parseFloat(promedio) >= 7 ? (
                          <>
                            <FiCheckCircle /> Aprobado
                          </>
                        ) : (
                          <>
                            <FiAlertCircle /> Desaprobado
                          </>
                        )}
                      </span>
                    )}
                    <FiChevronDown
                      className={`expand-icon ${isExpanded ? "rotated" : ""}`}
                    />
                  </div>
                </div>

                {/* 🔹 CONTENIDO EXPANDIBLE */}
                {isExpanded && (
                  <div className="alumno-content">
                    <table className="tabla-notas">
                      <thead>
                        <tr>
                          <th>Materia</th>
                          <th>1° Trim</th>
                          <th>2° Trim</th>
                          <th>3° Trim</th>
                          <th>Nota Final</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alumno.materias.map((m, i) => (
                          <tr key={i}>
                            <td className="materia-nombre">{m.materia}</td>
                            <td>
                              <span
                                className={`nota ${getEstadoNota(m.t1)}`}
                              >
                                {m.t1 || "-"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`nota ${getEstadoNota(m.t2)}`}
                              >
                                {m.t2 || "-"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`nota ${getEstadoNota(m.t3)}`}
                              >
                                {m.t3 || "-"}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`nota final ${getEstadoNota(
                                  m.final
                                )}`}
                              >
                                <strong>{m.final || "-"}</strong>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotasAlumnos;