// controllers/admin.controller.js
import { pool } from "../config/db.js";

export const aprobarUsuario = async (req, res) => {
  const { id } = req.params;

  await pool.query(
    "UPDATE usuarios SET estado = 'Activo' WHERE id_usuario = ?",
    [id]
  );

  res.json({ message: "Usuario aprobado" });
};

export const rechazarUsuario = async (req, res) => {
  const { id } = req.params;

  await pool.query(
    "UPDATE usuarios SET estado = 'Inactivo' WHERE id_usuario = ?",
    [id]
  );

  res.json({ message: "Usuario rechazado" });
};

export const getPendientes = async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM usuarios WHERE estado = 'Pendiente'"
  );

  res.json(rows);
};