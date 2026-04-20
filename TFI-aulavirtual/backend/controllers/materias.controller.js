import { pool } from "../config/db.js";
import { ensureCicloLectivo } from "../utils/cicloLectivo.js";

// ==============================
// ✅ CREAR MATERIA (DIRECTIVO)
// ==============================
export const crearMateria = async (req, res) => {
  try {
    const { nombre, descripcion, id_ciclo } = req.body;
    const creado_por = req.user.id; // viene del middleware JWT

    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    if (id_ciclo) {
      await ensureCicloLectivo(id_ciclo);
    }

    const [result] = await pool.query(
      "INSERT INTO materias (nombre, descripcion, creado_por) VALUES (?, ?, ?)",
      [nombre, descripcion, creado_por]
    );

    res.json({
      message: "Materia creada correctamente",
      id_materia: result.insertId,
      id_ciclo: id_ciclo || null,
    });
  } catch (error) {
    if (error.code === "CICLO_NO_ENCONTRADO" || error.code === "SIN_CICLO_ACTIVO") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// ✅ EDITAR MATERIA (DOCENTE)
// ==============================
export const editarMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, nombre } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID de materia requerido" });
    }

    const updateFields = [];
    const updateValues = [];

    if (nombre !== undefined) {
      updateFields.push("nombre = ?");
      updateValues.push(nombre);
    }

    if (descripcion !== undefined) {
      updateFields.push("descripcion = ?");
      updateValues.push(descripcion);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar" });
    }

    updateValues.push(id);

    await pool.query(
      `UPDATE materias SET ${updateFields.join(", ")} WHERE id_materia = ?`,
      updateValues
    );

    res.json({ message: "Materia actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// ✅ ASIGNAR DOCENTE A MATERIA + CURSO
// ==========================================
export const asignarDocenteMateriaCurso = async (req, res) => {
  try {
    const { id_docente, id_materia, id_curso, id_ciclo } = req.body;

    if (!id_docente || !id_materia || !id_curso) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const ciclo = await ensureCicloLectivo(id_ciclo);

    await pool.query(
      `INSERT INTO docente_materia_curso 
      (id_docente, id_materia, id_curso, id_ciclo)
      VALUES (?, ?, ?, ?)`,
      [id_docente, id_materia, id_curso, ciclo.id_ciclo]
    );

    res.json({ message: "Asignación realizada correctamente", id_ciclo: ciclo.id_ciclo });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Ya está asignado" });
    }
    if (error.code === "CICLO_NO_ENCONTRADO" || error.code === "SIN_CICLO_ACTIVO") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// ✅ OBTENER MATERIAS DEL DOCENTE
// ==========================================
export const obtenerMateriasDocente = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { id_ciclo } = req.query;

    console.log("📚 obtenerMateriasDocente - id_usuario:", id_usuario);

    let query = `SELECT 
        dmc.id,
        m.nombre,
        m.id_materia,
        m.descripcion,
        c.nombre AS curso,
        c.id_curso,
        c.anio,
        c.division,
        d.id_docente,
        dmc.id_ciclo
      FROM docente_materia_curso dmc
      JOIN materias m ON dmc.id_materia = m.id_materia
      JOIN cursos c ON dmc.id_curso = c.id_curso
      JOIN docentes d ON dmc.id_docente = d.id_docente
      WHERE d.id_usuario = ?`;
    const params = [id_usuario];

    if (id_ciclo) {
      query += " AND dmc.id_ciclo = ?";
      params.push(id_ciclo);
    }

    const [rows] = await pool.query(query, params);

    console.log("✅ Materias encontradas:", rows.length);
    console.log("📋 Datos:", rows);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error en obtenerMateriasDocente:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// ✅ SUBIR CONTENIDO (DOCENTE)
// ==========================================
export const subirContenido = async (req, res) => {
  try {
    const { titulo, descripcion, id_materia } = req.body;
    const archivo = req.file?.filename;
    const id_usuario = req.user.id;

    if (!titulo || !id_materia) {
      return res.status(400).json({ error: "Faltan datos: titulo e id_materia son requeridos" });
    }

    if (!archivo) {
      return res.status(400).json({ error: "Archivo no cargado o tipo de archivo no permitido" });
    }

    // Obtener id_docente desde id_usuario
    console.log("[subirContenido] Buscando docente para id_usuario:", id_usuario);
    const [docente] = await pool.query(
      "SELECT id_docente FROM docentes WHERE id_usuario = ?",
      [id_usuario]
    );
    console.log("[subirContenido] Resultado docente:", docente);

    if (docente.length === 0) {
      return res.status(403).json({ error: "Usuario no es docente" });
    }

    const id_docente = docente[0].id_docente;
    console.log("[subirContenido] id_docente encontrado:", id_docente);

    // 🔐 VALIDAR QUE EL DOCENTE PERTENECE A LA MATERIA (en cualquier curso)
    console.log("[subirContenido] Validando permisos para docente:", id_docente, "materia:", id_materia);
    const [validacion] = await pool.query(
      `SELECT * FROM docente_materia_curso
       WHERE id_docente = ? AND id_materia = ?`,
      [id_docente, id_materia]
    );
    console.log("[subirContenido] Resultado validación:", validacion);

    if (validacion.length === 0) {
      return res.status(403).json({
        error: "No tenés permiso para subir contenido en esta materia",
      });
    }

    console.log("[subirContenido] Insertando contenido...");
    const ciclo = await ensureCicloLectivo(id_ciclo || validacion[0].id_ciclo);

    await pool.query(
      `INSERT INTO contenidos
      (id_materia, titulo, descripcion, archivo, subido_por, id_ciclo)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [id_materia, titulo, descripcion, archivo, id_docente, ciclo.id_ciclo]
    );
    console.log("[subirContenido] Contenido insertado exitosamente");

    res.json({ message: "Contenido subido correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// ✅ OBTENER CONTENIDOS POR MATERIA
// ==========================================
export const obtenerContenidos = async (req, res) => {
  try {
    const { id_materia } = req.params;
    const { id_ciclo } = req.query;

    const params = [id_materia];
    let query = `SELECT
        c.id_contenido,
        c.titulo,
        c.descripcion,
        c.archivo,
        c.creado_en,
        c.id_ciclo
      FROM contenidos c
      WHERE c.id_materia = ?`;

    if (id_ciclo) {
      query += " AND c.id_ciclo = ?";
      params.push(id_ciclo);
    }

    query += " ORDER BY c.creado_en DESC";

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// ✅ ELIMINAR CONTENIDO (DOCENTE)
// ==========================================


export const eliminarContenido = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM contenidos WHERE id_contenido = ?", [id]);

    res.json({ message: "Contenido eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const editarContenido = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion } = req.body;

    await pool.query(
      `UPDATE contenidos 
       SET titulo = ?, descripcion = ?
       WHERE id_contenido = ?`,
      [titulo, descripcion, id]
    );

    res.json({ message: "Contenido actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const obtenerMateriasConAsignaciones = async (req, res) => {
  try {
    const { id_ciclo } = req.query;
    let query = `
      SELECT 
  m.id_materia,
  m.nombre AS materia,
  m.descripcion,
  c.id_curso,
  c.nombre AS curso,
  c.division,
  dmc.id,
  dmc.id_docente,
  dmc.id_ciclo,
  u.nombre AS docente_nombre,
  u.apellido AS docente_apellido
FROM materias m
LEFT JOIN docente_materia_curso dmc 
  ON m.id_materia = dmc.id_materia
LEFT JOIN cursos c 
  ON dmc.id_curso = c.id_curso
LEFT JOIN docentes d 
  ON dmc.id_docente = d.id_docente
LEFT JOIN usuarios u 
  ON d.id_usuario = u.id_usuario`;
    const params = [];

    if (id_ciclo) {
      query += " WHERE dmc.id_ciclo = ?";
      params.push(id_ciclo);
    }

    query += " ORDER BY m.id_materia DESC";

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const editarAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_docente, id_curso, id_ciclo } = req.body;

    const campos = [];
    const valores = [];

    if (id_docente) {
      campos.push("id_docente = ?");
      valores.push(id_docente);
    }

    if (id_curso) {
      campos.push("id_curso = ?");
      valores.push(id_curso);
    }

    if (id_ciclo) {
      campos.push("id_ciclo = ?");
      valores.push(id_ciclo);
    }

    if (campos.length === 0) {
      return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar" });
    }

    valores.push(id);

    await pool.query(
      `UPDATE docente_materia_curso SET ${campos.join(", ")} WHERE id = ?`,
      valores
    );

    res.json({ message: "Asignación actualizada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};