import pool from "../config/db.js";

// Cargar calificación (docente) con soporte para PERIODO
export const cargarCalificacion = async (req, res) => {
  try {
    // Agregamos 'periodo' a los datos recibidos del frontend
    const { id_alumno, id_asignacion, tipo, id_referencia, nota, fecha, periodo } = req.body;

    // Validación de seguridad para el periodo
    if (!periodo || periodo < 1 || periodo > 3) {
      return res.status(400).json({ message: "El periodo debe ser 1, 2 o 3 (trimestres)" });
    }

    // Actualizamos el INSERT para incluir la nueva columna
    const [result] = await pool.query(
      "INSERT INTO calificaciones (id_alumno, id_asignacion, tipo, id_referencia, nota, fecha, periodo) VALUES (?,?,?,?,?,?,?)",
      [id_alumno, id_asignacion, tipo, id_referencia, nota, fecha, periodo]
    );

    res.status(201).json({ 
      message: "Calificación cargada correctamente", 
      id_calificacion: result.insertId,
      periodo_registrado: periodo 
    });
  } catch (error) {
    console.error("Error en cargarCalificacion:", error);
    res.status(500).json({ message: "Error al cargar calificación en la base de datos" });
  }
};

// Ver calificaciones de un alumno (organizadas por periodo)
export const verCalificacionesAlumno = async (req, res) => {
  try {
    const { id } = req.params;
    // Ahora las traemos ordenadas por periodo para que el frontend las muestre prolijas
    const [rows] = await pool.query(
      "SELECT * FROM calificaciones WHERE id_alumno = ? ORDER BY periodo ASC, fecha DESC",
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error en verCalificacionesAlumno:", error);
    res.status(500).json({ message: "Error al obtener calificaciones" });
  }
};