import pool from "../config/db.js";

// ==============================
// CREAR DOCENTE
// ==============================
export const crearDocente = async (req, res) => {
  try {
    const { nombre, apellido, titulo, especialidad, id_usuario } = req.body;

    const [result] = await pool.query(
      `INSERT INTO docentes (nombre, apellido, titulo, especialidad, id_usuario)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, apellido, titulo, especialidad, id_usuario]
    );

    res.status(201).json({
      message: "Docente creado",
      id_docente: result.insertId
    });

  } catch (error) {
    console.error("ERROR CREAR DOCENTE:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// LISTAR DOCENTES (LIBRE O CON TOKEN)
// ==============================
export const listarDocentes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id_docente,
        nombre,
        apellido,
        titulo,
        especialidad
      FROM docentes
    `);

    res.json(rows);

  } catch (error) {
    console.error("ERROR LISTAR DOCENTES:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// MIS ASIGNACIONES (DOCENTE)
// ==============================
export const getMisAsignaciones = async (req, res) => {
  try {
    const id_usuario = req.user?.id || req.query.id_usuario;

    if (!id_usuario) {
      return res.status(400).json({ message: "Falta id_usuario" });
    }

    const [rows] = await pool.query(`
      SELECT 
        a.id_asignacion,
        m.nombre_materia,
        c.anio,
        c.division
      FROM asignaciones a
      JOIN materias m ON a.id_materia = m.id_materia
      JOIN cursos c ON a.id_curso = c.id_curso
      JOIN docentes d ON a.id_docente = d.id_docente
      WHERE d.id_usuario = ?
    `, [id_usuario]);

    res.json(rows);

  } catch (error) {
    console.error("ERROR MIS ASIGNACIONES:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// PERFIL DOCENTE
// ==============================
export const perfilDocente = async (req, res) => {
  try {
    const id_usuario = req.user?.id; // viene del verifyToken

    if (!id_usuario) {
      return res.status(400).json({ message: "Falta id_usuario" });
    }

    const [rows] = await pool.query(`
      SELECT 
        id_docente,
        nombre,
        apellido,
        titulo,
        especialidad
      FROM docentes
      WHERE id_usuario = ?
      LIMIT 1
    `, [id_usuario]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Docente no encontrado" });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error("ERROR PERFIL DOCENTE:", error);
    res.status(500).json({ message: error.message });
  }
};