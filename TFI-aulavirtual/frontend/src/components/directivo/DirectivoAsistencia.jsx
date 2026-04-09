import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../css/directivo-asistencia.css";

const DirectivoAsistencia = () => {
  const [data, setData] = useState([]);
  const [cursoId, setCursoId] = useState("");
  const [materiaId, setMateriaId] = useState("");

  const obtenerDatos = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/asistencia/reporte", {
        params: { cursoId, materiaId },
      });
      setData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // 📊 AGRUPAR POR ALUMNO
  const agruparPorAlumno = () => {
    const agrupado = {};

    data.forEach((d) => {
      const key = `${d.apellido} ${d.nombre}`;

      if (!agrupado[key]) {
        agrupado[key] = [];
      }

      agrupado[key].push({
        fecha: d.fecha,
        estado: d.estado,
      });
    });

    return agrupado;
  };

  const alumnos = agruparPorAlumno();

  // 📥 EXPORTAR EXCEL PRO
  const exportarExcel = () => {
    const datos = data.map((d) => ({
      Alumno: `${d.apellido} ${d.nombre}`,
      Curso: `${d.anio}° ${d.division}`,
      Materia: d.materia,
      Fecha: d.fecha,
      Estado: d.estado,
    }));

    const ws = XLSX.utils.json_to_sheet(datos);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencia");

    XLSX.writeFile(wb, "reporte_asistencia.xlsx");
  };

  // 🖨️ EXPORTAR PDF PRO
  const exportarPDF = () => {
    const doc = new jsPDF();

    doc.text("Reporte de Asistencia", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [["Alumno", "Curso", "Materia", "Fecha", "Estado"]],
      body: data.map((d) => [
        `${d.apellido} ${d.nombre}`,
        `${d.anio}° ${d.division}`,
        d.materia,
        d.fecha,
        d.estado,
      ]),
      styles: {
        fontSize: 8,
      },
      headStyles: {
        fillColor: [22, 160, 133],
      },
    });

    doc.save("reporte_asistencia.pdf");
  };

  return (
    <div className="asistencia-container">
      <h2>📊 Control de Asistencia</h2>

      {/* FILTROS */}
      <div className="filtros">
        <input
          placeholder="ID Curso"
          value={cursoId}
          onChange={(e) => setCursoId(e.target.value)}
        />
        <input
          placeholder="ID Materia"
          value={materiaId}
          onChange={(e) => setMateriaId(e.target.value)}
        />

        <button onClick={obtenerDatos}>Buscar</button>
        <button className="excel" onClick={exportarExcel}>
          Exportar Excel
        </button>
        <button className="pdf" onClick={exportarPDF}>
          Exportar PDF
        </button>
      </div>

      {/* TABLA */}
      <div className="tabla-container">
        <table>
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Fechas / Estados</th>
            </tr>
          </thead>

          <tbody>
            {Object.keys(alumnos).map((alumno, index) => (
              <tr key={index}>
                <td className="alumno">{alumno}</td>
                <td>
                  {alumnos[alumno].map((a, i) => (
                    <span
                      key={i}
                      className={`badge ${a.estado.toLowerCase()}`}
                    >
                      {a.fecha} - {a.estado}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DirectivoAsistencia;