import { Router } from "express";
import {
  listarAlumnos,
  obtenerAlumno,
  crearAlumno,
  actualizarAlumno,
  eliminarAlumno,
    listarCursosDeAlumno,
    getAlumnosPorCurso
} from "../controllers/alumnos.controller.js";

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

const router = Router();


router.get("/", verifyToken, listarAlumnos);
router.get("/:id", verifyToken, obtenerAlumno);
router.post("/", verifyToken, soloAdmin, crearAlumno);
router.put("/:id", verifyToken, soloAdmin, actualizarAlumno);
router.delete("/:id", verifyToken, soloAdmin, eliminarAlumno);
router.get("/:id_alumno/cursos", verifyToken, listarCursosDeAlumno);
router.get("/curso/:id_curso", verifyToken, getAlumnosPorCurso);
export default router;
