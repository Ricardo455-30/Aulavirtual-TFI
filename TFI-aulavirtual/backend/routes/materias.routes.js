import express from "express";
import {
  crearMateria,
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

// 📘 materias
router.post("/materias", verifyToken, soloDirectivo, crearMateria);
router.get("/", verifyToken, getMaterias);
router.get("/materias", verifyToken, getMaterias);

// 👨‍🏫 asignación
router.post("/asignar", verifyToken, soloDirectivo, asignarDocenteMateriaCurso);

// 👨‍🏫 docente
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

router.get(
  "/materias/asignaciones",
  verifyToken,
  obtenerMateriasConAsignaciones
);

router.put("/asignacion/:id", verifyToken, editarAsignacion);

router.delete("/contenidos/:id", verifyToken, soloDocente, eliminarContenido);

router.put("/contenidos/:id", verifyToken, soloDocente, editarContenido);

// 📊 datos
router.get("/docentes", verifyToken, getDocentes);
router.get("/cursos", verifyToken, getCursos);

export default router;