// controllers/docentes.controller.js
import { pool } from "../config/db.js";

export const crearDocente = async (req, res) => {
  try {
    const { id_usuario, especialidad } = req.body;

    const [rows] = await pool.query(
      "INSERT INTO docentes (id_usuario, especialidad) VALUES (?, ?)",
      [id_usuario, especialidad]
    );

    res.json({ message: "Docente creado", id: rows.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDocentes = async (req, res) => {
  const [rows] = await pool.query(`
    SELECT d.*, u.nombre, u.apellido
    FROM docentes d
    JOIN usuarios u ON d.id_usuario = u.id_usuario
  `);
  res.json(rows);
};