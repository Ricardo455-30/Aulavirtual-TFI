import pool from "../config/db.js";

// ==============================
// CREAR MATERIA
// ==============================
export const crearMateria = async (req, res) => {
  try {
    const { nombre_materia, carga_horaria, descripcion } = req.body;
    const imagen = req.file ? req.file.path : null;

    const [result] = await pool.query(
      `INSERT INTO materias 
       (nombre_materia, carga_horaria, descripcion, imagen, estado)
       VALUES (?, ?, ?, ?, 'activa')`,
      [nombre_materia, carga_horaria, descripcion, imagen]
    );

    res.status(201).json({ id: result.insertId });

  } catch (error) {
    console.error("ERROR CREAR MATERIA:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// LISTAR MATERIAS (PAGINADO + FILTRO)
// ==============================
export const listarMaterias = async (req, res) => {
  try {
    let { page = 1, limit = 5, estado } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let where = "";
    let params = [];

    if (estado && estado !== "todas") {
      where = "WHERE m.estado = ?";
      params.push(estado);
    }

    // 🔹 TOTAL
    const [totalResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM materias m ${where}`,
      params
    );

    const total = totalResult[0].total;

    // 🔹 DATA
    const [rows] = await pool.query(
      `
      SELECT 
        m.id_materia,
        m.nombre_materia,
        m.carga_horaria,
        m.descripcion,
        m.imagen,
        m.estado,
        c.anio,
        c.division,
        CONCAT(d.nombre, ' ', d.apellido) AS docente
      FROM materias m
      LEFT JOIN asignaciones a ON m.id_materia = a.id_materia
      LEFT JOIN cursos c ON a.id_curso = c.id_curso
      LEFT JOIN docentes d ON a.id_docente = d.id_docente
      ${where}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    res.json({
      data: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error("ERROR LISTAR MATERIAS:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// EDITAR MATERIA
// ==============================
export const editarMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_materia, carga_horaria, descripcion } = req.body;

    const imagen = req.file ? req.file.path : null;

    if (imagen) {
      await pool.query(
        `UPDATE materias 
         SET nombre_materia=?, carga_horaria=?, descripcion=?, imagen=?
         WHERE id_materia=?`,
        [nombre_materia, carga_horaria, descripcion, imagen, id]
      );
    } else {
      await pool.query(
        `UPDATE materias 
         SET nombre_materia=?, carga_horaria=?, descripcion=?
         WHERE id_materia=?`,
        [nombre_materia, carga_horaria, descripcion, id]
      );
    }

    res.json({ message: "Materia actualizada" });

  } catch (error) {
    console.error("ERROR EDITAR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// CAMBIAR ESTADO (ACTIVA / INACTIVA)
// ==============================
export const cambiarEstadoMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    await pool.query(
      `UPDATE materias SET estado = ? WHERE id_materia = ?`,
      [estado, id]
    );

    res.json({ message: "Estado actualizado" });

  } catch (error) {
    console.error("ERROR ESTADO:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// ASIGNAR MATERIA
// ==============================
export const asignarMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_docente, id_curso } = req.body;

    if (!id_docente || !id_curso) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    // evitar duplicados
    await pool.query(
      `DELETE FROM asignaciones WHERE id_materia = ?`,
      [id]
    );

    await pool.query(
      `INSERT INTO asignaciones (id_docente, id_materia, id_curso)
       VALUES (?, ?, ?)`,
      [id_docente, id, id_curso]
    );

    res.json({ message: "Asignación correcta" });

  } catch (error) {
    console.error("ERROR ASIGNAR:", error);
    res.status(500).json({ message: error.message });
  }
};