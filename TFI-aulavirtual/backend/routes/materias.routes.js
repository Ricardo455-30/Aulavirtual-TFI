import express from "express";
import {
  crearMateria,
  editarMateria,
  asignarDocenteMateriaCurso,
  obtenerMateriasDocente,
  subirContenido,
  obtenerContenidos,
  eliminarContenido,
  editarContenido,
  obtenerMateriasConAsignaciones,
  editarAsignacion

} from "../controllers/materias.controller.js";

import {
  getMaterias,
  getDocentes,
  getCursos
} from "../controllers/data.controller.js";

import { verifyToken } from "../middlewares/auth.js";
import { soloDirectivo, soloDocente } from "../middlewares/auth.js";
import {uploadContenido}  from "../middlewares/upload.js";

const router = express.Router();

// 📘 materias - RUTAS MÁS ESPECÍFICAS PRIMERO
router.get("/materias/asignaciones", verifyToken, obtenerMateriasConAsignaciones);
router.get("/docente", verifyToken, soloDocente, obtenerMateriasDocente);

// 📂 contenidos
router.post(
  "/contenidos",
  verifyToken,
  soloDocente,
  uploadContenido,
  subirContenido
);

router.get(
  "/contenidos/:id_materia",
  verifyToken,
  obtenerContenidos
);

router.delete("/contenidos/:id", verifyToken, soloDocente, eliminarContenido);

router.put("/contenidos/:id", verifyToken, soloDocente, editarContenido);

router.put("/asignacion/:id", verifyToken, editarAsignacion);

// 👨‍🏫 asignación
router.post("/asignar", verifyToken, soloDirectivo, asignarDocenteMateriaCurso);

// RUTAS GENERALES - AL FINAL
router.post("/materias", verifyToken, soloDirectivo, crearMateria);
router.put("/:id", verifyToken, editarMateria);
router.get("/", verifyToken, getMaterias);
router.get("/materias", verifyToken, getMaterias);

// 📊 datos
router.get("/docentes", verifyToken, getDocentes);
router.get("/cursos", verifyToken, getCursos);

export default router;