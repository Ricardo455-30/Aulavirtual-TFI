import pool from "../config/db.js";

export const docentePuedeCalificarAlumno = async (req, res, next) => {
  const idUsuario = req.user.id_usuario;
  const { id_alumno, id_asignacion } = req.body;

  const [rows] = await pool.query(
    `SELECT ac.id_alumno
     FROM asignaciones a
     JOIN docentes d ON a.id_docente = d.id_docente
     JOIN alumnos_cursos ac ON a.id_curso = ac.id_curso
     WHERE d.id_usuario = ?
       AND a.id_asignacion = ?
       AND ac.id_alumno = ?`,
    [idUsuario, id_asignacion, id_alumno]
  );

  if (rows.length === 0)
    return res.status(403).json({ message: "Alumno no pertenece a su curso" });

  next();
};
