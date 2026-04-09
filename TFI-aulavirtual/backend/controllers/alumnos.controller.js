// controllers/alumnos.controller.js
import { pool } from "../config/db.js";

export const crearAlumno = async (req, res) => {
  try {
    const { id_usuario, matricula, anio } = req.body;

    const [rows] = await pool.query(
      "INSERT INTO alumnos (id_usuario, matricula, anio) VALUES (?, ?, ?)",
      [id_usuario, matricula, anio]
    );

    res.json({ message: "Alumno creado", id: rows.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAlumnos = async (req, res) => {
  const [rows] = await pool.query(`
    SELECT a.*, u.nombre, u.apellido
    FROM alumnos a
    JOIN usuarios u ON a.id_usuario = u.id_usuario
  `);
  res.json(rows);
};

export const inscribirMateria = async (req, res) => {
  try {
    const id_materia = req.params.id;
    const id_usuario = req.user.id;

    if (!id_materia) {
      return res.status(400).json({ error: "Id de materia requerido" });
    }

    if (req.user.rol?.toLowerCase() !== "alumno") {
      return res.status(403).json({ error: "Acceso solo alumnos" });
    }

    const [alumnoRows] = await pool.query(
      "SELECT id_alumno FROM alumnos WHERE id_usuario = ?",
      [id_usuario]
    );

    if (alumnoRows.length === 0) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const id_alumno = alumnoRows[0].id_alumno;

    const [existing] = await pool.query(
      "SELECT id FROM alumno_materia WHERE id_alumno = ? AND id_materia = ?",
      [id_alumno, id_materia]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Ya estás inscripto en esta materia" });
    }

    await pool.query(
      "INSERT INTO alumno_materia (id_alumno, id_materia, estado) VALUES (?, ?, 'Cursando')",
      [id_alumno, id_materia]
    );

    res.json({ message: "Inscripción realizada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al inscribir materia" });
  }
};

export const getMisMaterias = async (req, res) => {
  try {
    if (req.user.rol?.toLowerCase() !== "alumno") {
      return res.status(403).json({ error: "Acceso solo alumnos" });
    }

    const id_usuario = req.user.id;
    const [alumnoRows] = await pool.query(
      "SELECT id_alumno FROM alumnos WHERE id_usuario = ?",
      [id_usuario]
    );

    if (alumnoRows.length === 0) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const id_alumno = alumnoRows[0].id_alumno;

    const [rows] = await pool.query(
      `SELECT 
         m.id_materia,
         m.nombre,
         m.descripcion,
         a.id_curso,
         c.nombre AS curso,
         c.anio,
         c.division,
         am.estado
       FROM alumno_materia am
       JOIN materias m ON am.id_materia = m.id_materia
       JOIN alumnos a ON am.id_alumno = a.id_alumno
       LEFT JOIN cursos c ON c.id_curso = a.id_curso
       WHERE am.id_alumno = ?
       AND am.estado = 'Cursando'`,
      [id_alumno]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener materias inscritas" });
  }
};

export const getMateriasDisponibles = async (req, res) => {
  try {
    if (req.user.rol?.toLowerCase() !== "alumno") {
      return res.status(403).json({ error: "Acceso solo alumnos" });
    }

    const id_usuario = req.user.id;
    const [alumnoRows] = await pool.query(
      "SELECT id_alumno, id_curso FROM alumnos WHERE id_usuario = ?",
      [id_usuario]
    );

    if (alumnoRows.length === 0) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const { id_alumno, id_curso } = alumnoRows[0];

    // Materias asignadas al curso
    const [materiasCurso] = await pool.query(
      `SELECT DISTINCT m.id_materia, m.nombre, m.descripcion
       FROM docente_materia_curso dmc
       JOIN materias m ON dmc.id_materia = m.id_materia
       WHERE dmc.id_curso = ?`,
      [id_curso]
    );

    // Materias inscritas
    const [inscritas] = await pool.query(
      "SELECT id_materia FROM alumno_materia WHERE id_alumno = ?",
      [id_alumno]
    );

    const inscritasIds = inscritas.map(i => i.id_materia);

    // Filtrar disponibles
    const disponibles = materiasCurso.filter(m => !inscritasIds.includes(m.id_materia));

    res.json(disponibles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener materias disponibles" });
  }
};