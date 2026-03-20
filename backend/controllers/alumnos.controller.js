import { pool } from "../config/db.js";

/* =========================
   LISTAR TODOS LOS ALUMNOS
========================= */
export const listarAlumnos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, u.email 
       FROM alumnos a
       JOIN usuarios u ON a.id_usuario = u.id_usuario`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al listar alumnos", error });
  }
};

/* =========================
   OBTENER ALUMNO POR ID
========================= */
export const obtenerAlumno = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT a.*, u.email 
       FROM alumnos a
       JOIN usuarios u ON a.id_usuario = u.id_usuario
       WHERE a.id_alumno = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener alumno", error });
  }
};

/* =========================
   CREAR ALUMNO
========================= */
export const crearAlumno = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      dni,
      fecha_nacimiento,
      id_usuario
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO alumnos 
       (nombre, apellido, dni, fecha_nacimiento, id_usuario)
       VALUES (?,?,?,?,?)`,
      [nombre, apellido, dni, fecha_nacimiento, id_usuario]
    );

    res.status(201).json({
      message: "Alumno creado",
      id_alumno: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear alumno", error });
  }
};

/* =========================
   ACTUALIZAR ALUMNO  ✅
========================= */
export const actualizarAlumno = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, dni, fecha_nacimiento } = req.body;

    const [result] = await pool.query(
      `UPDATE alumnos
       SET nombre = ?, apellido = ?, dni = ?, fecha_nacimiento = ?
       WHERE id_alumno = ?`,
      [nombre, apellido, dni, fecha_nacimiento, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    res.json({ message: "Alumno actualizado" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar alumno", error });
  }
};

/* =========================
   ELIMINAR ALUMNO
========================= */
export const eliminarAlumno = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM alumnos WHERE id_alumno = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    res.json({ message: "Alumno eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar alumno", error });
  }
};

/* =========================
    LISTAR CURSOS DE UN ALUMNO
========================= */
export const listarCursosDeAlumno = async (req, res) => {
  try {
    const { id_alumno } = req.params;
    const [rows] = await pool.query(
      `SELECT c.*
       FROM cursos c
       JOIN alumnos_cursos ac ON c.id_curso = ac.id_curso
       WHERE ac.id_alumno = ?`,
      [id_alumno]
    );  
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al listar cursos del alumno", error });
  }
};
export const getAlumnosPorCurso = async (req, res) => {
  try {
    const { id_curso } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        id_alumno,
        nombre,
        apellido,
        dni
      FROM alumnos
      WHERE id_curso = ?
      ORDER BY apellido, nombre
    `, [id_curso]);

    res.json(rows);

  } catch (error) {
    console.error("ERROR GET ALUMNOS POR CURSO:", error);
    res.status(500).json({ message: error.message });
  }
};
export default {
  listarAlumnos,
  obtenerAlumno,
  crearAlumno,
  actualizarAlumno,
  eliminarAlumno,
  listarCursosDeAlumno,
  getAlumnosPorCurso
};

