import pool from "../config/db.js";

// Cargar calificación (docente)
export const cargarCalificacion = async (req, res) => {
  try {
    const { id_alumno, id_asignacion, tipo, id_referencia, nota, fecha } = req.body;
    const [result] = await pool.query(
      "INSERT INTO calificaciones (id_alumno,id_asignacion,tipo,id_referencia,nota,fecha) VALUES (?,?,?,?,?,?)",
      [id_alumno, id_asignacion, tipo, id_referencia, nota, fecha]
    );
    res.status(201).json({ message: "Calificación cargada", id_calificacion: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cargar calificación" });
  }
};

// Ver calificaciones de un alumno
export const verCalificacionesAlumno = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM calificaciones WHERE id_alumno = ?",
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener calificaciones" });
  }
};
