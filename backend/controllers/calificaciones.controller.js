import pool from "../config/db.js";

// Cargar calificación (docente)
export const cargarCalificacion = async (req, res) => {
  try {
    const { id_alumno, id_asignacion, tipo, id_referencia, nota, fecha } = req.body;
    const [result] = await pool.query(
      "INSERT INTO calificaciones (id_alumno,id_asignacion,tipo,id_referencia,nota,fecha) VALUES (?,?,?,?,?,?)",
      [id_alumno, id_asignacion, tipo, id_referencia, nota, fecha]
    );
    res.status(201).json({ message: "Calificación cargada", id_calificacion: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cargar calificación" });
  }
};

// Ver calificaciones de un alumno
export const verCalificacionesAlumno = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM calificaciones WHERE id_alumno = ?",
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener calificaciones" });
  }
};


// para editar calificacion 
export const editarCalificacion = async (req, res) => {
  try {

    const { id_calificacion } = req.params;
    const { nota } = req.body;

    const [result] = await pool.query(
      `UPDATE calificaciones
       SET nota = ?
       WHERE id_calificacion = ?`,
      [nota, id_calificacion]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Calificación no encontrada" });
    }

    res.json({ message: "Calificación actualizada correctamente" });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Error al actualizar la calificación" });

  }
};

export const verNotasCurso = async (req, res) => {
  try {

    const { id_curso } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        a.id_alumno,
        a.nombre,
        a.apellido,
        a.dni,
        c.nota
      FROM alumnos a
      JOIN alumnos_cursos ac ON a.id_alumno = ac.id_alumno
      LEFT JOIN calificaciones c 
        ON c.id_alumno = a.id_alumno
      WHERE ac.id_curso = ?`,
      [id_curso]
    );

    res.json(rows);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Error al obtener notas" });

  }
};
 
// guardar lnotas 
export const guardarNotasCurso = async (req, res) => {
  try {

    const { curso, notas } = req.body;
    for (const nota of notas) {

  if (!nota.nota) continue;

  await pool.query(
    `INSERT INTO calificaciones 
    (id_alumno, tipo, id_referencia, nota, fecha)
    VALUES (?, 'Examen', ?, ?, NOW())
    ON DUPLICATE KEY UPDATE 
    nota = VALUES(nota)`,
    [nota.id_alumno, curso, nota.nota]
  );

}

    res.json({ message: "Notas guardadas correctamente" });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Error al guardar notas" });

  }
};


