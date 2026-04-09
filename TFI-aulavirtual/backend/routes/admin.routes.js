// routes/admin.routes.js
import express from "express";
import {
  aprobarUsuario,
  rechazarUsuario,
  getPendientes
} from "../controllers/admin.controller.js";

import { 
  verifyToken, esAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/pendientes", verifyToken, esAdmin, getPendientes);
router.put("/aprobar/:id", verifyToken, esAdmin, aprobarUsuario);
router.put("/rechazar/:id", verifyToken, esAdmin, rechazarUsuario);

export default router;