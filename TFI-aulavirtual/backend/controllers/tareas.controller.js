import { pool } from "../config/db.js";

// ==============================
// ✅ CREAR TAREA (DOCENTE)
// ==============================
export const crearTarea = async (req, res) => {
  try {
    const { id_materia, id_curso, titulo, descripcion, fecha_entrega } = req.body;
    const id_usuario = req.user.id;

    // Validar campos requeridos
    if (!id_materia || !id_curso || !titulo) {
      return res.status(400).json({ 
        error: "Los campos id_materia, id_curso y titulo son obligatorios" 
      });
    }

    // Obtener id_docente a partir del id_usuario
    const [docente] = await pool.query(
      "SELECT id_docente FROM docentes WHERE id_usuario = ?",
      [id_usuario]
    );

    if (docente.length === 0) {
      return res.status(403).json({ 
        error: "No tienes perfil de docente" 
      });
    }

    const id_docente = docente[0].id_docente;

    // Verificar que el docente tenga asignada esta materia en este curso
    const [docenteMateria] = await pool.query(
      "SELECT * FROM docente_materia_curso WHERE id_docente = ? AND id_materia = ? AND id_curso = ?",
      [id_docente, id_materia, id_curso]
    );

    if (docenteMateria.length === 0) {
      return res.status(403).json({ 
        error: "No tienes permisos para crear tareas en esta materia/curso" 
      });
    }

    const [result] = await pool.query(
      "INSERT INTO tareas (id_materia, id_curso, titulo, descripcion, fecha_entrega) VALUES (?, ?, ?, ?, ?)",
      [id_materia, id_curso, titulo, descripcion || null, fecha_entrega || null]
    );

    res.json({
      message: "Tarea creada correctamente",
      id_tarea: result.insertId,
      tarea: {
        id_tarea: result.insertId,
        id_materia,
        id_curso,
        titulo,
        descripcion,
        fecha_entrega,
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// ✅ OBTENER TAREAS POR MATERIA/CURSO
// ==============================
export const obtenerTareas = async (req, res) => {
  try {
    const { id_materia, id_curso } = req.query;

    if (!id_materia || !id_curso) {
      return res.status(400).json({ 
        error: "id_materia e id_curso son requeridos" 
      });
    }

    const [tareas] = await pool.query(
      "SELECT * FROM tareas WHERE id_materia = ? AND id_curso = ? ORDER BY fecha_creacion DESC",
      [id_materia, id_curso]
    );

    res.json(tareas);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// ✅ OBTENER TAREA POR ID
// ==============================
export const obtenerTareaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID de tarea requerido" });
    }

    const [tarea] = await pool.query(
      "SELECT * FROM tareas WHERE id_tarea = ?",
      [id]
    );

    if (tarea.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    res.json(tarea[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// ✅ EDITAR TAREA (DOCENTE)
// ==============================
export const editarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha_entrega } = req.body;
    const id_usuario = req.user.id;

    if (!id) {
      return res.status(400).json({ error: "ID de tarea requerido" });
    }

    // Obtener id_docente del id_usuario
    const [docente] = await pool.query(
      "SELECT id_docente FROM docentes WHERE id_usuario = ?",
      [id_usuario]
    );

    if (docente.length === 0) {
      return res.status(403).json({ error: "No tienes perfil de docente" });
    }

    const id_docente = docente[0].id_docente;

    // Verificar que la tarea existe y el docente tiene permisos
    const [tareaExistente] = await pool.query(
      "SELECT t.* FROM tareas t JOIN docente_materia_curso dmc ON t.id_materia = dmc.id_materia AND t.id_curso = dmc.id_curso WHERE t.id_tarea = ? AND dmc.id_docente = ?",
      [id, id_docente]
    );

    if (tareaExistente.length === 0) {
      return res.status(403).json({ 
        error: "No tienes permisos para editar esta tarea" 
      });
    }

    const updateFields = [];
    const updateValues = [];

    if (titulo !== undefined) {
      updateFields.push("titulo = ?");
      updateValues.push(titulo);
    }

    if (descripcion !== undefined) {
      updateFields.push("descripcion = ?");
      updateValues.push(descripcion);
    }

    if (fecha_entrega !== undefined) {
      updateFields.push("fecha_entrega = ?");
      updateValues.push(fecha_entrega);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        error: "Debe proporcionar al menos un campo para actualizar" 
      });
    }

    updateValues.push(id);

    await pool.query(
      `UPDATE tareas SET ${updateFields.join(", ")} WHERE id_tarea = ?`,
      updateValues
    );

    res.json({ message: "Tarea actualizada correctamente" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// ✅ ELIMINAR TAREA (DOCENTE)
// ==============================
export const eliminarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.user.id;

    if (!id) {
      return res.status(400).json({ error: "ID de tarea requerido" });
    }

    // Obtener id_docente del id_usuario
    const [docente] = await pool.query(
      "SELECT id_docente FROM docentes WHERE id_usuario = ?",
      [id_usuario]
    );

    if (docente.length === 0) {
      return res.status(403).json({ error: "No tienes perfil de docente" });
    }

    const id_docente = docente[0].id_docente;

    // Verificar permisos
    const [tareaExistente] = await pool.query(
      "SELECT t.* FROM tareas t JOIN docente_materia_curso dmc ON t.id_materia = dmc.id_materia AND t.id_curso = dmc.id_curso WHERE t.id_tarea = ? AND dmc.id_docente = ?",
      [id, id_docente]
    );

    if (tareaExistente.length === 0) {
      return res.status(403).json({ 
        error: "No tienes permisos para eliminar esta tarea" 
      });
    }

    // Eliminar también las entregas asociadas
    await pool.query("DELETE FROM entregas_tareas WHERE id_tarea = ?", [id]);
    
    // Eliminar la tarea
    await pool.query("DELETE FROM tareas WHERE id_tarea = ?", [id]);

    res.json({ message: "Tarea eliminada correctamente" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// ✅ OBTENER TAREAS DEL ALUMNO
// ==============================
export const obtenerTareasAlumno = async (req, res) => {
  try {
    const { id_materia, id_curso } = req.params;
    const id_alumno = req.user.id;

    if (!id_materia || !id_curso) {
      return res.status(400).json({ 
        error: "id_materia e id_curso son requeridos" 
      });
    }

    // Verificar que el alumno está inscrito en esta materia
    const [alumnoEnMateria] = await pool.query(
      "SELECT * FROM alumno_materia WHERE id_alumno = ? AND id_materia = ?",
      [id_alumno, id_materia]
    );

    if (alumnoEnMateria.length === 0) {
      return res.status(403).json({ 
        error: "No estás inscrito en esta materia" 
      });
    }

    // Obtener tareas con información de entregas del alumno
    const [tareas] = await pool.query(
      `SELECT 
        t.*,
        et.id_entrega,
        et.archivo,
        et.comentario,
        et.fecha_entrega as fecha_entrega_alumno,
        et.nota,
        et.estado
      FROM tareas t
      LEFT JOIN entregas_tareas et ON t.id_tarea = et.id_tarea AND et.id_alumno = ?
      WHERE t.id_materia = ? AND t.id_curso = ?
      ORDER BY t.fecha_creacion DESC`,
      [id_alumno, id_materia, id_curso]
    );

    res.json(tareas);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
