// controllers/docenteMateriaCurso.controller.js
import { pool } from "../config/db.js";

export const asignarDocente = async (req, res) => {
  const { id_docente, id_materia, id_curso } = req.body;

  await pool.query(
    "INSERT INTO docente_materia_curso (id_docente, id_materia, id_curso) VALUES (?, ?, ?)",
    [id_docente, id_materia, id_curso]
  );

  res.json({ message: "Docente asignado correctamente" });
};