import { Router } from "express";
import {
  crearAsignacion
} from "../controllers/asignaciones.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.post("/", verifyToken, requireRole("admin", "directivo"), crearAsignacion);

export default router;
