import express from "express";
import {
  crearTarea,
  obtenerTareas,
  obtenerTareaPorId,
  editarTarea,
  eliminarTarea,
  obtenerTareasAlumno
} from "../controllers/tareas.controller.js";

import { verifyToken, soloDocente, soloAlumno } from "../middlewares/auth.js";

const router = express.Router();

// 📋 RUTAS MÁS ESPECÍFICAS PRIMERO
// Obtener tareas del alumno para una materia/curso
router.get("/alumno/tareas/:id_materia/:id_curso", verifyToken, soloAlumno, obtenerTareasAlumno);

// 📋 RUTAS DOCENTE
// Crear tarea (solo docente)
router.post("/", verifyToken, soloDocente, crearTarea);

// Obtener tareas de una materia/curso
router.get("/", verifyToken, obtenerTareas);

// Obtener una tarea por ID
router.get("/:id", verifyToken, obtenerTareaPorId);

// Editar tarea (solo docente)
router.put("/:id", verifyToken, soloDocente, editarTarea);

// Eliminar tarea (solo docente)
router.delete("/:id", verifyToken, soloDocente, eliminarTarea);

export default router;
