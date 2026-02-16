import { Router } from "express";
import {
  crearForo,
  listarForosAsignacion
} from "../controllers/foros.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.post("/", verifyToken, requireRole("docente"), crearForo);
router.get("/:id_asignacion", verifyToken, requireRole("docente", "alumno"), listarForosAsignacion);

export default router;
