import pool from "../config/db.js";

// Subir material (docente) - AHORA CON CLOUDINARY
export const subirMaterial = async (req, res) => {
  try {
    // 1. Extraemos los datos del formulario (body)
    const { id_asignacion, titulo, descripcion } = req.body;

    // 2. Verificamos si Cloudinary subió el archivo correctamente
    if (!req.file) {
      return res.status(400).json({ message: "No se ha seleccionado ningún archivo" });
    }

    // 3. Capturamos la URL que nos devuelve Cloudinary
    const archivo_url = req.file.path; 
    
    // 4. Generamos la fecha actual si no viene en el body
    const fecha_subida = req.body.fecha_subida || new Date().toISOString().split('T')[0];

    // 5. Insertamos en el Workbench (MySQL)
    const [result] = await pool.query(
      "INSERT INTO materiales_estudio (id_asignacion, titulo, descripcion, archivo_url, fecha_subida) VALUES (?,?,?,?,?)",
      [id_asignacion, titulo, descripcion, archivo_url, fecha_subida]
    );

    res.status(201).json({ 
      message: "Material subido a la nube correctamente ✅", 
      id_material: result.insertId,
      url_archivo: archivo_url 
    });

  } catch (error) {
    console.error("Error en subirMaterial:", error);
    res.status(500).json({ message: "Error al procesar la subida del material" });
  }
};

// Listar materiales de una asignación
export const listarMateriales = async (req, res) => {
  try {
    const { id_asignacion } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM materiales_estudio WHERE id_asignacion = ? ORDER BY fecha_subida DESC",
      [id_asignacion]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error en listarMateriales:", error);
    res.status(500).json({ message: "Error al listar materiales" });
  }
};