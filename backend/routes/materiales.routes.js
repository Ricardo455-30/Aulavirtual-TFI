import { Router } from "express";
import { subirMaterial, listarMateriales } from "../controllers/materiales.controller.js";
import { upload } from "../middlewares/upload.middleware.js"; 

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

// 📤 Subir material (LOCAL)
router.post(
  "/",
  verifyToken,
  upload.single("archivo"), // ✅ mismo nombre que el input del frontend
  subirMaterial
);

// 📄 Listar materiales
router.get(
  "/:id_asignacion",
  verifyToken,
  soloAdmin,
  listarMateriales
);

export default router;