import React, { useState, useEffect } from "react";
import TablaAsignaciones from "./TablaAsignaciones";

const AsignacionesForm = ({ tipo }) => { // <--- Recibe "docente" o "alumno"
  const [datos, setDatos] = useState({ docentes: [], materias: [], cursos: [], alumnos: [] });
  
  const [asigDocente, setAsigDocente] = useState({ id_docente: "", id_materia: "", id_curso: "" });
  const [asigAlumno, setAsigAlumno] = useState({ id_alumno: "", id_curso: "" });

  useEffect(() => {
    const cargarListas = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/api/directivos/datos-asignacion", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        setDatos(data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
    cargarListas();
  }, []);

  const handleDocente = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/directivos/asignar-docente", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(asigDocente)
      });
      if (res.ok) alert("✅ Docente vinculado correctamente");
      else alert("❌ Error en la vinculación");
    } catch (error) {
      alert("Error de conexión");
    }
  };

  const handleAlumno = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/directivos/asignar-alumno", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(asigAlumno)
      });
      if (res.ok) alert("✅ Alumno inscripto en el curso");
      else {
        const errorData = await res.json();
        alert(`❌ Error: ${errorData.message}`);
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  return (
    <div className="gestion-asignaciones" style={{ marginTop: "20px" }}>
      
      {/* MUESTRA ESTO SOLO SI EL TIPO ES DOCENTE */}
      {tipo === "docente" && (
        <section style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", background: "#f9f9f9" }}>
          <h3>🔗 Nueva Asignación de Materia</h3>
          <form onSubmit={handleDocente} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <select onChange={e => setAsigDocente({...asigDocente, id_docente: e.target.value})} required>
              <option value="">Seleccionar Docente</option>
              {datos.docentes.map(d => <option key={d.id_docente} value={d.id_docente}>{d.apellido}, {d.nombre}</option>)}
            </select>

            <select onChange={e => setAsigDocente({...asigDocente, id_materia: e.target.value})} required>
              <option value="">Seleccionar Materia</option>
              {datos.materias.map(m => <option key={m.id_materia} value={m.id_materia}>{m.nombre_materia}</option>)}
            </select>

            <select onChange={e => setAsigDocente({...asigDocente, id_curso: e.target.value})} required>
              <option value="">Seleccionar Curso</option>
              {datos.cursos.map(c => <option key={c.id_curso} value={c.id_curso}>{c.nombre_curso}</option>)}
            </select>
            <button type="submit" className="btn-vincular">Vincular Docente</button>
          </form>
        </section>
      )}

      {/* MUESTRA ESTO SOLO SI EL TIPO ES ALUMNO */}
      {tipo === "alumno" && (
        <section style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", background: "#f9f9f9" }}>
          <h3>📝 Inscripción de Alumno a Curso</h3>
          <form onSubmit={handleAlumno} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <select onChange={e => setAsigAlumno({...asigAlumno, id_alumno: e.target.value})} required>
              <option value="">Seleccionar Alumno</option>
              {datos.alumnos.map(a => <option key={a.id_alumno} value={a.id_alumno}>{a.apellido}, {a.nombre}</option>)}
            </select>

            <select onChange={e => setAsigAlumno({...asigAlumno, id_curso: e.target.value})} required>
              <option value="">Seleccionar Curso Destino</option>
              {datos.cursos.map(c => <option key={c.id_curso} value={c.id_curso}>{c.nombre_curso}</option>)}
            </select>
            <button type="submit" className="btn-inscribir">Inscribir Alumno</button>
          </form>
        </section>
      )}
      
      {tipo === "docente" && <TablaAsignaciones />} {/* Solo mostramos el listado de asignaciones si es docente */  }
    </div>
  );
};

export default AsignacionesForm;