import { pool } from "../config/db.js";

//
// 🧱 1. CREAR CLASE
//
export const crearClase = async (req, res) => {
  try {
    const { id_curso, id_materia, fecha } = req.body;

    const [result] = await pool.query(
      `INSERT INTO clases (id_curso, id_materia, fecha)
       VALUES (?, ?, ?)`,
      [id_curso, id_materia, fecha]
    );

    res.json({
      message: "Clase creada",
      id_clase: result.insertId,
    });
  } catch (error) {
    console.error(error);

    // evita duplicados por UNIQUE
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "La clase ya existe para ese curso, materia y fecha",
      });
    }

    res.status(500).json({ message: "Error al crear clase" });
  }
};

//
// 📋 2. OBTENER ALUMNOS POR CURSO + MATERIA
//
export const obtenerAlumnosPorCursoMateria = async (req, res) => {
  try {
    const { id } = req.params; // id de docente_materia_curso

    // Obtener id_materia desde docente_materia_curso
    const [dmcRows] = await pool.query(
      `SELECT id_materia FROM docente_materia_curso WHERE id = ?`,
      [id]
    );

    if (dmcRows.length === 0) {
      return res.status(404).json({ message: "Asignación no encontrada" });
    }

    const { id_materia } = dmcRows[0];
    console.log('id_materia:', id_materia);

    const [rows] = await pool.query(
      `
      SELECT 
        al.id_alumno,
        u.nombre,
        u.apellido
      FROM alumnos al
      INNER JOIN usuarios u ON al.id_usuario = u.id_usuario
      INNER JOIN alumno_materia am 
        ON am.id_alumno = al.id_alumno
      WHERE am.id_materia = ?
      AND am.estado = 'Cursando'
      ORDER BY u.apellido
      `,
      [id_materia]
    );

    console.log('Alumnos encontrados:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener alumnos" });
  }
};

//
// 📝 3. REGISTRAR ASISTENCIA
//
export const registrarAsistencia = async (req, res) => {
  try {
    const { dmc_id, fecha, asistencias } = req.body;

    // Obtener id_curso e id_materia desde docente_materia_curso
    const [dmcRows] = await pool.query(
      `SELECT id_curso, id_materia FROM docente_materia_curso WHERE id = ?`,
      [dmc_id]
    );

    if (dmcRows.length === 0) {
      return res.status(404).json({ message: "Asignación no encontrada" });
    }

    const { id_curso, id_materia } = dmcRows[0];

    // Crear clase si no existe
    let [claseRows] = await pool.query(
      `SELECT id_clase FROM clases WHERE id_curso = ? AND id_materia = ? AND fecha = ?`,
      [id_curso, id_materia, fecha]
    );

    let id_clase;
    if (claseRows.length === 0) {
      const [result] = await pool.query(
        `INSERT INTO clases (id_curso, id_materia, fecha) VALUES (?, ?, ?)`,
        [id_curso, id_materia, fecha]
      );
      id_clase = result.insertId;
    } else {
      id_clase = claseRows[0].id_clase;
    }

    // Registrar asistencia
    const values = asistencias.map((a) => [
      id_clase,
      a.alumno_id,
      a.estado,
    ]);

    await pool.query(
      `
      INSERT INTO asistencia (id_clase, id_alumno, estado)
      VALUES ?
      ON DUPLICATE KEY UPDATE estado = VALUES(estado)
      `,
      [values]
    );

    res.json({ message: "Asistencia guardada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar asistencia" });
  }
};

//
// 📅 4. PLANILLA TIPO ESCUELA (FILAS = ALUMNOS, COLUMNAS = FECHAS)
//
export const obtenerPlanilla = async (req, res) => {
  try {
    const { id_materia } = req.query;

    const [rows] = await pool.query(
      `
      SELECT 
        al.id_alumno,
        u.nombre,
        u.apellido,
        cl.fecha,
        a.estado
      FROM alumnos al
      INNER JOIN usuarios u ON al.id_usuario = u.id_usuario
      INNER JOIN alumno_materia am 
        ON am.id_alumno = al.id_alumno
      INNER JOIN clases cl 
        ON cl.id_materia = am.id_materia
      LEFT JOIN asistencia a 
        ON a.id_clase = cl.id_clase 
        AND a.id_alumno = al.id_alumno
      WHERE am.id_materia = ?
      ORDER BY u.apellido, cl.fecha
      `,
      [id_materia]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener planilla" });
  }
};

//
// 📊 5. REPORTE PARA DIRECTIVO
//
export const reporteAsistencia = async (req, res) => {
  try {
    const { cursoId, materiaId, desde, hasta } = req.query;

    let query = `
      SELECT 
        u.nombre,
        u.apellido,
        c.anio,
        c.division,
        m.nombre AS materia,
        cl.fecha,
        a.estado
      FROM asistencia a
      INNER JOIN clases cl ON a.id_clase = cl.id_clase
      INNER JOIN alumnos al ON a.id_alumno = al.id_alumno
      INNER JOIN usuarios u ON al.id_usuario = u.id
      INNER JOIN cursos c ON cl.id_curso = c.id_curso
      INNER JOIN materias m ON cl.id_materia = m.id_materia
      WHERE 1=1
    `;

    const params = [];

    if (cursoId) {
      query += " AND c.id_curso = ?";
      params.push(cursoId);
    }

    if (materiaId) {
      query += " AND m.id_materia = ?";
      params.push(materiaId);
    }

    if (desde && hasta) {
      query += " AND cl.fecha BETWEEN ? AND ?";
      params.push(desde, hasta);
    }

    query += " ORDER BY c.anio, c.division, u.apellido, cl.fecha";

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en reporte" });
  }
};

//
// 📈 6. RESUMEN POR ALUMNO
//
export const resumenAsistencia = async (req, res) => {
  try {
    const { cursoId, materiaId } = req.query;

    const [rows] = await pool.query(
      `
      SELECT 
        al.id_alumno,
        u.nombre,
        u.apellido,
        COUNT(a.id) AS total_clases,
        SUM(a.estado = 'Presente') AS presentes,
        SUM(a.estado = 'Ausente') AS ausentes,
        SUM(a.estado = 'Justificado') AS justificados
      FROM alumnos al
      INNER JOIN usuarios u ON al.id_usuario = u.id
      LEFT JOIN clases cl 
        ON cl.id_curso = al.id_curso
        ${materiaId ? "AND cl.id_materia = ?" : ""}
      LEFT JOIN asistencia a 
        ON a.id_clase = cl.id_clase 
        AND a.id_alumno = al.id_alumno
      WHERE al.id_curso = ?
      GROUP BY al.id_alumno
      ORDER BY u.apellido
      `,
      materiaId ? [materiaId, cursoId] : [cursoId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en resumen" });
  }
};