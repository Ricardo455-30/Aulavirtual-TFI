import pool from "../config/db.js";

export const tutorDeAlumno = async (req, res, next) => {
  const idUsuario = req.user.id_usuario;
  const idAlumno = parseInt(req.params.id);

  const [rows] = await pool.query(
    `SELECT at.id_alumno
     FROM alumnos_tutores at
     JOIN padres_tutores pt ON at.id_tutor = pt.id_tutor
     WHERE pt.id_usuario = ? AND at.id_alumno = ?`,
    [idUsuario, idAlumno]
  );

  if (rows.length === 0)
    return res.status(403).json({ message: "No es tutor de este alumno" });

  next();
};
