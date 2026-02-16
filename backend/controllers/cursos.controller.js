import pool from "../config/db.js";

// Crear curso
export const crearCurso = async (req, res) => {
  try {
    const { anio, division, turno } = req.body;
    const [result] = await pool.query(
      "INSERT INTO cursos (anio,division,turno) VALUES (?,?,?)",
      [anio, division, turno]
    );
    res.status(201).json({ message: "Curso creado", id_curso: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear curso" });
  }
};

// Listar cursos
export const listarCursos = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM cursos");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al listar cursos" });
  }
};
