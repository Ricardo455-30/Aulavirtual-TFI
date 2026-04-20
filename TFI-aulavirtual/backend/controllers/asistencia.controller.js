import { pool } from "../config/db.js";
import { ensureCicloLectivo } from "../utils/cicloLectivo.js";

//
// 🧱 1. CREAR CLASE
//
export const crearClase = async (req, res) => {
  try {
    const { id_curso, id_materia, fecha, id_ciclo } = req.body;
    const ciclo = await ensureCicloLectivo(id_ciclo);

    const [result] = await pool.query(
      `INSERT INTO clases (id_curso, id_materia, fecha, id_ciclo)
       VALUES (?, ?, ?, ?)`,
      [id_curso, id_materia, fecha, ciclo.id_ciclo]
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
    const { id_ciclo } = req.query;

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

    const query = `
      SELECT 
        al.id_alumno,
        u.nombre,
        u.apellido
      FROM alumnos al
      INNER JOIN usuarios u ON al.id_usuario = u.id_usuario
      INNER JOIN alumno_materia am 
        ON am.id_alumno = al.id_alumno
      WHERE am.id_materia = ?
      AND am.estado = 'Cursando'` + (id_ciclo ? " AND am.id_ciclo = ?" : "") + `
      ORDER BY u.apellido
      `;

    const [rows] = await pool.query(
      query,
      id_ciclo ? [id_materia, id_ciclo] : [id_materia]
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
    const { dmc_id, fecha, asistencias, id_ciclo } = req.body;

    // Obtener id_curso, id_materia e id_ciclo desde docente_materia_curso
    const [dmcRows] = await pool.query(
      `SELECT id_curso, id_materia, id_ciclo FROM docente_materia_curso WHERE id = ?`,
      [dmc_id]
    );

    if (dmcRows.length === 0) {
      return res.status(404).json({ message: "Asignación no encontrada" });
    }

    const { id_curso, id_materia, id_ciclo: dmcCiclo } = dmcRows[0];
    const ciclo = await ensureCicloLectivo(id_ciclo || dmcCiclo);

    // Crear clase si no existe
    let [claseRows] = await pool.query(
      `SELECT id_clase FROM clases WHERE id_curso = ? AND id_materia = ? AND fecha = ? AND id_ciclo = ?`,
      [id_curso, id_materia, fecha, ciclo.id_ciclo]
    );

    let id_clase;
    if (claseRows.length === 0) {
      const [result] = await pool.query(
        `INSERT INTO clases (id_curso, id_materia, fecha, id_ciclo) VALUES (?, ?, ?, ?)`,
        [id_curso, id_materia, fecha, ciclo.id_ciclo]
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
      ciclo.id_ciclo, // Agregar id_ciclo
    ]);

    await pool.query(
      `
      INSERT INTO asistencia (id_clase, id_alumno, estado, id_ciclo)
      VALUES ?
      ON DUPLICATE KEY UPDATE estado = VALUES(estado), id_ciclo = VALUES(id_ciclo)
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
    const { id_materia, id_ciclo } = req.query;

    const params = [id_materia];
    let query = `
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
      WHERE am.id_materia = ?`;

    if (id_ciclo) {
      query += " AND am.id_ciclo = ? AND cl.id_ciclo = ?";
      params.push(id_ciclo, id_ciclo);
    }

    query += " ORDER BY u.apellido, cl.fecha";

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener planilla" });
  }
};

//
// 📊 5. REPORTE PARA DIRECTIVO (MEJORADO)
//
export const reporteAsistencia = async (req, res) => {
  try {
    const { cursoId, materiaId, desde, hasta, id_ciclo } = req.query;

    // 📌 Primero verificamos que el curso existe
    if (!cursoId) {
      return res.status(400).json({ error: "cursoId es requerido" });
    }

    const [cursoCheck] = await pool.query(
      `SELECT id_curso FROM cursos WHERE id_curso = ?`,
      [cursoId]
    );

    if (cursoCheck.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    // 📌 Obtener estudiantes que han tenido asistencias en clases del curso seleccionado
    let [alumnos] = await pool.query(
      `SELECT DISTINCT al.id_alumno, u.nombre, u.apellido, u.id_usuario
       FROM alumnos al
       JOIN usuarios u ON u.id_usuario = al.id_usuario
       JOIN asistencia a ON a.id_alumno = al.id_alumno
       JOIN clases cl ON cl.id_clase = a.id_clase
       WHERE cl.id_curso = ?
       ORDER BY u.apellido`,
      [cursoId]
    );

    // Si no hay alumnos con asistencias, obtener alumnos del curso para mostrar que no hay registros
    if (alumnos.length === 0) {
      console.warn("⚠️ No hay asistencias registradas, obteniendo alumnos del curso");
      [alumnos] = await pool.query(
        `SELECT DISTINCT al.id_alumno, u.nombre, u.apellido, u.id_usuario
         FROM alumnos al
         JOIN usuarios u ON u.id_usuario = al.id_usuario
         WHERE al.id_curso = ?
         ORDER BY u.apellido`,
        [cursoId]
      );
    }

    if (alumnos.length === 0) {
      console.warn("⚠️ No hay alumnos en este curso");
      return res.json([]);
    }

    console.log(`✅ Encontrados ${alumnos.length} alumnos en el curso ${cursoId}`);

    // 📌 Obtener todas las clases del curso
    let queryClases = `
      SELECT cl.id_clase, cl.id_materia, cl.fecha, m.nombre AS materia
      FROM clases cl
      JOIN materias m ON m.id_materia = cl.id_materia
      WHERE cl.id_curso = ?
    `;
    const paramsClases = [cursoId];

    if (materiaId) {
      queryClases += " AND cl.id_materia = ?";
      paramsClases.push(materiaId);
    }

    // Solo filtrar por id_ciclo si se proporciona y es válido
    if (id_ciclo && id_ciclo !== '' && id_ciclo !== 'undefined') {
      queryClases += " AND cl.id_ciclo = ?";
      paramsClases.push(id_ciclo);
    }

    if (desde && hasta) {
      queryClases += " AND cl.fecha BETWEEN ? AND ?";
      paramsClases.push(desde, hasta);
    }

    queryClases += " ORDER BY cl.fecha DESC";

    const [clases] = await pool.query(queryClases, paramsClases);

    // ✅ Si NO hay clases, igualmente retornamos alumnos (para visualización)
    if (clases.length === 0) {
      console.warn("⚠️ No hay clases registradas, retornando alumnos del curso sin asistencia");
      
      // Retornar alumnos del curso sin asistencias (para que se vea el listado)
      const resultado = alumnos.map(alumno => ({
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        id_usuario: alumno.id_usuario,
        id_alumno: alumno.id_alumno,
        materia: "Sin clases registradas",
        fecha: new Date().toISOString().split("T")[0],
        estado: "sin registrar"
      }));
      
      console.log(`📊 Total de alumnos sin clases: ${resultado.length}`);
      return res.json(resultado);
    }

    console.log(`✅ Encontradas ${clases.length} clases`);

    // 📌 Obtener asistencias
    const [asistencias] = await pool.query(
      `SELECT a.id_alumno, a.id_clase, a.estado
       FROM asistencia a
       JOIN clases cl ON cl.id_clase = a.id_clase
       WHERE cl.id_curso = ? ${materiaId ? "AND cl.id_materia = ?" : ""}
       ${id_ciclo && id_ciclo !== '' && id_ciclo !== 'undefined' ? "AND cl.id_ciclo = ?" : ""}
       ${desde && hasta ? "AND cl.fecha BETWEEN ? AND ?" : ""}`,
      materiaId && id_ciclo && id_ciclo !== '' && id_ciclo !== 'undefined' && desde && hasta
        ? [cursoId, materiaId, id_ciclo, desde, hasta]
        : materiaId && id_ciclo && id_ciclo !== '' && id_ciclo !== 'undefined'
          ? [cursoId, materiaId, id_ciclo]
          : id_ciclo && id_ciclo !== '' && id_ciclo !== 'undefined' && desde && hasta
            ? [cursoId, id_ciclo, desde, hasta]
            : materiaId && desde && hasta
              ? [cursoId, materiaId, desde, hasta]
              : materiaId
                ? [cursoId, materiaId]
                : id_ciclo && id_ciclo !== '' && id_ciclo !== 'undefined'
                  ? [cursoId, id_ciclo]
                  : desde && hasta
                    ? [cursoId, desde, hasta]
                    : [cursoId]
    );

    console.log(`✅ Encontrados ${asistencias.length} registros de asistencia`);

    // 📌 Construir respuesta
    const resultado = [];
    alumnos.forEach(alumno => {
      clases.forEach(clase => {
        const asistencia = asistencias.find(
          a => a.id_alumno === alumno.id_alumno && a.id_clase === clase.id_clase
        );

        resultado.push({
          nombre: alumno.nombre,
          apellido: alumno.apellido,
          id_usuario: alumno.id_usuario,
          id_alumno: alumno.id_alumno,
          materia: clase.materia,
          fecha: clase.fecha,
          estado: asistencia?.estado || null
        });
      });
    });

    console.log(`📊 Total de registros en reporte: ${resultado.length}`);
    res.json(resultado);
  } catch (error) {
    console.error("❌ Error en reporte:", error.message);
    res.status(500).json({ error: "Error en reporte", message: error.message });
  }
};

//
// 📈 6. RESUMEN POR ALUMNO
//
export const resumenAsistencia = async (req, res) => {
  try {
    const { cursoId, materiaId, id_ciclo } = req.query;

    if (!cursoId) {
      return res.status(400).json({ error: "cursoId es requerido" });
    }

    const query = `
      SELECT 
        al.id_alumno,
        u.nombre,
        u.apellido,
        COUNT(DISTINCT cl.id_clase) AS total_clases,
        SUM(CASE WHEN a.estado = 'Presente' THEN 1 ELSE 0 END) AS presentes,
        SUM(CASE WHEN a.estado = 'Ausente' THEN 1 ELSE 0 END) AS ausentes,
        SUM(CASE WHEN a.estado = 'Justificado' THEN 1 ELSE 0 END) AS justificados
      FROM alumnos al
      INNER JOIN usuarios u ON al.id_usuario = u.id_usuario
      LEFT JOIN clases cl ON cl.id_curso = al.id_curso
        ${materiaId ? "AND cl.id_materia = ?" : ""}
        ${id_ciclo ? "AND cl.id_ciclo = ?" : ""}
      LEFT JOIN asistencia a ON a.id_clase = cl.id_clase AND a.id_alumno = al.id_alumno
      WHERE al.id_curso = ?
      GROUP BY al.id_alumno, u.nombre, u.apellido
      ORDER BY u.apellido
      `;

    const params = [];
    if (materiaId) params.push(materiaId);
    if (id_ciclo) params.push(id_ciclo);
    params.push(cursoId);

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error en resumen:", error.message);
    res.status(500).json({ message: "Error en resumen", error: error.message });
  }
};

//
// 🔍 7. DIAGNÓSTICO - VER QUÉ DATOS HAY EN LA BD
//
export const diagnostico = async (req, res) => {
  try {
    // 1️⃣ Verificar cursos
    const [cursos] = await pool.query(
      `SELECT id_curso, anio, division, nombre FROM cursos ORDER BY id_curso`
    );

    // 2️⃣ Verificar alumnos y sus cursos
    const [alumnos] = await pool.query(
      `SELECT al.id_alumno, al.id_curso, u.nombre, u.apellido 
       FROM alumnos al 
       JOIN usuarios u ON u.id_usuario = al.id_usuario
       ORDER BY al.id_curso, u.apellido`
    );

    // 3️⃣ Verificar clases
    const [clases] = await pool.query(
      `SELECT cl.id_clase, cl.id_curso, cl.id_materia, cl.fecha, m.nombre AS materia
       FROM clases cl
       JOIN materias m ON m.id_materia = cl.id_materia
       ORDER BY cl.fecha DESC LIMIT 50`
    );

    // 4️⃣ Verificar asistencias
    const [asistencias] = await pool.query(
      `SELECT a.id, a.id_clase, a.id_alumno, a.estado
       FROM asistencia a
       ORDER BY a.id DESC LIMIT 100`
    );

    // 5️⃣ Verificar si la clase 2 existe y qué datos tiene
    const [clase2] = await pool.query(
      `SELECT cl.id_clase, cl.id_curso, cl.id_materia, cl.fecha, m.nombre AS materia
       FROM clases cl
       JOIN materias m ON m.id_materia = cl.id_materia
       WHERE cl.id_clase = 2`
    );

    // 6️⃣ Verificar alumno 2
    const [alumno2] = await pool.query(
      `SELECT al.id_alumno, al.id_curso, u.nombre, u.apellido 
       FROM alumnos al 
       JOIN usuarios u ON u.id_usuario = al.id_usuario
       WHERE al.id_alumno = 2`
    );

    res.json({
      info: "Diagnóstico de la BD - Verifica si hay datos relacionados",
      resumen: {
        total_cursos: cursos.length,
        total_alumnos: alumnos.length,
        total_clases: clases.length,
        total_asistencias: asistencias.length
      },
      cursos,
      alumnos,
      clases_primeras_20: clases.slice(0, 20),
      asistencias_primeras_20: asistencias.slice(0, 20),
      debug_clase2: clase2.length > 0 ? clase2[0] : "❌ Clase 2 NO EXISTE",
      debug_alumno2: alumno2.length > 0 ? alumno2[0] : "❌ Alumno 2 NO EXISTE"
    });
  } catch (error) {
    console.error("❌ Error en diagnóstico:", error.message);
    res.status(500).json({ error: error.message });
  }
};