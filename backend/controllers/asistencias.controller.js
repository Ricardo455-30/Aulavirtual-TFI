import pool from "../config/db.js";

// Registrar asistencia (docente)
export const registrarAsistencia = async (req, res) => {
  try {
    const { id_alumno, id_curso, fecha, estado } = req.body;
    const [result] = await pool.query(
      "INSERT INTO asistencias (id_alumno,id_curso,fecha,estado) VALUES (?,?,?,?)",
      [id_alumno, id_curso, fecha, estado]
    );
    res.status(201).json({ message: "Asistencia registrada", id_asistencia: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar asistencia" });
  }
};

// Ver asistencias de un alumno
export const verAsistenciasAlumno = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM asistencias WHERE id_alumno = ?",
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener asistencias" });
  }
};
