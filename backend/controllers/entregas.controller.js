import pool from "../config/db.js";

// =============================
// ENTREGAR TAREA
// =============================
export const entregarTarea = async (req, res) => {
  try {
    const { id_tarea, respuesta } = req.body;
    const id_alumno = req.user.id;

    const [[tarea]] = await pool.query(
      "SELECT * FROM tareas WHERE id_tarea = ?",
      [id_tarea]
    );

    if (!tarea) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    // Verificar fecha
    if (new Date(tarea.fecha_entrega) < new Date()) {
      return res.status(400).json({ message: "La fecha de entrega ha vencido" });
    }

    // Contar intentos
    const [[{ total_intentos }]] = await pool.query(
      `SELECT COUNT(*) as total_intentos
       FROM entregas_tareas
       WHERE id_tarea = ? AND id_alumno = ?`,
      [id_tarea, id_alumno]
    );

    if (!tarea.permite_reintentos && total_intentos >= 1) {
      return res.status(400).json({ message: "Solo se permite un intento" });
    }

    if (total_intentos >= tarea.max_intentos) {
      return res.status(400).json({ message: "Máximo de intentos alcanzado" });
    }

    const numero_intento = total_intentos + 1;

    const archivo_url = req.file
      ? req.file.path
      : null;

    await pool.query(
      `INSERT INTO entregas_tareas
      (id_tarea, id_alumno, numero_intento, respuesta, archivo_url)
      VALUES (?, ?, ?, ?, ?)`,
      [id_tarea, id_alumno, numero_intento, respuesta || null, archivo_url]
    );

    res.json({
      message: "Entrega realizada correctamente",
      numero_intento
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al entregar tarea" });
  }
};

//// =============================
// VER ENTREGAS
// =============================
export const verMisEntregas = async (req, res) => {
  try {
    const { id_tarea } = req.params;
    const id_alumno = req.user.id;

    const [rows] = await pool.query(
      `SELECT *
       FROM entregas_tareas
       WHERE id_tarea = ? AND id_alumno = ?
       ORDER BY numero_intento DESC`,
      [id_tarea, id_alumno]
    );

    res.json(rows);

  } catch (error) {
    res.status(500).json({ message: "Error al obtener entregas" });
  }
};
export const verEntregasPorTarea = async (req, res) => {
  try {
    const { id_tarea } = req.params;

    const [rows] = await pool.query(
      `SELECT e.*, u.nombre, u.apellido
       FROM entregas_tareas e
       JOIN usuarios u ON e.id_alumno = u.id
       WHERE e.id_tarea = ?
       ORDER BY u.apellido ASC, e.numero_intento DESC`,
      [id_tarea]
    );

    res.json(rows);

  } catch (error) {
    res.status(500).json({ message: "Error al listar entregas" });
  }
};
export const corregirEntrega = async (req, res) => {
  try {
    const { id_entrega } = req.params;
    const { calificacion, comentario_docente } = req.body;

    await pool.query(
      `UPDATE entregas_tareas
       SET calificacion = ?,
           comentario_docente = ?,
           estado = 'corregida'
       WHERE id_entrega = ?`,
      [calificacion, comentario_docente, id_entrega]
    );

    res.json({ message: "Entrega corregida correctamente" });

  } catch (error) {
    res.status(500).json({ message: "Error al corregir entrega" });
  }
};