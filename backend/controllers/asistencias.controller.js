import pool from "../config/db.js";


// Ver asistencias de un alumno
export const verAsistenciasAlumno = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM asistencias WHERE id_alumno = ?",
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener asistencias" });
  }
};

export const registrarAsistencia = async (req, res) => {
  try {

    const asistencias = req.body;

    for (const a of asistencias) {

      await pool.query(
        "INSERT INTO asistencias (id_alumno,id_curso,fecha,estado) VALUES (?,?,?,?)",
        [a.id_alumno, a.id_curso, a.fecha, a.estado]
      );

    }

    res.json({ message: "Asistencias registradas" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar asistencia" });
  }
};

export const obtenerAsistenciasHoy = async (req, res) => {

  const [rows] = await pool.query(
    "SELECT * FROM asistencias WHERE fecha = CURDATE()"
  );

  res.json(rows);

};
