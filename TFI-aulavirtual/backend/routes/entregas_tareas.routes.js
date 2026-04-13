import express from "express";
import {
  entregarTarea,
  obtenerEntregasTarea,
  obtenerEntregaPorId,
  calificarEntrega,
  obtenerEntregasAlumno,
  descargarArchivoEntrega,
  eliminarEntrega,
  obtenerTareasAlumnoWithEntregas
} from "../controllers/entregas_tareas.controller.js";

import { verifyToken, soloDocente, soloAlumno } from "../middlewares/auth.js";
import { uploadContenido } from "../middlewares/upload.js";

const router = express.Router();

// 📤 RUTAS MÁS ESPECÍFICAS PRIMERO
// Obtener entregas del alumno
router.get("/mis-entregas", verifyToken, soloAlumno, obtenerEntregasAlumno);

// Obtener tareas con entregas del alumno (por materia/curso)
router.get("/tareas/:id_materia/:id_curso", verifyToken, soloAlumno, obtenerTareasAlumnoWithEntregas);

// Obtener entregas de una tarea (solo docente)
router.get("/tarea/:id_tarea", verifyToken, soloDocente, obtenerEntregasTarea);

// Obtener entrega por ID
router.get("/obtener/:id", verifyToken, obtenerEntregaPorId);

// Descargar archivo de entrega
router.get("/descargar/:id", verifyToken, descargarArchivoEntrega);

// 📤 ENTREGAS - RUTAS ALUMNO
// Entregar tarea (subir archivo + comentario)
router.post(
  "/",
  verifyToken,
  soloAlumno,
  uploadContenido,
  entregarTarea
);

// 📥 RUTAS DE ACTUALIZACIÓN
// Calificar entrega (solo docente)
router.put("/:id/calificar", verifyToken, soloDocente, calificarEntrega);

// Eliminar entrega (solo alumno)
router.delete("/:id", verifyToken, soloAlumno, eliminarEntrega);

export default router;
