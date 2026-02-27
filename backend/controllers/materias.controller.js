import pool from "../config/db.js";
import path from "path";
import fs from "fs";

// ========================================
//  OBTENER MATERIAS ACTIVAS (ALUMNO)
// ========================================
export const obtenerMaterias = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id_materia,
        nombre_materia,
        carga_horaria,
        descripcion,
        imagen
      FROM materias
      WHERE estado = 'activa'
      ORDER BY nombre_materia ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener materias:", error);
    res.status(500).json({ message: "Error del servidor al obtener materias" });
  }
};

// ========================================
// OBTENER MATERIA POR ID
// ========================================
export const obtenerMateriaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT 
        id_materia,
        nombre_materia,
        carga_horaria,
        descripcion,
        imagen
      FROM materias
      WHERE id_materia = ? AND estado = 'activa'
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener materia:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// ========================================
// CREAR MATERIA CON FOTO
// ========================================
export const crearMateria = async (req, res) => {
  try {
    const { nombre_materia, carga_horaria, descripcion } = req.body;

    // Validaciones básicas
    if (!nombre_materia || !carga_horaria) {
      return res.status(400).json({
        message: "Nombre y carga horaria son obligatorios",
      });
    }

    // Foto subida con multer
    let nombreImagen = null;
    if (req.file) {
      nombreImagen = req.file.filename; // nombre del archivo guardado en servidor
    }

    const [result] = await pool.query(
      `
      INSERT INTO materias 
      (nombre_materia, carga_horaria, descripcion, imagen, estado)
      VALUES (?, ?, ?, ?, 'activa')
      `,
      [nombre_materia, carga_horaria, descripcion || null, nombreImagen]
    );

    res.status(201).json({
      message: "Materia creada correctamente",
      id_materia: result.insertId,
    });
  } catch (error) {
    console.error("Error creando materia:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};