// routes/alumnos.routes.js
import express from "express";
import {
  crearAlumno,
  getAlumnos,
  inscribirMateria,
  getMisMaterias,
  getMateriasDisponibles
} from "../controllers/alumnos.controller.js";

import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verifyToken, crearAlumno);
router.get("/", verifyToken, getAlumnos);
router.get("/mis-materias", verifyToken, getMisMaterias);
router.get("/materias-disponibles", verifyToken, getMateriasDisponibles);
router.post("/inscribirse/:id", verifyToken, inscribirMateria);

export default router;