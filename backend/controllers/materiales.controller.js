import pool from "../config/db.js";

// 📤 Subir material (LOCAL con multer)
export const subirMaterial = async (req, res) => {
  try {
    const { id_asignacion, titulo, descripcion } = req.body;

    // 🚫 Validación
    if (!req.file) {
      return res.status(400).json({ message: "No se ha seleccionado ningún archivo" });
    }

    // ✅ Ruta local del archivo
    const archivo_url = `/uploads/${req.file.filename}`;

    // 📅 Fecha
    const fecha_subida =
      req.body.fecha_subida ||
      new Date().toISOString().split("T")[0];

    // 💾 Guardar en DB
    const [result] = await pool.query(
      "INSERT INTO materiales_estudio (id_asignacion, titulo, descripcion, archivo_url, fecha_subida) VALUES (?,?,?,?,?)",
      [id_asignacion, titulo, descripcion, archivo_url, fecha_subida]
    );

    res.status(201).json({
      message: "Material subido correctamente ✅",
      id_material: result.insertId,
      url_archivo: archivo_url,
    });

  } catch (error) {
    console.error("Error en subirMaterial:", error);
    res.status(500).json({ message: "Error al procesar la subida del material" });
  }
};

// 📄 Listar materiales
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