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
  try {
    const { id_ciclo } = req.query;
    let query = `
      SELECT 
        id_curso,
        anio,
        division,
        nombre,
        CONCAT(anio, '° ', division) AS curso_display
      FROM cursos`;
    const params = [];

    if (id_ciclo) {
      query += " WHERE id_ciclo = ?";
      params.push(id_ciclo);
    }

    query += `
      ORDER BY anio ASC, division ASC
    `;

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener cursos" });
  }
};