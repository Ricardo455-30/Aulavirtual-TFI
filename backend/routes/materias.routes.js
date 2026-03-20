import { Router } from "express";
import multer from "multer";

import {
  crearMateria,
  listarMaterias,
  asignarMateria,
  cambiarEstadoMateria,
  editarMateria
} from "../controllers/materias.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

// Multer básico (local)
const upload = multer({ dest: "uploads/" });

// ==============================
// RUTAS
// ==============================

router.get("/", verifyToken, listarMaterias);

router.post(
  "/",
  verifyToken,
  requireRole("admin","directivo"),
  upload.single("foto"),
  crearMateria
);

router.post(
  "/:id/asignar",
  verifyToken,  
  requireRole("admin","directivo"),
  asignarMateria
);



router.put(
  "/:id",
  verifyToken,
  requireRole("admin","directivo"),
  upload.single("foto"),
  editarMateria
);

router.put(
  "/:id/estado",
  verifyToken,
  requireRole("admin","directivo"),
  cambiarEstadoMateria
);

export default router;