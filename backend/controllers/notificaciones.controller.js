import pool from "../config/db.js";

export const crearNotificacion = async (req, res) => {
  const { titulo, mensaje } = req.body;

  const [result] = await pool.query(
    `INSERT INTO notificaciones (titulo, mensaje, fecha_envio)
     VALUES (?, ?, NOW())`,
    [titulo, mensaje]
  );

  res.json({ id_notificacion: result.insertId });
};
