import { Router } from "express";
import {
  crearUsuario,
  listarUsuarios,
  cambiarEstado,
  cambiarPassword
} from "../controllers/usuarios.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

// SOLO ADMIN PUEDE GESTIONAR
router.post("/", verifyToken, requireRole("admin", "directivo"), crearUsuario);
router.get("/", verifyToken, requireRole("admin", "directivo"), listarUsuarios);

router.patch("/:id/estado", verifyToken, requireRole("admin", "directivo"), cambiarEstado);
router.patch("/:id/password", verifyToken, requireRole("admin", "directivo"), cambiarPassword);

export default router;
