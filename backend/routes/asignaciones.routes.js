import { Router } from "express";
import {
  crearAsignacion,
  getAlumnosPorAsignacion // <-- Importamos la nueva función
} from "../controllers/asignaciones.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

// NUEVA: GET /api/asignaciones/:id/alumnos -> trae alumnos de esa asignación
router.get("/:id/alumnos", verifyToken, getAlumnosPorAsignacion);

// POST /api/asignaciones -> crear asignación
router.post("/", verifyToken, requireRole("admin", "directivo"), crearAsignacion);

export default router;