// controllers/cursos.controller.js
import { pool } from "../config/db.js";

export const crearCurso = async (req, res) => {
  const { nombre, anio, division } = req.body;

  const [rows] = await pool.query(
    "INSERT INTO cursos (nombre, anio, division) VALUES (?, ?, ?)",
    [nombre, anio, division]
  );

  res.json({ id: rows.insertId });
};

export const getCursos = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM cursos");
  res.json(rows);
};