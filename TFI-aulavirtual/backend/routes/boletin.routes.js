import express from "express";
import {
  obtenerCursos,
  obtenerAlumnosPorCurso,
  crearNota,
  obtenerNotasAlumno,
  obtenerBoletinCurso,
  obtenerBoletinAlumno
} from "../controllers/boletin.controller.js";

const router = express.Router();

// 📚 cursos
router.get("/cursos", obtenerCursos);

// 👨‍🎓 alumnos
router.get("/alumnos/curso/:id_curso", obtenerAlumnosPorCurso);

// 📝 notas
router.post("/notas", crearNota);
router.get("/notas/alumno/:id_alumno", obtenerNotasAlumno);

// 📊 boletín
router.get("/curso/:id_curso", obtenerBoletinCurso);
router.get("/alumno/:id_alumno", obtenerBoletinAlumno);

export default router;