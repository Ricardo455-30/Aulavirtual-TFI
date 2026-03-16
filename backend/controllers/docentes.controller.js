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

//para mostrar los datos del docente 
export const obtenerPerfilDocente = async (req, res) => {
  try {

    const id_usuario = req.user.id; // viene del token

    const [rows] = await pool.query(
      `SELECT 
        d.nombre,
        d.apellido,
        d.titulo,
        d.especialidad,
        u.email
      FROM docentes d
      JOIN usuarios u ON d.id_usuario = u.id_usuario
      WHERE d.id_usuario = ?`,
      [id_usuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Docente no encontrado" });
    }

    res.json(rows[0]);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Error al obtener perfil" });

  }
};