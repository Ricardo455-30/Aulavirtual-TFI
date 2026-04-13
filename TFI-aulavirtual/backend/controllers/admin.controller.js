// controllers/admin.controller.js
import { pool } from "../config/db.js";

export const aprobarUsuario = async (req, res) => {
  const { id } = req.params;

  await pool.query(
    "UPDATE usuarios SET estado = 'Activo' WHERE id_usuario = ?",
    [id]
  );

  res.json({ message: "Usuario aprobado" });
};

export const rechazarUsuario = async (req, res) => {
  const { id } = req.params;

  await pool.query(
    "UPDATE usuarios SET estado = 'Inactivo' WHERE id_usuario = ?",
    [id]
  );

  res.json({ message: "Usuario rechazado" });
};

export const getPendientes = async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM usuarios WHERE estado = 'Pendiente'"
  );

  res.json(rows);
};

export const getEstadisticas = async (req, res) => {
  try {
    // Total de usuarios
    const [totalRes] = await pool.query(
      "SELECT COUNT(*) as total FROM usuarios"
    );
    const total = totalRes[0]?.total || 0;

    // Usuarios activos
    const [activosRes] = await pool.query(
      "SELECT COUNT(*) as activos FROM usuarios WHERE estado = 'Activo'"
    );
    const activos = activosRes[0]?.activos || 0;

    // Usuarios pendientes
    const [pendientesRes] = await pool.query(
      "SELECT COUNT(*) as pendientes FROM usuarios WHERE estado = 'Pendiente'"
    );
    const pendientes = pendientesRes[0]?.pendientes || 0;

    res.json({
      total,
      activos,
      pendientes,
    });
  } catch (err) {
    console.error("Error en getEstadisticas:", err);
    res.status(500).json({ 
      error: "Error al obtener estadísticas",
      total: 0,
      activos: 0,
      pendientes: 0
    });
  }
};

export const getAprobados = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE estado = 'Activo' ORDER BY fecha_creacion DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error en getAprobados:", err);
    res.status(500).json({ error: "Error al obtener usuarios aprobados" });
  }
};

export const getRechazados = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE estado = 'Inactivo' ORDER BY fecha_creacion DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error en getRechazados:", err);
    res.status(500).json({ error: "Error al obtener usuarios rechazados" });
  }
};