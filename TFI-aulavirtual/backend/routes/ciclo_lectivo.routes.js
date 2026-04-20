import express from "express";
import {
  crearCicloLectivo,
  getCiclosLectivos,
  getCicloLectivoPorId,
  getCicloActivo,
  actualizarCicloLectivo,
  eliminarCicloLectivo
} from "../controllers/cicloLectivo.controller.js";
import { verifyToken, esAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", verifyToken, getCiclosLectivos);
router.get("/activo", verifyToken, getCicloActivo);
router.get("/:id", verifyToken, getCicloLectivoPorId);
router.post("/", verifyToken, esAdmin, crearCicloLectivo);
router.put("/:id", verifyToken, esAdmin, actualizarCicloLectivo);
router.delete("/:id", verifyToken, esAdmin, eliminarCicloLectivo);

export default router;
