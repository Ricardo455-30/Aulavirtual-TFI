import pool from "../config/db.js";

export const enviarMensaje = async (req, res) => {
  const { id_receptor, asunto, contenido } = req.body;
  const id_emisor = req.user.id_usuario;

  await pool.query(
    `INSERT INTO mensajes
     (id_emisor, id_receptor, asunto, contenido, fecha_envio, leido)
     VALUES (?, ?, ?, ?, NOW(), 0)`,
    [id_emisor, id_receptor, asunto, contenido]
  );

  res.status(201).json({ message: "Mensaje enviado" });
};
