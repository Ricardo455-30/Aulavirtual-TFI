import { pool } from "../config/db.js";
import { getCicloActivoRegistro, getCicloById } from "../utils/cicloLectivo.js";

export const crearCicloLectivo = async (req, res) => {
  try {
    const { anio, fecha_inicio, fecha_fin, estado = "Activo" } = req.body;

    if (!anio || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: "anio, fecha_inicio y fecha_fin son obligatorios" });
    }

    if (estado === "Activo") {
      await pool.query("UPDATE ciclo_lectivo SET estado = 'Finalizado' WHERE estado = 'Activo'");
    }

    const [result] = await pool.query(
      "INSERT INTO ciclo_lectivo (anio, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?)",
      [anio, fecha_inicio, fecha_fin, estado]
    );

    res.json({ id_ciclo: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear ciclo lectivo" });
  }
};

export const getCiclosLectivos = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ciclo_lectivo ORDER BY anio DESC, fecha_inicio DESC");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener ciclos lectivos" });
  }
};

export const getCicloLectivoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const ciclo = await getCicloById(id);

    if (!ciclo) {
      return res.status(404).json({ error: "Ciclo lectivo no encontrado" });
    }

    res.json(ciclo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el ciclo lectivo" });
  }
};

export const getCicloActivo = async (req, res) => {
  try {
    const cicloActivo = await getCicloActivoRegistro();

    if (!cicloActivo) {
      return res.status(404).json({ error: "No hay ciclo lectivo activo" });
    }

    res.json(cicloActivo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el ciclo lectivo activo" });
  }
};

export const actualizarCicloLectivo = async (req, res) => {
  try {
    const { id } = req.params;
    const { anio, fecha_inicio, fecha_fin, estado } = req.body;

    if (estado === "Activo") {
      await pool.query("UPDATE ciclo_lectivo SET estado = 'Finalizado' WHERE estado = 'Activo' AND id_ciclo != ?", [id]);
    }

    const [result] = await pool.query(
      "UPDATE ciclo_lectivo SET anio = ?, fecha_inicio = ?, fecha_fin = ?, estado = ? WHERE id_ciclo = ?",
      [anio, fecha_inicio, fecha_fin, estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Ciclo lectivo no encontrado" });
    }

    res.json({ message: "Ciclo lectivo actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el ciclo lectivo" });
  }
};

export const eliminarCicloLectivo = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM ciclo_lectivo WHERE id_ciclo = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Ciclo lectivo no encontrado" });
    }

    res.json({ message: "Ciclo lectivo eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar el ciclo lectivo" });
  }
};
