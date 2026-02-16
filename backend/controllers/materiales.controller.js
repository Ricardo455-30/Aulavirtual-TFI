import pool from "../config/db.js";

// Subir material (docente)
export const subirMaterial = async (req, res) => {
  try {
    const { id_asignacion, titulo, descripcion, archivo_url, fecha_subida } = req.body;
    const [result] = await pool.query(
      "INSERT INTO materiales_estudio (id_asignacion,titulo,descripcion,archivo_url,fecha_subida) VALUES (?,?,?,?,?)",
      [id_asignacion, titulo, descripcion, archivo_url, fecha_subida]
    );
    res.status(201).json({ message: "Material subido", id_material: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al subir material" });
  }
};

// Listar materiales de una asignación
export const listarMateriales = async (req, res) => {
  try {
    const { id_asignacion } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM materiales_estudio WHERE id_asignacion = ?",
      [id_asignacion]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al listar materiales" });
  }
};
