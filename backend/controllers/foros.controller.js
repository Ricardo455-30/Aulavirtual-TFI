import pool from "../config/db.js";

export const crearForo = async (req, res) => {
  const { id_asignacion, titulo } = req.body;

  await pool.query(
    `INSERT INTO foros
     (id_asignacion, titulo, creado_en)
     VALUES (?, ?, NOW())`,
    [id_asignacion, titulo]
  );

  res.status(201).json({ message: "Foro creado" });
};

export const listarForosAsignacion = async (req, res) => {
  const { id_asignacion } = req.params;

  const [rows] = await pool.query(
    `SELECT * FROM foros WHERE id_asignacion = ?`,
    [id_asignacion]
  );

  res.json(rows);
};
