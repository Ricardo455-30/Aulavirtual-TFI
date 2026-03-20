import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import axios from "axios";

const CursosSection = () => {
  const [cursos, setCursos] = useState([]);
  const [nuevoCurso, setNuevoCurso] = useState({
    anio: "",
    division: "",
    turno: "",
    materia: ""
  });

  const token = localStorage.getItem("token");
  const BASE_URL = "http://localhost:8000/api";
  const headers = { Authorization: `Bearer ${token}` };

  // =====================
  // CARGAR CURSOS DEL DOCENTE
  // =====================
  const cargarCursos = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/docentes/mis-cursos`, { headers });
      setCursos(res.data || []);
    } catch (error) {
      console.error("Error cargando cursos:", error);
    }
  };

  useEffect(() => {
    cargarCursos();
  }, []);

  // =====================
  // AGREGAR CURSO + MATERIA
  // =====================
  const handleChange = (e) => {
    setNuevoCurso({ ...nuevoCurso, [e.target.name]: e.target.value });
  };

  const agregarCurso = async () => {
    if (!nuevoCurso.anio || !nuevoCurso.division || !nuevoCurso.turno || !nuevoCurso.materia) {
      alert("Complete todos los campos ⚠️");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/docentes/mis-cursos`, nuevoCurso, { headers });
      // actualizar la lista con el curso agregado
      cargarCursos();
      setNuevoCurso({ anio: "", division: "", turno: "", materia: "" });
    } catch (error) {
      console.error("Error agregando curso:", error);
    }
  };

  // =====================
  // ELIMINAR CURSO
  // =====================
  const eliminarCurso = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/docentes/mis-cursos/${id}`, { headers });
      setCursos(cursos.filter(c => c.id_curso !== id));
    } catch (error) {
      console.error("Error eliminando curso:", error);
    }
  };

  return (
    <div>
      <h2>Gestión de Cursos y Materias</h2>

      {/* FORMULARIO */}
      <div className="curso-form">
        <input
          type="number"
          name="anio"
          placeholder="Ej: 1"
          value={nuevoCurso.anio}
          onChange={handleChange}
        />
        <input
          type="text"
          name="division"
          placeholder="Ej: A"
          value={nuevoCurso.division}
          onChange={handleChange}
        />
        <select name="turno" value={nuevoCurso.turno} onChange={handleChange}>
          <option value="">Seleccionar turno</option>
          <option value="Mañana">Mañana</option>
          <option value="Tarde">Tarde</option>
          <option value="Noche">Noche</option>
        </select>
        <input
          type="text"
          name="materia"
          placeholder="Ej: Matemática"
          value={nuevoCurso.materia}
          onChange={handleChange}
        />

        <button onClick={agregarCurso}>
          <FiPlus /> Agregar
        </button>
      </div>

      {/* LISTADO */}
      <table className="tabla">
        <thead>
          <tr>
            <th>Año</th>
            <th>División</th>
            <th>Turno</th>
            <th>Materias</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cursos.length === 0 ? (
            <tr>
              <td colSpan="5">No hay cursos asignados</td>
            </tr>
          ) : (
            cursos.map((curso) => (
              <tr key={curso.id_curso}>
                <td>{curso.anio}</td>
                <td>{curso.division}</td>
                <td>{curso.turno}</td>
                <td>
                  {curso.materias && curso.materias.length > 0
                    ? curso.materias.map((m) => m.nombre_materia).join(", ")
                    : "Sin materias"}
                </td>
                <td>
                  <button className="btn-eliminar" onClick={() => eliminarCurso(curso.id_curso)}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CursosSection;