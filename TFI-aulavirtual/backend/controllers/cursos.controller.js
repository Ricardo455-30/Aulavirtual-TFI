// controllers/cursos.controller.js
import { pool } from "../config/db.js";
import { ensureCicloLectivo } from "../utils/cicloLectivo.js";

export const crearCurso = async (req, res) => {
  try {
    const { nombre, anio, division, id_ciclo } = req.body;

    if (!nombre || !anio || !division) {
      return res.status(400).json({ error: "nombre, anio y division son obligatorios" });
    }

    const ciclo = await ensureCicloLectivo(id_ciclo);

    const [rows] = await pool.query(
      "INSERT INTO cursos (nombre, anio, division, id_ciclo) VALUES (?, ?, ?, ?)",
      [nombre, anio, division, ciclo.id_ciclo]
    );

    res.json({ id: rows.insertId, id_ciclo: ciclo.id_ciclo });
  } catch (error) {
    if (error.code === "CICLO_NO_ENCONTRADO" || error.code === "SIN_CICLO_ACTIVO") {
      return res.status(400).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: "Error al crear curso" });
  }
};

export const getCursos = async (req, res) => {
  try {
    const { id_ciclo } = req.query;
    const params = [];
    let query = "SELECT * FROM cursos";

    if (id_ciclo) {
      query += " WHERE id_ciclo = ?";
      params.push(id_ciclo);
    }

    query += " ORDER BY anio DESC, division ASC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener cursos" });
  }
};