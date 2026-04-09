// controllers/alumnoCurso.controller.js
import { pool } from "../config/db.js";

export const asignarAlumnoCurso = async (req, res) => {
  try {
    const { id_alumno, id_curso } = req.body;

    if (!id_alumno || !id_curso) {
      return res.status(400).json({ error: "id_alumno e id_curso son requeridos" });
    }

    const [alumnoRows] = await pool.query(
      "SELECT id_alumno FROM alumnos WHERE id_alumno = ?",
      [id_alumno]
    );

    if (alumnoRows.length === 0) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    await pool.query(
      "UPDATE alumnos SET id_curso = ? WHERE id_alumno = ?",
      [id_curso, id_alumno]
    );

    res.json({ message: "Curso asignado correctamente al alumno" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al asignar curso al alumno" });
  }
};