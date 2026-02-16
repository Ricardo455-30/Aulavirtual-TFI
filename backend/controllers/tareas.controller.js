import pool from "../config/db.js";

// Crear tarea (docente)
export const crearTarea = async (req, res) => {
  try {
    const { id_asignacion, titulo, descripcion, fecha_entrega } = req.body;
    const [result] = await pool.query(
      "INSERT INTO tareas (id_asignacion,titulo,descripcion,fecha_entrega) VALUES (?,?,?,?)",
      [id_asignacion, titulo, descripcion, fecha_entrega]
    );
    res.status(201).json({ message: "Tarea creada", id_tarea: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear tarea" });
  }
};

// Listar tareas de un curso/asignación
export const listarTareasCurso = async (req, res) => {
  try {
    const { id_asignacion } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM tareas WHERE id_asignacion = ?",
      [id_asignacion]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al listar tareas" });
  }
};
