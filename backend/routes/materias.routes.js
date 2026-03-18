import { Router } from "express";
import {
  obtenerMaterias,
  obtenerMateriaPorId,
  crearMateria
} from "../controllers/materias.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// =================================
// Configuración de multer
// =================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/materias";
    // Crear carpeta si no existe
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

// =================================
// Rutas
// =================================

// Listar materias activas (solo alumno o directivo)
router.get(
  "/",
  verifyToken,
  requireRole("alumno", "directivo"),
  obtenerMaterias
);

// Ver detalle de una materia
router.get(
  "/:id",
  verifyToken,
  requireRole("alumno", "directivo"),
  obtenerMateriaPorId
);

// Crear materia (con foto)
router.post(
  "/",
  verifyToken,
  requireRole("directivo"),
  upload.single("foto"), // ⚠ Nombre del campo debe coincidir con FormData en React
  crearMateria
);

export default router;