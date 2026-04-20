import { pool } from "../config/db.js";


// ==========================
// 📚 CURSOS
// ==========================
export const obtenerCursos = async (req, res) => {
  try {
    const { id_ciclo } = req.query;
    let query = "SELECT * FROM cursos";
    const params = [];

    if (id_ciclo) {
      query += " WHERE id_ciclo = ?";
      params.push(id_ciclo);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener cursos" });
  }
};


// ==========================
// 👨‍🎓 ALUMNOS POR CURSO
// ==========================
export const obtenerAlumnosPorCurso = async (req, res) => {
  try {
    const { id_curso } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        a.id_alumno,
        u.nombre,
        u.apellido
      FROM alumnos a
      JOIN usuarios u ON a.id_usuario = u.id_usuario
      WHERE a.id_curso = ?
      ORDER BY u.apellido
    `, [id_curso]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener alumnos" });
  }
};


// ==========================
// 📝 CREAR NOTA
// ==========================
export const crearNota = async (req, res) => {
  try {
    const {
      id_alumno,
      id_materia,
      tipo,
      descripcion,
      nota,
      trimestre,
      es_promocion
    } = req.body;

    await pool.query(
      `INSERT INTO notas
      (id_alumno, id_materia, tipo, descripcion, nota, fecha, trimestre, es_promocion)
      VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        id_alumno,
        id_materia,
        tipo,
        descripcion,
        nota,
        trimestre || null,
        es_promocion || false
      ]
    );

    res.json({ message: "Nota creada" });
  } catch (error) {
    res.status(500).json({ error: "Error al crear nota" });
  }
};


// ==========================
// 📝 NOTAS DE UN ALUMNO
// ==========================
export const obtenerNotasAlumno = async (req, res) => {
  try {
    const { id_alumno } = req.params;
    const { id_ciclo } = req.query;

    let query = `
      SELECT 
        m.nombre AS materia,
        n.nota,
        n.tipo,
        n.trimestre,
        n.es_promocion
      FROM notas n
      JOIN materias m ON n.id_materia = m.id_materia
      WHERE n.id_alumno = ?`;
    const params = [id_alumno];

    if (id_ciclo) {
      query += " AND n.id_ciclo = ?";
      params.push(id_ciclo);
    }

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener notas" });
  }
};


// ==========================
// 📊 BOLETÍN POR ALUMNO
// ==========================
export const obtenerBoletinAlumno = async (req, res) => {
  try {
    const { id_alumno } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        m.nombre AS materia,
        MAX(CASE WHEN n.trimestre = 1 THEN n.nota END) AS t1,
        MAX(CASE WHEN n.trimestre = 2 THEN n.nota END) AS t2,
        MAX(CASE WHEN n.trimestre = 3 THEN n.nota END) AS t3,
        MAX(CASE WHEN n.es_promocion = 1 THEN n.nota END) AS final
      FROM alumno_materia am
      JOIN materias m ON am.id_materia = m.id_materia
      LEFT JOIN notas n 
        ON n.id_alumno = am.id_alumno 
        AND n.id_materia = am.id_materia
      WHERE am.id_alumno = ?
      GROUP BY m.id_materia
    `, [id_alumno]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener boletín" });
  }
};


// ==========================
// 📊 BOLETÍN POR CURSO
// ==========================
export const obtenerBoletinCurso = async (req, res) => {
  try {
    const { id_curso } = req.params;
    const { id_ciclo } = req.query;

    let query = `
      SELECT 
        a.id_alumno,
        u.nombre,
        u.apellido,
        m.id_materia,
        m.nombre AS materia,
        MAX(CASE WHEN n.trimestre = 1 THEN n.nota END) AS t1,
        MAX(CASE WHEN n.trimestre = 2 THEN n.nota END) AS t2,
        MAX(CASE WHEN n.trimestre = 3 THEN n.nota END) AS t3,
        MAX(CASE WHEN n.es_promocion = 1 THEN n.nota END) AS final
      FROM alumnos a
      JOIN usuarios u ON a.id_usuario = u.id_usuario
      JOIN alumno_materia am ON am.id_alumno = a.id_alumno
      JOIN materias m ON am.id_materia = m.id_materia
      LEFT JOIN notas n 
        ON n.id_alumno = a.id_alumno 
        AND n.id_materia = m.id_materia
      WHERE a.id_curso = ?`;
    const params = [id_curso];

    if (id_ciclo) {
      query += " AND am.id_ciclo = ?";
      params.push(id_ciclo);
    }

    query += `
      GROUP BY a.id_alumno, u.nombre, u.apellido, m.id_materia, m.nombre
      ORDER BY u.apellido
    `;

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener boletín del curso" });
  }
};