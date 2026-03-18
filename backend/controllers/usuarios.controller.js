import pool from "../config/db.js";
import bcrypt from "bcryptjs"; // mejor usar bcryptjs para async/await consistente

// CREAR USUARIO
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, contraseña, rol } = req.body;

    // Validación básica
    if (!nombre || !email || !contraseña || !rol) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Mapear rol a id_rol (suponiendo roles de la tabla)
    const [rolDb] = await pool.query(
      "SELECT id_rol FROM roles WHERE nombre_rol = ?",
      [rol]
    );
    if (!rolDb.length) return res.status(400).json({ message: "Rol inválido" });

    const id_rol = rolDb[0].id_rol;

    // Hashear contraseña
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

// LISTAR USUARIOS
export const listarUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          u.id_usuario AS id,
          u.nombre,
          u.apellido,
          u.email,
          r.nombre_rol AS rol,
          u.estado,
          u.creado_en AS createdAt,
          u.creado_en AS updatedAt
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol`
    );

    res.json(rows);

  } catch (error) {
    console.error("ERROR LISTAR USUARIOS:", error);
    res.status(500).json({ message: error.message });
  }
};

// CAMBIAR ESTADO
export const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;

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

// CAMBIAR PASSWORD
export const cambiarPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { contraseña } = req.body;

    if (!contraseña) return res.status(400).json({ message: "Contraseña requerida" });

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