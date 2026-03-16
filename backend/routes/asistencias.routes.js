import { Router } from "express";
import { registrarAsistencia, verAsistenciasAlumno, obtenerAsistenciasHoy } from "../controllers/asistencias.controller.js";
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

import { accesoAlumnoFlexible } from "../middlewares/acceso.middleware.js";
import { alumnoSoloPropio } from "../middlewares/alumno.middleware.js";
import { tutorDeAlumno } from "../middlewares/tutor.middleware.js";

const router = Router();

// POST /api/asistencias -> docente registra
router.post(
  "/",
  verifyToken,
  registrarAsistencia
);


// GET /api/asistencias/alumno/:id -> alumno/tutor/admin ve asistencias
router.get(
  "/alumno/:id",
  verifyToken,
  soloAdmin,
  accesoAlumnoFlexible(alumnoSoloPropio, tutorDeAlumno),
  verAsistenciasAlumno
);

router.get("/hoy", obtenerAsistenciasHoy);
// Rutas adicionales comentadas
// router.put("/:id", verifyToken, soloAdmin, /* actualizarAsistencia */);
// router.delete("/:id", verifyToken, soloAdmin, /* eliminarAsistencia */);

export default router;
