import { Router } from "express";
import { getDatosAsignacion, asignarAlumnoACurso } from "../controllers/directivos.controller.js";
import { crearAsignacion } from "../controllers/asignaciones.controller.js"; // Importamos el que ya tenías para docentes
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getListadoAsignaciones, eliminarAsignacion } from "../controllers/directivos.controller.js";

const router = Router();

// GET /api/directivos/datos-asignacion -> Trae los datos para llenar los selectores
router.get("/datos-asignacion", verifyToken, getDatosAsignacion);

// POST /api/directivos/asignar-docente -> Vincula Docente + Materia + Curso
// Reutilizamos crearAsignacion que ya tenías para la tabla 'asignaciones'
router.post("/asignar-docente", verifyToken, crearAsignacion);

// POST /api/directivos/asignar-alumno -> Vincula Alumno + Curso (Tabla alumnos_cursos)
router.post("/asignar-alumno", verifyToken, asignarAlumnoACurso);

// GET /api/directivos/listado-asignaciones -> Listado completo de asignaciones con nombres reales
router.get("/listado-asignaciones", verifyToken, getListadoAsignaciones);
router.delete("/eliminar-asignacion/:id", verifyToken, eliminarAsignacion);

export default router;