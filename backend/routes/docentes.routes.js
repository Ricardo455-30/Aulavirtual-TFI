import { Router } from "express";
import {
  crearDocente,
  listarDocentes,
  getMisAsignaciones,
  perfilDocente
} from "../controllers/docentes.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /api/docentes → listar todos los docentes
router.get("/", verifyToken, listarDocentes);

// POST /api/docentes → crear docente
router.post("/", verifyToken, crearDocente);

// GET /api/docentes/mis-asignaciones → asignaciones
router.get("/mis-asignaciones", verifyToken, getMisAsignaciones);

// 🔹 NUEVO: GET /api/docentes/perfil → perfil del docente actual
router.get("/perfil", verifyToken, perfilDocente);

export default router;