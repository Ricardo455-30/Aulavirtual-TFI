import { Router } from "express";
import { subirMaterial, listarMateriales } from "../controllers/materiales.controller.js";
import { uploadCloud } from "../middlewares/uploadCloud.middleware.js"; // <-- Importamos el nuevo middleware

import * as authMiddleware from "../middlewares/auth.middleware.js";
const _verify = authMiddleware.verifyToken ?? authMiddleware.default ?? authMiddleware.auth ?? authMiddleware.verify ?? authMiddleware.ensureAuth;
const verifyToken = typeof _verify === "function" ? _verify : (req, res, next) => {
  console.warn("⚠️ Middleware verifyToken no encontrado");
  next();
};

import * as roleMiddleware from "../middlewares/role.middleware.js";
const _solo = roleMiddleware.soloAdmin ?? roleMiddleware.default ?? roleMiddleware.isAdmin ?? roleMiddleware.onlyAdmin ?? roleMiddleware.requireRole ?? roleMiddleware.admin;
const soloAdmin = typeof _solo === "function" ? _solo : (req, res, next) => {
  console.warn("⚠️ Middleware soloAdmin no encontrado - permitiendo acceso");
  next();
};

const router = Router();

// POST /api/materiales -> docente sube material a la NUBE (Cloudinary)
router.post(
  "/",
  verifyToken,
  // soloAdmin, // Nota: Si un docente debe subir material, quizás debas revisar este middleware luego
  uploadCloud.single("archivo"), // <-- "archivo" debe ser el nombre del campo que envíe el frontend
  subirMaterial
);

// GET /api/materiales/:id_asignacion -> listar materiales
router.get(
  "/:id_asignacion",
  verifyToken,
  soloAdmin,
  listarMateriales
);

export default router;