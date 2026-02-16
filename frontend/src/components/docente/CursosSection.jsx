import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const CursosSection = () => {
  const [cursos, setCursos] = useState([]);
  const [nuevoCurso, setNuevoCurso] = useState({
    nombre: "",
    division: "",
    materia: ""
  });

  // Cargar desde localStorage
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("cursosDocente")) || [];
    setCursos(data);
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem("cursosDocente", JSON.stringify(cursos));
  }, [cursos]);

  const handleChange = (e) => {
    setNuevoCurso({
      ...nuevoCurso,
      [e.target.name]: e.target.value
    });
  };

  const agregarCurso = () => {
    if (!nuevoCurso.nombre || !nuevoCurso.division || !nuevoCurso.materia) {
      alert("Complete todos los campos ⚠️");
      return;
    }

    const cursoConId = {
      ...nuevoCurso,
      id: Date.now()
    };

    setCursos([...cursos, cursoConId]);
    setNuevoCurso({ nombre: "", division: "", materia: "" });
  };

  const eliminarCurso = (id) => {
    const nuevosCursos = cursos.filter(curso => curso.id !== id);
    setCursos(nuevosCursos);
  };

  return (
    <div>
      <h2>Gestión de Cursos</h2>

      {/* FORMULARIO */}
      <div className="curso-form">
        <input
          type="text"
          name="nombre"
          placeholder="Ej: 1° Año"
          value={nuevoCurso.nombre}
          onChange={handleChange}
        />

        <input
          type="text"
          name="division"
          placeholder="Ej: A"
          value={nuevoCurso.division}
          onChange={handleChange}
        />

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
            <th>Curso</th>
            <th>División</th>
            <th>Materia</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {cursos.length === 0 ? (
            <tr>
              <td colSpan="4">No hay cursos cargados</td>
            </tr>
          ) : (
            cursos.map((curso) => (
              <tr key={curso.id}>
                <td>{curso.nombre}</td>
                <td>{curso.division}</td>
                <td>{curso.materia}</td>
                <td>
                  <button
                    className="btn-eliminar"
                    onClick={() => eliminarCurso(curso.id)}
                  >
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
