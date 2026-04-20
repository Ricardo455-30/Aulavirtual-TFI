// controllers/docenteMateriaCurso.controller.js
import { pool } from "../config/db.js";
import { ensureCicloLectivo } from "../utils/cicloLectivo.js";

export const asignarDocente = async (req, res) => {
  try {
    const { id_docente, id_materia, id_curso, id_ciclo } = req.body;

    if (!id_docente || !id_materia || !id_curso) {
      return res.status(400).json({ error: "id_docente, id_materia e id_curso son obligatorios" });
    }

    const ciclo = await ensureCicloLectivo(id_ciclo);

    await pool.query(
      "INSERT INTO docente_materia_curso (id_docente, id_materia, id_curso, id_ciclo) VALUES (?, ?, ?, ?)",
      [id_docente, id_materia, id_curso, ciclo.id_ciclo]
    );

    res.json({ message: "Docente asignado correctamente", id_ciclo: ciclo.id_ciclo });
  } catch (error) {
    if (error.code === "CICLO_NO_ENCONTRADO" || error.code === "SIN_CICLO_ACTIVO") {
      return res.status(400).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: "Error al asignar docente" });
  }
};