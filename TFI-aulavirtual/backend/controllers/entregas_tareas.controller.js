import { pool } from "../config/db.js";

// ==============================
// ✅ ENTREGAR TAREA (ALUMNO)
// ==============================
export const entregarTarea = async (req, res) => {
  try {
    const { id_tarea, comentario } = req.body;
    const id_usuario = req.user.id;
    const archivo = req.file ? req.file.filename : null;

    console.log("📌 entregarTarea - id_usuario:", id_usuario);
    console.log("📌 archivo:", archivo);
    console.log("📌 comentario:", comentario);

    // Validar campos requeridos
    if (!id_tarea) {
      return res.status(400).json({ error: "ID de tarea requerido" });
    }

    // Obtener id_alumno del id_usuario
    const [alumno] = await pool.query(
      "SELECT id_alumno FROM alumnos WHERE id_usuario = ?",
      [id_usuario]
    );

    if (alumno.length === 0) {
      return res.status(403).json({ 
        error: "No tienes perfil de alumno" 
      });
    }

    const id_alumno = alumno[0].id_alumno;
    console.log("📌 id_alumno:", id_alumno);

    // Verificar que la tarea existe
    const [tarea] = await pool.query(
      "SELECT * FROM tareas WHERE id_tarea = ?",
      [id_tarea]
    );

    if (tarea.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    // Verificar si ya existe una entrega
    const [entregaExistente] = await pool.query(
      "SELECT * FROM entregas_tareas WHERE id_tarea = ? AND id_alumno = ?",
      [id_tarea, id_alumno]
    );

    if (entregaExistente.length > 0) {
      // Actualizar entrega existente
      console.log("📌 Actualizando entrega existente:", entregaExistente[0].id_entrega);
      await pool.query(
        "UPDATE entregas_tareas SET archivo = ?, comentario = ?, estado = 'Entregado', fecha_entrega = CURRENT_TIMESTAMP WHERE id_tarea = ? AND id_alumno = ?",
        [archivo, comentario || null, id_tarea, id_alumno]
      );

      return res.json({
        message: "Tarea actualizada correctamente",
        id_entrega: entregaExistente[0].id_entrega
      });
    }

    // Crear nueva entrega
    console.log("📌 Creando nueva entrega");
    const [result] = await pool.query(
      "INSERT INTO entregas_tareas (id_tarea, id_alumno, archivo, comentario, estado) VALUES (?, ?, ?, ?, 'Entregado')",
      [id_tarea, id_alumno, archivo, comentario || null]
    );

    console.log("✅ Entrega creada:", result.insertId);

    res.json({
      message: "Tarea entregada correctamente",
      id_entrega: result.insertId,
      entrega: {
        id_entrega: result.insertId,
        id_tarea,
        id_alumno,
        archivo,
        comentario,
        estado: "Entregado"
      }
    });

  } catch (error) {
    console.error("❌ Error en entregarTarea:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// ✅ OBTENER ENTREGAS DE UNA TAREA (DOCENTE)
// ==============================
export const obtenerEntregasTarea = async (req, res) => {
  try {
    const { id_tarea } = req.params;
    const id_usuario = req.user.id;

    if (!id_tarea) {
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

    // Verificar que el docente es propietario de la tarea
    const [tarea] = await pool.query(
      "SELECT t.* FROM tareas t JOIN docente_materia_curso dmc ON t.id_materia = dmc.id_materia AND t.id_curso = dmc.id_curso WHERE t.id_tarea = ? AND dmc.id_docente = ?",
      [id_tarea, id_docente]
    );

    if (tarea.length === 0) {
      return res.status(403).json({ 
        error: "No tienes permisos para ver estas entregas" 
      });
    }

    // Obtener entregas con información del alumno
    const [entregas] = await pool.query(
      `SELECT 
        et.*,
        a.id_alumno,
        u.nombre,
        u.email
      FROM entregas_tareas et
      JOIN alumnos a ON et.id_alumno = a.id_alumno
      JOIN usuarios u ON a.id_usuario = u.id_usuario
      WHERE et.id_tarea = ?
      ORDER BY et.fecha_entrega DESC`,
      [id_tarea]
    );

    res.json(entregas);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// ✅ OBTENER ENTREGA POR ID
// ==============================
export const obtenerEntregaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.user.id;

    if (!id) {
      return res.status(400).json({ error: "ID de entrega requerido" });
    }

    const [entrega] = await pool.query(
      `SELECT 
        et.*,
        a.id_alumno,
        u.nombre,
        u.email,
        t.titulo as titulo_tarea
      FROM entregas_tareas et
      JOIN alumnos a ON et.id_alumno = a.id_alumno
      JOIN usuarios u ON a.id_usuario = u.id_usuario
      JOIN tareas t ON et.id_tarea = t.id_tarea
      WHERE et.id_entrega = ?`,
      [id]
    );

    if (entrega.length === 0) {
      return res.status(404).json({ error: "Entrega no encontrada" });
    }

    res.json(entrega[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// ✅ CALIFICAR ENTREGA (DOCENTE)
// ==============================
export const calificarEntrega = async (req, res) => {
  try {
    const { id } = req.params;
    const { nota, comentario } = req.body;
    const id_usuario = req.user.id;

    if (!id) {
      return res.status(400).json({ error: "ID de entrega requerido" });
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

    // Validar nota
    if (nota !== undefined && (isNaN(nota) || nota < 0 || nota > 10)) {
      return res.status(400).json({ 
        error: "La nota debe ser un número entre 0 y 10" 
      });
    }

    // Verificar que la entrega existe y el docente tiene permisos
    const [entrega] = await pool.query(
      `SELECT et.* FROM entregas_tareas et
      JOIN tareas t ON et.id_tarea = t.id_tarea
      JOIN docente_materia_curso dmc ON t.id_materia = dmc.id_materia AND t.id_curso = dmc.id_curso
      WHERE et.id_entrega = ? AND dmc.id_docente = ?`,
      [id, id_docente]
    );

    if (entrega.length === 0) {
      return res.status(403).json({ 
        error: "No tienes permisos para calificar esta entrega" 
      });
    }

    const updateFields = [];
    const updateValues = [];

    if (nota !== undefined) {
      updateFields.push("nota = ?");
      updateValues.push(nota);
    }

    if (comentario !== undefined) {
      updateFields.push("comentario = ?");
      updateValues.push(comentario);
    }

    if (updateFields.length > 0) {
      updateFields.push("estado = 'Corregido'");
      updateValues.push(id);

      await pool.query(
        `UPDATE entregas_tareas SET ${updateFields.join(", ")} WHERE id_entrega = ?`,
        updateValues
      );
    }

    res.json({ message: "Entrega calificada correctamente" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// ✅ OBTENER ENTREGAS DEL ALUMNO
// ==============================
export const obtenerEntregasAlumno = async (req, res) => {
  try {
    const id_alumno = req.user.id;
    const { id_materia, id_curso } = req.query;

    // Obtener entregas del alumno
    const query = `SELECT 
      et.*,
      t.titulo,
      t.descripcion,
      t.fecha_entrega as fecha_limite,
      m.nombre as materia,
      c.nombre as curso
    FROM entregas_tareas et
    JOIN tareas t ON et.id_tarea = t.id_tarea
    JOIN materias m ON t.id_materia = m.id_materia
    JOIN cursos c ON t.id_curso = c.id_curso
    WHERE et.id_alumno = ?
    ${id_materia ? "AND t.id_materia = ?" : ""}
    ${id_curso ? "AND t.id_curso = ?" : ""}
    ORDER BY t.fecha_creacion DESC`;

    const params = [id_alumno];
    if (id_materia) params.push(id_materia);
    if (id_curso) params.push(id_curso);

    const [entregas] = await pool.query(query, params);

    res.json(entregas);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// ✅ DESCARGAR ARCHIVO DE ENTREGA
// ==============================
export const descargarArchivoEntrega = async (req, res) => {
  try {
    const { id } = req.params;

    const [entrega] = await pool.query(
      "SELECT archivo FROM entregas_tareas WHERE id_entrega = ?",
      [id]
    );

    if (entrega.length === 0 || !entrega[0].archivo) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    const filePath = `./uploads/archivos_registros/contenidos/${entrega[0].archivo}`;
    res.download(filePath);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// ✅ ELIMINAR ENTREGA (ALUMNO)
// ==============================
export const eliminarEntrega = async (req, res) => {
  try {
    const { id } = req.params;
    const id_alumno = req.user.id;

    if (!id) {
      return res.status(400).json({ error: "ID de entrega requerido" });
    }

    // Verificar que la entrega pertenece al alumno
    const [entrega] = await pool.query(
      "SELECT * FROM entregas_tareas WHERE id_entrega = ? AND id_alumno = ?",
      [id, id_alumno]
    );

    if (entrega.length === 0) {
      return res.status(403).json({ 
        error: "No tienes permisos para eliminar esta entrega" 
      });
    }

    // Verificar estado - no se puede eliminar si ya está corregida
    if (entrega[0].estado === "Corregido") {
      return res.status(400).json({ 
        error: "No puedes eliminar una entrega ya corregida" 
      });
    }

    await pool.query("DELETE FROM entregas_tareas WHERE id_entrega = ?", [id]);

    res.json({ message: "Entrega eliminada correctamente" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// ✅ OBTENER TAREAS CON ENTREGAS DEL ALUMNO (ALUMNO)
// ==============================
export const obtenerTareasAlumnoWithEntregas = async (req, res) => {
  try {
    const { id_materia, id_curso } = req.params;
    const id_usuario = req.user.id;

    // Validar parámetros
    if (!id_materia || !id_curso) {
      return res.status(400).json({ 
        error: "id_materia e id_curso son requeridos" 
      });
    }

    // Obtener id_alumno del id_usuario
    const [alumno] = await pool.query(
      "SELECT id_alumno FROM alumnos WHERE id_usuario = ?",
      [id_usuario]
    );

    if (alumno.length === 0) {
      return res.status(403).json({ 
        error: "No tienes perfil de alumno" 
      });
    }

    const id_alumno = alumno[0].id_alumno;

    // Obtener tareas con entregas del alumno (LEFT JOIN)
    const [tareas] = await pool.query(
      `SELECT 
        t.id_tarea,
        t.id_materia,
        t.id_curso,
        t.titulo,
        t.descripcion,
        t.fecha_entrega,
        t.fecha_creacion,
        et.id_entrega,
        et.archivo,
        et.comentario,
        et.fecha_entrega as fecha_entrega_alumno,
        et.nota,
        et.estado
      FROM tareas t
      LEFT JOIN entregas_tareas et 
        ON t.id_tarea = et.id_tarea 
        AND et.id_alumno = ?
      WHERE t.id_materia = ? 
        AND t.id_curso = ?
      ORDER BY t.fecha_entrega ASC`,
      [id_alumno, id_materia, id_curso]
    );

    console.log("📌 Tareas encontradas:", tareas.length);
    console.log("📋 Datos tareas:", JSON.stringify(tareas, null, 2));

    // Procesar respuesta para agrupar entrega si existe
    const tareasProcessadas = tareas.map(tarea => {
      const entrega = tarea.id_entrega ? {
        id_entrega: tarea.id_entrega,
        id_tarea: tarea.id_tarea,
        id_alumno: id_alumno,
        archivo: tarea.archivo,
        comentario: tarea.comentario,
        fecha_entrega: tarea.fecha_entrega_alumno,
        nota: tarea.nota,
        estado: tarea.estado
      } : null;

      return {
        id_tarea: tarea.id_tarea,
        id_materia: tarea.id_materia,
        id_curso: tarea.id_curso,
        titulo: tarea.titulo,
        descripcion: tarea.descripcion,
        fecha_entrega: tarea.fecha_entrega,
        fecha_creacion: tarea.fecha_creacion,
        entrega
      };
    });

    res.json(tareasProcessadas);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
