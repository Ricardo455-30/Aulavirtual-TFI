import pool from "../config/db.js";

export const publicarMensaje = async (req, res) => {
  const { id_foro, mensaje } = req.body;
  const id_usuario = req.user.id_usuario;

  await pool.query(
    `INSERT INTO mensajes_foro
     (id_foro, id_usuario, mensaje, fecha)
     VALUES (?, ?, ?, NOW())`,
    [id_foro, id_usuario, mensaje]
  );

  res.status(201).json({ message: "Mensaje publicado" });
};

export const verMensajesForo = async (req, res) => {
  const { id_foro } = req.params;

  const [rows] = await pool.query(
    `SELECT mf.mensaje, mf.fecha, u.nombre, u.apellido
     FROM mensajes_foro mf
     JOIN usuarios u ON mf.id_usuario = u.id_usuario
     WHERE mf.id_foro = ?
     ORDER BY mf.fecha`,
    [id_foro]
  );

  res.json(rows);
};
