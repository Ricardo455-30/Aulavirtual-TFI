import pool from "../config/db.js";

export const crearAsignacion = async (req, res) => {
  try {
    const { id_docente, id_materia, id_curso } = req.body;
    await pool.query(
      `INSERT INTO asignaciones (id_docente, id_materia, id_curso)
       VALUES (?, ?, ?)`,
      [id_docente, id_materia, id_curso]
    );
    res.status(201).json({ message: "Asignación creada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear asignación" });
  }
};

// NUEVA: Obtener alumnos inscritos en el curso de una asignación específica
export const getAlumnosPorAsignacion = async (req, res) => {
  try {
    const { id } = req.params; // Este 'id' es el id_asignacion

    const [rows] = await pool.query(
      `SELECT al.id_alumno, al.nombre, al.apellido, al.legajo 
       FROM alumnos al
       JOIN alumnos_cursos ac ON al.id_alumno = ac.id_alumno
       JOIN asignaciones asig ON ac.id_curso = asig.id_curso
       WHERE asig.id_asignacion = ?`,
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error en getAlumnosPorAsignacion:", error);
    res.status(500).json({ message: "Error al obtener los alumnos de la materia" });
  }
};