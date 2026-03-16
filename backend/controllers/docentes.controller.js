import pool from "../config/db.js";

// Crear docente
export const crearDocente = async (req, res) => {
  try {
    const { nombre, apellido, titulo, especialidad, id_usuario } = req.body;
    const [result] = await pool.query(
      "INSERT INTO docentes (nombre,apellido,titulo,especialidad,id_usuario) VALUES (?,?,?,?,?)",
      [nombre, apellido, titulo, especialidad, id_usuario]
    );
    res.status(201).json({ message: "Docente creado", id_docente: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear docente" });
  }
};

// Listar docentes
export const listarDocentes = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM docentes");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al listar docentes" });
  }
};

// NUEVA: Obtener las materias y cursos asignados a un docente
export const getMisAsignaciones = async (req, res) => {
  try {
    // Tomamos el id_usuario que viene del middleware de auth o por query para pruebas
    const id_usuario = req.query.id_usuario || 1; 

    const [rows] = await pool.query(
      `SELECT a.id_asignacion, m.nombre_materia, c.nombre_curso 
       FROM asignaciones a
       JOIN materias m ON a.id_materia = m.id_materia
       JOIN cursos c ON a.id_curso = c.id_curso
       JOIN docentes d ON a.id_docente = d.id_docente
       WHERE d.id_usuario = ?`,
      [id_usuario]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error en getMisAsignaciones:", error);
    res.status(500).json({ message: "Error al obtener las materias del docente" });
  }
};