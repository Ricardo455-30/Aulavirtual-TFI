import { Router } from "express";
import {
  entregarTarea,
  verMisEntregas,
  verEntregasPorTarea,
  corregirEntrega
} from "../controllers/entregas.controller.js";
import { upload } from "../middlewares/upload.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

/*
==================================
        RUTAS ENTREGAS
==================================
*/

// 🎓 Alumno entrega tarea
router.post(
  "/",
  verifyToken,
  requireRole("alumno"),
  upload.single("archivo"),
  entregarTarea
);

// 🎓 Alumno ve sus intentos
router.get(
  "/mis-entregas/:id_tarea",
  verifyToken,
  requireRole("alumno"),
  verMisEntregas
);

// Docente ve todas las entregas de una tarea
router.get(
  "/tarea/:id_tarea",
  verifyToken,
  requireRole("docente,admin"),
  verEntregasPorTarea
);

//  Docente corrige una entrega específica
router.put(
  "/corregir/:id_entrega",
  verifyToken,
  requireRole("docente,admin"),
  corregirEntrega
);

export default router;