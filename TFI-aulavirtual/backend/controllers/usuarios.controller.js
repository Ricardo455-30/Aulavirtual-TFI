// controllers/usuarios.controller.js
import { pool } from "../config/db.js";

// Map de roles string a id_rol
const rolesMap = {
  alumno: 4,
  docente: 3,
  directivo: 2,
  superadmin: 1,
};

// =======================
// Listar usuarios con filtros y paginación
// =======================
export const listarUsuarios = async (req, res) => {
  try {
    const { rol = "", estado = "", busqueda = "", page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const condiciones = [];
    const valores = [];

    // Filtrar por rol si se envía
    if (rol && rolesMap[rol]) {
      condiciones.push("id_rol = ?");
      valores.push(rolesMap[rol]);
    }

    // Filtrar por estado si se envía
    if (estado) {
      condiciones.push("UPPER(estado) = ?");
      valores.push(estado.toUpperCase());
    }

    // Filtrar por búsqueda en nombre, apellido o email
    if (busqueda) {
      condiciones.push("(nombre LIKE ? OR apellido LIKE ? OR email LIKE ?)");
      valores.push(`%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`);
    }

    const whereClause = condiciones.length ? "WHERE " + condiciones.join(" AND ") : "";

    // Contar total de usuarios
    const [totalResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM usuarios ${whereClause}`,
      valores
    );
    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / parseInt(limit));

    // Obtener usuarios paginados
    const [rows] = await pool.query(
      `SELECT id_usuario AS id, nombre, apellido, email, id_rol AS rol, estado, creado_en AS createdAt
       FROM usuarios
       ${whereClause}
       ORDER BY creado_en DESC
       LIMIT ? OFFSET ?`,
      [...valores, parseInt(limit), offset]
    );

    res.json({ data: rows, page: parseInt(page), totalPages });
  } catch (error) {
    console.error("Error listarUsuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// =======================
// Obtener datos del usuario autenticado actual
// =======================
export const obtenerUsuarioActual = async (req, res) => {
  try {
    const id_usuario = req.user.id;

    const [rows] = await pool.query(
      `SELECT id_usuario, nombre, apellido, email, id_rol, estado
       FROM usuarios WHERE id_usuario = ?`,
      [id_usuario]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error obtenerUsuarioActual:", error);
    res.status(500).json({ error: "Error al obtener datos del usuario" });
  }
};

// =======================
// Cambiar estado de un usuario (rota entre estados)
// =======================
export const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Traer estado actual
    const [rows] = await pool.query("SELECT estado FROM usuarios WHERE id_usuario = ?", [id]);
    if (!rows.length) return res.status(404).json({ error: "Usuario no encontrado" });

    const estados = ["Activo", "Inactivo", "Pendiente", "Rechazado"];
    const actual = rows[0].estado;
    const siguiente = estados[(estados.indexOf(actual) + 1) % estados.length];

    // Actualizar estado
    await pool.query("UPDATE usuarios SET estado = ? WHERE id_usuario = ?", [siguiente, id]);

    res.json({ mensaje: "Estado actualizado", nuevoEstado: siguiente });
  } catch (error) {
    console.error("Error cambiarEstadoUsuario:", error);
    res.status(500).json({ error: "Error al cambiar estado" });
  }
};