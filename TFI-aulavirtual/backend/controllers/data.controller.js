import { pool } from "../config/db.js";

// =============================
// 📘 MATERIAS
// =============================
export const getMaterias = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM materias");
  res.json(rows);
};

// =============================
// 👨‍🏫 DOCENTES
// =============================
export const getDocentes = async (req, res) => {
  const [rows] = await pool.query(`
    SELECT d.id_docente, u.nombre, u.apellido 
    FROM docentes d
    JOIN usuarios u ON d.id_usuario = u.id_usuario
  `);
  res.json(rows);
};

// =============================
// 🎓 CURSOS
// =============================
export const getCursos = async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      id_curso,
      anio,
      division,
      nombre,
      CONCAT(anio, '° ', division) AS curso_display
    FROM cursos
    ORDER BY anio ASC, division ASC
  `);
  res.json(rows);
};