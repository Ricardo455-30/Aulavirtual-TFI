import pool from "../config/db.js";

export const registrarSancion = async (req, res) => {
  const { id_alumno, tipo_sancion, motivo, docente_responsable, fecha } = req.body;

  await pool.query(
    `INSERT INTO disciplinas_sanciones
     (id_alumno, tipo_sancion, motivo, fecha, docente_responsable)
     VALUES (?, ?, ?, ?, ?)`,
    [id_alumno, tipo_sancion, motivo, fecha, docente_responsable]
  );

  res.status(201).json({ message: "Sanción registrada" });
};
