import pool from "../config/db.js";

export const crearAsignacion = async (req, res) => {
  const { id_docente, id_materia, id_curso } = req.body;

  await pool.query(
    `INSERT INTO asignaciones (id_docente, id_materia, id_curso)
     VALUES (?, ?, ?)`,
    [id_docente, id_materia, id_curso]
  );

  res.status(201).json({ message: "Asignación creada" });
};
