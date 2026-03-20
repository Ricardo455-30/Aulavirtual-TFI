import { Router } from "express";
import { listarUsuarios, crearUsuario, cambiarEstado, cambiarPassword } from "../controllers/usuarios.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

// Solo admin/directivo
router.get("/", verifyToken, requireRole("admin","directivo"), listarUsuarios);
router.post("/", verifyToken, requireRole("admin","directivo"), crearUsuario);

router.patch("/:id/estado", verifyToken, requireRole("admin","directivo"), cambiarEstado);
router.patch("/:id/password", verifyToken, requireRole("admin","directivo"), cambiarPassword);

export default router;