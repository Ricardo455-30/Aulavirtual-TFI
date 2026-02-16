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
router.post("/", verifyToken, requireRole("admin"), crearUsuario);
router.get("/", verifyToken, requireRole("admin"), listarUsuarios);

router.patch("/:id/estado", verifyToken, requireRole("admin"), cambiarEstado);
router.patch("/:id/password", verifyToken, requireRole("admin"), cambiarPassword);

export default router;
