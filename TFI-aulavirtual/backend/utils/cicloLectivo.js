import { pool } from "../config/db.js";

export const getCicloActivoRegistro = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM ciclo_lectivo WHERE estado = 'Activo' LIMIT 1"
  );
  return rows.length > 0 ? rows[0] : null;
};

export const getCicloById = async (id_ciclo) => {
  const [rows] = await pool.query(
    "SELECT * FROM ciclo_lectivo WHERE id_ciclo = ?",
    [id_ciclo]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const ensureCicloLectivo = async (id_ciclo) => {
  if (id_ciclo) {
    const ciclo = await getCicloById(id_ciclo);
    if (!ciclo) {
      const error = new Error("Ciclo lectivo no encontrado");
      error.code = "CICLO_NO_ENCONTRADO";
      throw error;
    }
    return ciclo;
  }

  const activo = await getCicloActivoRegistro();
  if (!activo) {
    const error = new Error("No hay ciclo lectivo activo");
    error.code = "SIN_CICLO_ACTIVO";
    throw error;
  }
  return activo;
};
