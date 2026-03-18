import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react"; // Usamos los iconos que ya tienes

const TablaAsignaciones = () => {
  const [asignaciones, setAsignaciones] = useState([]);

  const cargarAsignaciones = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/directivos/listado-asignaciones", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setAsignaciones(data);
    } catch (error) {
      console.error("Error cargando asignaciones", error);
    }
  };

  useEffect(() => {
    cargarAsignaciones();
  }, []);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta asignación?")) return;
    
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:8000/api/directivos/eliminar-asignacion/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) cargarAsignaciones(); // Recargar la tabla
  };

  return (
    <div className="section-container" style={{ marginTop: "20px" }}>
      <h3>📋 Materias Asignadas Actualmente</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Docente</th>
              <th>Materia</th>
              <th>Curso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asignaciones.length > 0 ? (
              asignaciones.map((asig) => (
                <tr key={asig.id_asignacion}>
                  <td>{asig.docente_apellido}, {asig.docente_nombre}</td>
                  <td>{asig.nombre_materia}</td>
                  <td>{asig.nombre_curso}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleEliminar(asig.id_asignacion)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{ textAlign: "center" }}>No hay asignaciones cargadas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaAsignaciones;