import { pool } from "../config/db.js";
import { ensureCicloLectivo } from "../utils/cicloLectivo.js";


// ==========================================
// 🔹 1. OBTENER TODAS LAS NOTAS
// ==========================================
export const obtenerNotas = async (req, res) => {
  try {
    const { id_ciclo } = req.query;
    const params = [];
    let query = `
      SELECT 
        n.id,
        u.id_usuario AS id_alumno,
        u.nombre,
        u.apellido,
        m.nombre AS materia,
        n.nota,
        n.tipo,
        n.descripcion,
        n.fecha,
        n.trimestre,
        n.es_promocion,
        n.id_ciclo
      FROM notas n
      JOIN usuarios u ON u.id_usuario = n.id_alumno
      JOIN materias m ON m.id_materia = n.id_materia`;

    if (id_ciclo) {
      query += " WHERE n.id_ciclo = ?";
      params.push(id_ciclo);
    }

    query += " ORDER BY u.apellido ASC";

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener notas" });
  }
};


// ==========================================
// 🔹 2. CREAR UNA NOTA SIMPLE
// ==========================================
export const crearNota = async (req, res) => {
  try {
    const {
      id_alumno,
      id_materia,
      tipo,
      descripcion,
      nota,
      trimestre,
      es_promocion,
      id_ciclo,
    } = req.body;

    if (!id_alumno || !id_materia || nota === undefined) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const ciclo = await ensureCicloLectivo(id_ciclo);

    await pool.query(
      `INSERT INTO notas 
      (id_alumno, id_materia, tipo, descripcion, nota, fecha, trimestre, es_promocion, id_ciclo)
      VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
      [
        id_alumno,
        id_materia,
        tipo || "Parcial",
        descripcion || "",
        nota,
        trimestre || 1,
        es_promocion || 0,
        ciclo.id_ciclo,
      ]
    );

    res.json({ message: "Nota creada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear nota" });
  }
};


// ==========================================
// 🔹 3. GUARDAR NOTAS MASIVAS (UPDATE/INSERT)
// ==========================================
export const guardarNotas = async (req, res) => {
  try {
    const { materiaId, tipo, trimestre, notas, id_ciclo } = req.body;

    const ciclo = await ensureCicloLectivo(id_ciclo);

    for (const idUsuario in notas) {
      const notaData = notas[idUsuario];

      const {
        nota,
        descripcion = "",
        fecha,
        es_promocion = 0,
      } = notaData;

      // 🔹 OBTENER id_alumno desde id_usuario
      const [alumnoRows] = await pool.query(
        `SELECT id_alumno FROM alumnos WHERE id_usuario = ?`,
        [idUsuario]
      );

      if (!alumnoRows || alumnoRows.length === 0) {
        console.warn(`No se encontró alumno para usuario ${idUsuario}`);
        continue;
      }

      const idAlumno = alumnoRows[0].id_alumno;

      // 🔹 Validar que nota no esté vacía y es numérica
      const notaNumero = nota !== "" ? parseFloat(nota) : null;

      // Solo guardar si hay nota válida
      if (notaNumero !== null && !isNaN(notaNumero)) {
        // 🔹 VERIFICAR SI YA EXISTE LA NOTA
        const [existe] = await pool.query(
          `SELECT id FROM notas 
           WHERE id_alumno = ? 
           AND id_materia = ? 
           AND tipo = ? 
           AND trimestre = ?
           AND id_ciclo = ?`,
          [idAlumno, materiaId, tipo, trimestre, ciclo.id_ciclo]
        );

        if (existe.length > 0) {
          // UPDATE existente
          await pool.query(
            `UPDATE notas 
             SET nota = ?, descripcion = ?, fecha = ?, es_promocion = ?
             WHERE id = ?`,
            [
              notaNumero,
              descripcion,
              fecha || new Date().toISOString(),
              es_promocion,
              existe[0].id,
            ]
          );
        } else {
          // INSERT nuevo
          await pool.query(
            `INSERT INTO notas 
            (id_alumno, id_materia, tipo, descripcion, nota, fecha, trimestre, es_promocion, id_ciclo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              idAlumno,
              materiaId,
              tipo,
              descripcion,
              notaNumero,
              fecha || new Date().toISOString(),
              trimestre,
              es_promocion,
              ciclo.id_ciclo,
            ]
          );
        }

        // ==========================================
        // 🔥 ACTUALIZAR ESTADO EN alumno_materia
        // ==========================================
        let estado = "Cursando";

        if (notaNumero >= 6) estado = "Aprobado";
        else if (notaNumero > 0) estado = "Desaprobado";

        await pool.query(
          `UPDATE alumno_materia 
           SET estado = ?
           WHERE id_alumno = ? AND id_materia = ? AND id_ciclo = ?`,
          [estado, idAlumno, materiaId, ciclo.id_ciclo]
        );
      }
    }

    res.json({ message: "Notas y estados actualizados" });
  } catch (error) {
    console.error("Error guardando notas:", error);
    res.status(500).json({ error: "Error al guardar notas: " + error.message });
  }
};


// ==========================================
// 🔹 4. OBTENER ALUMNOS CON NOTAS POR MATERIA
// ==========================================
export const obtenerAlumnosConNotas = async (req, res) => {
  try {
    const { id } = req.params; // id_materia
    const { tipo, trimestre } = req.query;

    const { id_ciclo } = req.query;
    const params = [tipo, trimestre, id];

    let query = `SELECT 
        u.id_usuario AS id,
        u.nombre,
        u.apellido,
        am.estado,
        n.id AS nota_id,
        n.nota,
        n.descripcion,
        n.fecha,
        n.es_promocion
      FROM alumno_materia am
      JOIN alumnos a ON a.id_alumno = am.id_alumno
      JOIN usuarios u ON u.id_usuario = a.id_usuario
      LEFT JOIN notas n 
        ON n.id_alumno = am.id_alumno
        AND n.id_materia = am.id_materia
        AND n.tipo = ?
        AND n.trimestre = ?
        ${id_ciclo ? "AND n.id_ciclo = ?" : ""}
      WHERE am.id_materia = ?`;

    if (id_ciclo) {
      params.push(id_ciclo);
    }

    const [rows] = await pool.query(query + " ORDER BY u.apellido ASC", params);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener alumnos" });
  }
};


// ==========================================
// 🔹 5. ELIMINAR NOTA
// ==========================================
export const eliminarNota = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM notas WHERE id = ?", [id]);

    res.json({ message: "Nota eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar nota" });
  }
};


// ==========================================
// 🔹 6. OBTENER NOTAS DE UN ALUMNO (BOLETÍN)
// ==========================================
export const obtenerNotasAlumno = async (req, res) => {
  try {
    const { alumnoId } = req.params;

    console.log("📌 obtenerNotasAlumno - alumnoId recibido:", alumnoId);

    // 🔍 Primero verificar si es id_usuario o id_alumno
    // Intenta buscar primero como id_alumno
    let [alumnoCheck] = await pool.query(
      `SELECT id_alumno FROM alumnos WHERE id_alumno = ?`,
      [alumnoId]
    );

    let id_alumno = alumnoId;

    // Si no encuentra como id_alumno, intenta como id_usuario
    if (alumnoCheck.length === 0) {
      console.log("⚠️ No es id_alumno, buscando por id_usuario...");
      [alumnoCheck] = await pool.query(
        `SELECT id_alumno FROM alumnos WHERE id_usuario = ?`,
        [alumnoId]
      );

      if (alumnoCheck.length === 0) {
        console.error("❌ Alumno no encontrado");
        return res.status(404).json({ error: "Alumno no encontrado" });
      }

      id_alumno = alumnoCheck[0].id_alumno;
    }

    console.log("✅ id_alumno resuelto:", id_alumno);

    const { id_ciclo } = req.query;

    let query = `SELECT 
        m.nombre AS materia,
        n.tipo,
        n.nota,
        n.descripcion,
        n.fecha,
        n.trimestre,
        n.es_promocion
      FROM notas n
      JOIN materias m ON m.id_materia = n.id_materia
      WHERE n.id_alumno = ?`;
    const params = [id_alumno];

    if (id_ciclo) {
      query += " AND n.id_ciclo = ?";
      params.push(id_ciclo);
    }

    query += " ORDER BY m.nombre, n.trimestre";

    const [rows] = await pool.query(query, params);

    console.log("✅ Notas encontradas:", rows.length);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error en obtenerNotasAlumno:", error);
    res.status(500).json({ error: "Error al obtener notas del alumno", details: error.message });
  }
};


// ==========================================
// 🔹 7. OBTENER ALUMNOS POR MATERIA (SIN NOTAS)
// ==========================================
export const obtenerAlumnosPorMateria = async (req, res) => {
  try {
    const { id_materia } = req.params;

    const { id_ciclo } = req.query;
    const params = [id_materia];
    let query = `SELECT 
        u.id_usuario AS id,
        u.nombre,
        u.apellido,
        am.estado
      FROM alumno_materia am
      JOIN alumnos a ON a.id_alumno = am.id_alumno
      JOIN usuarios u ON u.id_usuario = a.id_usuario
      WHERE am.id_materia = ?`;

    if (id_ciclo) {
      query += " AND am.id_ciclo = ?";
      params.push(id_ciclo);
    }

    query += " ORDER BY u.apellido ASC";

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener alumnos de la materia" });
  }
};