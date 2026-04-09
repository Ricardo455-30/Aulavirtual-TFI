// routes/relaciones.routes.js
import express from "express";
import { asignarAlumnoCurso } from "../controllers/alumnoCurso.controller.js";
import { asignarDocente } from "../controllers/docenteMateriaCurso.controller.js";

import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// alumno → curso
router.post("/alumno-curso", verifyToken, asignarAlumnoCurso);

// docente → materia → curso
router.post("/docente-materia", verifyToken, asignarDocente);

export default router;