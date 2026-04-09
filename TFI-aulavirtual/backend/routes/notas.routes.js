import express from "express";
import {
  obtenerNotas,
  crearNota,
  eliminarNota,
} from "../controllers/notas.controller.js";

import { verifyToken } from "../middlewares/auth.js"; // opcional

const router = express.Router();

router.get("/notas", verifyToken, obtenerNotas);
router.post("/notas", verifyToken, crearNota);
router.delete("/notas/:id", verifyToken, eliminarNota);

export default router;