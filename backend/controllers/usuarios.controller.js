import "dotenv/config";
import pool from "../config/db.js";
import bcrypt from "bcryptjs";

// ================= CREAR USUARIO =================
export const crearUsuario = async (req, res) => {
  try {
    let { nombre, apellido, email, contraseña, rol } = req.body;

    if (!nombre || !email || !contraseña || !rol) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    rol = rol.toLowerCase();
    apellido = apellido || "";

    // Obtener id_rol del nombre del rol (normalizado)
    const [rolDb] = await pool.query(
      "SELECT id_rol FROM roles WHERE LOWER(nombre_rol) = ?",
      [rol]
    );

    if (!rolDb.length) return res.status(400).json({ message: "Rol inválido" });

    const id_rol = rolDb[0].id_rol;
    const hash = await bcrypt.hash(contraseña, 10);

    await pool.query(
      `INSERT INTO usuarios
       (nombre, apellido, email, contraseña, id_rol, estado, creado_en)
       VALUES (?, ?, ?, ?, ?, 'activo', NOW())`,
      [nombre, apellido, email, hash, id_rol]
    );

    res.status(201).json({ message: "Usuario creado correctamente" });
  } catch (error) {
    console.error("ERROR CREAR USUARIO:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= LISTAR USUARIOS (con paginación y rol opcional) =================
export const listarUsuarios = async (req, res) => {
  try {
    let { rol, page = 1, limit = 10 } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.id_usuario AS id,
        u.nombre,
        u.apellido,
        u.email,
        LOWER(r.nombre_rol) AS rol,
        LOWER(u.estado) AS estado,
        u.creado_en AS createdAt
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id_rol
    `;

    const params = [];
    if (rol) {
      query += " WHERE LOWER(r.nombre_rol) = ?";
      params.push(rol.toLowerCase());
    }

    // Total de registros
    const [totalRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       ${rol ? "WHERE LOWER(r.nombre_rol) = ?" : ""}`,
      rol ? [rol.toLowerCase()] : []
    );
    const total = totalRows[0].total;

    // Datos paginados
    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    res.json({
      data: rows,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("ERROR LISTAR USUARIOS:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= CAMBIAR ESTADO =================
export const cambiarEstado = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    await pool.query(
      `UPDATE usuarios 
       SET estado = IF(estado='activo','inactivo','activo')
       WHERE id_usuario = ?`,
      [id]
    );

    res.json({ message: "Estado actualizado" });
  } catch (error) {
    console.error("ERROR CAMBIAR ESTADO:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= CAMBIAR CONTRASEÑA =================
export const cambiarPassword = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const { contraseña } = req.body;
    if (!contraseña || contraseña.length < 6) {
      return res.status(400).json({ message: "Contraseña inválida o muy corta" });
    }

    const hash = await bcrypt.hash(contraseña, 10);

    await pool.query(
      `UPDATE usuarios 
       SET contraseña = ?
       WHERE id_usuario = ?`,
      [hash, id]
    );

    res.json({ message: "Contraseña actualizada" });
  } catch (error) {
    console.error("ERROR CAMBIAR PASSWORD:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= ELIMINAR USUARIO =================
export const eliminarUsuario = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    await pool.query(
      `DELETE FROM usuarios WHERE id_usuario = ?`,
      [id]
    );

    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error("ERROR ELIMINAR USUARIO:", error);
    res.status(500).json({ message: error.message });
  }
};