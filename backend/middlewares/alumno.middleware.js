import pool from "../config/db.js";

export const alumnoSoloPropio = async (req, res, next) => {
  const idUsuario = req.user.id_usuario;
  const idAlumnoParam = parseInt(req.params.id);

  const [rows] = await pool.query(
    `SELECT id_alumno
     FROM alumnos
     WHERE id_usuario = ?`,
    [idUsuario]
  );

  if (rows.length === 0)
    return res.status(403).json({ message: "Alumno no encontrado" });

  if (rows[0].id_alumno !== idAlumnoParam)
    return res.status(403).json({ message: "Acceso denegado" });

  next();
};
