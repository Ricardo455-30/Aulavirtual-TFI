// routes/admin.routes.js
import express from "express";
import {
  aprobarUsuario,
  rechazarUsuario,
  getPendientes,
  getEstadisticas,
  getAprobados,
  getRechazados
} from "../controllers/admin.controller.js";

import { 
  verifyToken, esAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/pendientes", verifyToken, esAdmin, getPendientes);
router.get("/aprobados", verifyToken, esAdmin, getAprobados);
router.get("/rechazados", verifyToken, esAdmin, getRechazados);
router.get("/estadisticas", verifyToken, esAdmin, getEstadisticas);
router.put("/aprobar/:id", verifyToken, esAdmin, aprobarUsuario);
router.put("/rechazar/:id", verifyToken, esAdmin, rechazarUsuario);

export default router;