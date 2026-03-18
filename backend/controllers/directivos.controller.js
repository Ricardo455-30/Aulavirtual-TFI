import pool from "../config/db.js";

// 1. Obtener listas para los selectores (Docentes, Alumnos, Materias, Cursos)
// Esto sirve para que el directivo pueda elegir de una lista desplegable
export const getDatosAsignacion = async (req, res) => {
  try {
    const [docentes] = await pool.query("SELECT id_docente, nombre, apellido FROM docentes");
    const [materias] = await pool.query("SELECT id_materia, nombre_materia FROM materias");
    const [cursos] = await pool.query("SELECT id_curso, nombre_curso FROM cursos");
    const [alumnos] = await pool.query("SELECT id_alumno, nombre, apellido FROM alumnos");

    res.json({ docentes, materias, cursos, alumnos });
  } catch (error) {
    console.error("Error en getDatosAsignacion:", error);
    res.status(500).json({ message: "Error al obtener datos para las asignaciones" });
  }
};

// 2. Vincular Alumno con Curso (Tabla intermedia: alumnos_cursos)
export const asignarAlumnoACurso = async (req, res) => {
  try {
    const { id_alumno, id_curso } = req.body;

    // Validación: No permitir campos vacíos
    if (!id_alumno || !id_curso) {
      return res.status(400).json({ message: "Faltan datos obligatorios (alumno o curso)" });
    }
    
    // Validación: Evitar duplicados (que un alumno no se inscriba dos veces al mismo curso)
    const [existe] = await pool.query(
      "SELECT * FROM alumnos_cursos WHERE id_alumno = ? AND id_curso = ?",
      [id_alumno, id_curso]
    );

    if (existe.length > 0) {
      return res.status(400).json({ message: "El alumno ya está vinculado a este curso" });
    }

    // Insertamos la relación en la base de datos
    await pool.query(
      "INSERT INTO alumnos_cursos (id_alumno, id_curso) VALUES (?, ?)",
      [id_alumno, id_curso]
    );

    res.status(201).json({ message: "Alumno vinculado al curso exitosamente ✅" });
  } catch (error) {
    console.error("Error en asignarAlumnoACurso:", error);
    res.status(500).json({ message: "Error interno al vincular el alumno" });
  }
};

// Obtener el listado completo de asignaciones con nombres reales
export const getListadoAsignaciones = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id_asignacion,
        d.nombre AS docente_nombre, d.apellido AS docente_apellido,
        m.nombre_materia,
        c.nombre_curso
      FROM asignaciones a
      JOIN docentes d ON a.id_docente = d.id_docente
      JOIN materias m ON a.id_materia = m.id_materia
      JOIN cursos c ON a.id_curso = c.id_curso
      ORDER BY d.apellido ASC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el listado de asignaciones" });
  }
};

// Eliminar una asignación (por si el directivo se equivoca)
export const eliminarAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM asignaciones WHERE id_asignacion = ?", [id]);
    res.json({ message: "Asignación eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la asignación" });
  }
};