import express from "express";
import {
  obtenerNotas,
  crearNota,
  guardarNotas,
  obtenerAlumnosConNotas,
  eliminarNota,
  obtenerNotasAlumno,
  obtenerAlumnosPorMateria
} from "../controllers/notas.controller.js";

const router = express.Router();

router.get("/", obtenerNotas);
router.post("/", guardarNotas);
router.post("/crear", crearNota);
router.get("/materia/:id", obtenerAlumnosConNotas);
router.get("/alumnos/:id_materia", obtenerAlumnosPorMateria);
router.delete("/:id", eliminarNota);
router.get("/alumno/:alumnoId", obtenerNotasAlumno);

export default router;