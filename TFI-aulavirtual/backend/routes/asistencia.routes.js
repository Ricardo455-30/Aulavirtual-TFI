import express from "express";
import {
  crearClase,
  obtenerAlumnosPorCursoMateria,
  registrarAsistencia,
  obtenerPlanilla,
  reporteAsistencia,
  resumenAsistencia,
  diagnostico,
} from "../controllers/asistencia.controller.js";

const router = express.Router();

router.post("/clases", crearClase);
router.get("/alumnos/:id", obtenerAlumnosPorCursoMateria);
router.post("/", registrarAsistencia);
router.get("/planilla", obtenerPlanilla);
router.get("/reporte", reporteAsistencia);
router.get("/resumen", resumenAsistencia);
router.get("/diagnostico", diagnostico);

export default router;