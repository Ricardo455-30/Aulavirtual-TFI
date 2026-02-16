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
