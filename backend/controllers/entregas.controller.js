import pool from "../config/db.js";

export const entregarTarea = async (req, res) => {
  const { id_tarea, archivo_url } = req.body;
  const id_alumno = req.user.id_usuario;

  await pool.query(
    `INSERT INTO entregas_tareas
     (id_tarea, id_alumno, archivo_url, fecha_entrega)
     VALUES (?, ?, ?, NOW())`,
    [id_tarea, id_alumno, archivo_url]
  );

  res.status(201).json({ message: "Tarea entregada" });
};

export const calificarEntrega = async (req, res) => {
  const { id_entrega, calificacion } = req.body;

  await pool.query(
    `UPDATE entregas_tareas
     SET calificacion = ?
     WHERE id_entrega = ?`,
    [calificacion, id_entrega]
  );

  res.json({ message: "Entrega calificada" });
};
