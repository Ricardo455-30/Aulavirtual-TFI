import React, { useState, useEffect } from "react";

const CalificacionesSection = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [seleccion, setSeleccion] = useState({
    id_asignacion: "",
    id_alumno: "",
    nota: "",
    periodo: "1",
    tipo: "Examen"
  });
  const [loading, setLoading] = useState(false);

  // 1. Cargar las materias/cursos del docente al iniciar
  useEffect(() => {
    const cargarAsignaciones = async () => {
      try {
        // En un sistema real, el ID del docente viene del token de login
        const res = await fetch("http://localhost:8000/api/docentes/mis-asignaciones");
        const data = await res.json();
        setAsignaciones(data);
      } catch (err) {
        console.error("Error cargando materias", err);
      }
    };
    cargarAsignaciones();
  }, []);

  // 2. Cargar alumnos cuando el docente elige una materia/curso
  const manejarCambioAsignacion = async (e) => {
    const idAsig = e.target.value;
    setSeleccion({ ...seleccion, id_asignacion: idAsig, id_alumno: "" });
    
    if (idAsig) {
      try {
        const res = await fetch(`http://localhost:8000/api/asignaciones/${idAsig}/alumnos`);
        const data = await res.json();
        setAlumnos(data);
      } catch (err) {
        console.error("Error cargando alumnos", err);
      }
    }
  };

  const guardarNota = async () => {
    const { id_alumno, id_asignacion, nota, periodo, tipo } = seleccion;
    
    if (!id_alumno || !id_asignacion || !nota) {
      alert("Por favor, completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/calificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...seleccion,
          nota: parseFloat(nota),
          periodo: parseInt(periodo),
          fecha: new Date().toISOString().split('T')[0]
        }),
      });

      if (response.ok) {
        alert(`✅ Nota cargada correctamente`);
        setSeleccion({ ...seleccion, nota: "" }); // Limpiar solo la nota para seguir cargando
      } else {
        const err = await response.json();
        alert("❌ Error: " + err.message);
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px", background: "#f9f9f9", borderRadius: "10px" }}>
      <h2>Carga de Calificaciones</h2>

      {/* Selector de Materia/Curso */}
      <div style={{ marginBottom: "15px" }}>
        <label>Seleccione Materia y Curso:</label>
        <select value={seleccion.id_asignacion} onChange={manejarCambioAsignacion} style={{ width: "100%", padding: "8px" }}>
          <option value="">-- Seleccionar --</option>
          {asignaciones.map(asig => (
            <option key={asig.id_asignacion} value={asig.id_asignacion}>
              {asig.nombre_materia} - {asig.nombre_curso}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de Alumno (Se habilita solo si hay materia elegida) */}
      <div style={{ marginBottom: "15px" }}>
        <label>Alumno:</label>
        <select 
          value={seleccion.id_alumno} 
          onChange={(e) => setSeleccion({...seleccion, id_alumno: e.target.value})}
          disabled={!seleccion.id_asignacion}
          style={{ width: "100%", padding: "8px" }}
        >
          <option value="">-- Seleccionar Alumno --</option>
          {alumnos.map(al => (
            <option key={al.id_alumno} value={al.id_alumno}>
              {al.apellido}, {al.nombre} (Legajo: {al.legajo})
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <div>
          <label>Trimestre:</label>
          <select value={seleccion.periodo} onChange={(e) => setSeleccion({...seleccion, periodo: e.target.value})}>
            <option value="1">1°</option>
            <option value="2">2°</option>
            <option value="3">3°</option>
          </select>
        </div>
        <div>
          <label>Nota:</label>
          <input 
            type="number" 
            value={seleccion.nota} 
            onChange={(e) => setSeleccion({...seleccion, nota: e.target.value})}
            placeholder="1-10"
            style={{ width: "60px" }}
          />
        </div>
      </div>

      <button onClick={guardarNota} disabled={loading} style={{ width: "100%", padding: "10px", background: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
        {loading ? "Procesando..." : "Registrar Calificación"}
      </button>
    </div>
  );
};

export default CalificacionesSection;