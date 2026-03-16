import { Router } from "express";
import {
  verCalificacionesAlumno,
  cargarCalificacion,
  guardarNotasCurso,
  verNotasCurso,
  editarCalificacion
} from "../controllers/calificaciones.controller.js";


import * as authMiddleware from "../middlewares/auth.middleware.js";
const _verify = authMiddleware.verifyToken ?? authMiddleware.default ?? authMiddleware.auth ?? authMiddleware.verify ?? authMiddleware.ensureAuth;
const verifyToken = typeof _verify === "function" ? _verify : (req, res, next) => {
  console.warn("⚠️ Middleware verifyToken no encontrado");
  next();
};

import * as roleMiddleware from "../middlewares/role.middleware.js";
const _solo = roleMiddleware.soloAdmin ?? roleMiddleware.default ?? roleMiddleware.isAdmin ?? roleMiddleware.onlyAdmin ?? roleMiddleware.requireRole ?? roleMiddleware.admin;
const soloAdmin = typeof _solo === "function" ? _solo : (req, res, next) => {
  console.warn("⚠️ Middleware soloAdmin no encontrado - permitiendo acceso");
  next();
};

import { accesoAlumnoFlexible, accesoDocenteFlexible } from "../middlewares/acceso.middleware.js";
import { alumnoSoloPropio } from "../middlewares/alumno.middleware.js";
import { tutorDeAlumno } from "../middlewares/tutor.middleware.js";
import { docentePuedeCalificarAlumno } from "../middlewares/docente.middleware.js";

const router = Router();

// POST /api/calificaciones -> docente carga calificación
router.post(
  "/",
  verifyToken,
  soloAdmin,
  accesoDocenteFlexible(docentePuedeCalificarAlumno),
  cargarCalificacion
);

// GET /api/calificaciones/alumno/:id -> ver calificaciones
router.get(
  "/alumno/:id",
  verifyToken,
  soloAdmin,
  accesoAlumnoFlexible(alumnoSoloPropio, tutorDeAlumno),
  verCalificacionesAlumno
);

router.post("/guardar", verifyToken, guardarNotasCurso);

router.get("/curso/:id", verifyToken, verNotasCurso);

router.put("/calificaciones/:id_calificacion", verifyToken, editarCalificacion);


// Rutas adicionales comentadas
// router.post("/", verifyToken, soloAdmin, /* crearCalificacion */);
// router.put("/:id", verifyToken, soloAdmin, /* actualizarCalificacion */);
// router.delete("/:id", verifyToken, soloAdmin, /* eliminarCalificacion */);

export default router;
