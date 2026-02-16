import pool from "../config/db.js";

// Crear examen (docente)
export const crearExamen = async (req, res) => {
  try {
    const { id_asignacion, tipo_examen, fecha, descripcion } = req.body;
    const [result] = await pool.query(
      "INSERT INTO examenes (id_asignacion,tipo_examen,fecha,descripcion) VALUES (?,?,?,?)",
      [id_asignacion, tipo_examen, fecha, descripcion]
    );
    res.status(201).json({ message: "Examen creado", id_examen: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear examen" });
  }
};

// Listar exámenes de una asignación
export const listarExamenes = async (req, res) => {
  try {
    const { id_asignacion } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM examenes WHERE id_asignacion = ?",
      [id_asignacion]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al listar exámenes" });
  }
};
