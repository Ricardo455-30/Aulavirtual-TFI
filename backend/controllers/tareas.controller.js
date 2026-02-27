import pool from "../config/db.js";

// =============================
// CREAR TAREA
// =============================
export const crearTarea = async (req, res) => {
  try {
    const {
      id_asignacion,
      titulo,
      descripcion,
      fecha_entrega,
      permite_reintentos,
      max_intentos
    } = req.body;

    await pool.query(
      `INSERT INTO tareas 
      (id_asignacion, titulo, descripcion, fecha_entrega, permite_reintentos, max_intentos)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id_asignacion,
        titulo,
        descripcion,
        fecha_entrega,
        permite_reintentos || false,
        permite_reintentos ? max_intentos || 1 : 1
      ]
    );

    res.json({ message: "Tarea creada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear tarea" });
  }
};
export const listarTareasPorAsignacion = async (req, res) => {
  try {
    const { id_asignacion } = req.params;

    const [rows] = await pool.query(
      `SELECT * FROM tareas 
       WHERE id_asignacion = ?
       ORDER BY fecha_entrega ASC`,
      [id_asignacion]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al listar tareas" });
  }
};