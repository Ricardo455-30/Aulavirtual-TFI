import { Router } from "express";
import {
  crearTarea,
  listarTareasPorAsignacion
} from "../controllers/tareas.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

/*
==================================
        RUTAS TAREAS
==================================
*/

// 🧑‍🏫 Crear tarea (solo docente o admin)
router.post(
  "/",
  verifyToken,
  requireRole("docente,admin"),
  crearTarea
);

// 📚 Listar tareas por asignación (docente y alumno)
router.get(
  "/asignacion/:id_asignacion",
  verifyToken,
  listarTareasPorAsignacion
);

export default router;