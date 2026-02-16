import pool from "../config/db.js";

export const registrarLog = async (id_usuario, accion) => {
  await pool.query(
    `INSERT INTO logs_acciones (id_usuario, accion, fecha)
     VALUES (?, ?, NOW())`,
    [id_usuario, accion]
  );
};
