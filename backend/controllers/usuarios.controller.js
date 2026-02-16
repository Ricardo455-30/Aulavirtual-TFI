import pool from "../config/db.js";
import bcrypt from "bcrypt";

// CREAR USUARIO
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, contraseña, id_rol } = req.body;

    const hash = await bcrypt.hash(contraseña, 10);

    await pool.query(
      `INSERT INTO usuarios
       (nombre, apellido, email, contraseña, id_rol, estado, creado_en)
       VALUES (?, ?, ?, ?, ?, 'activo', NOW())`,
      [nombre, apellido, email, hash, id_rol]
    );

    res.status(201).json({ message: "Usuario creado" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creando usuario" });
  }
};

// LISTAR USUARIOS (FORMATO COMPATIBLE CON FRONT)
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
    console.error(error);
    res.status(500).json({ message: "Error listando usuarios" });
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
    console.error(error);
    res.status(500).json({ message: "Error cambiando estado" });
  }
};

// CAMBIAR PASSWORD
export const cambiarPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE usuarios 
       SET contraseña = ?
       WHERE id_usuario = ?`,
      [hash, id]
    );

    res.json({ message: "Password actualizada" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error cambiando password" });
  }
};
