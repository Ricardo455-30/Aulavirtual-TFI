import { pool } from "../config/db.js";

// 🔹 Obtener notas (para tu componente)
export const obtenerNotas = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.id_alumno,
        u.nombre,
        u.apellido,
        m.nombre AS materia,
        n.nota,
        n.tipo,
        n.descripcion,
        n.fecha
      FROM notas n
      JOIN alumnos a ON n.id_alumno = a.id_alumno
      JOIN usuarios u ON a.id_usuario = u.id_usuario
      JOIN materias m ON n.id_materia = m.id_materia
      ORDER BY u.apellido ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener notas" });
  }
};

// 🔹 Crear nota
export const crearNota = async (req, res) => {
  try {
    const { id_alumno, id_materia, tipo, descripcion, nota } = req.body;

    if (!id_alumno || !id_materia || !nota) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    await pool.query(
      `INSERT INTO notas 
      (id_alumno, id_materia, tipo, descripcion, nota, fecha)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [id_alumno, id_materia, tipo || "Parcial", descripcion || "", nota]
    );

    res.json({ message: "Nota creada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al crear nota" });
  }
};

// 🔹 Eliminar nota
export const eliminarNota = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM notas WHERE id = ?", [id]);

    res.json({ message: "Nota eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar nota" });
  }
};