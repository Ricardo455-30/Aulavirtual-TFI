import { Router } from "express";
import {
  login,
  register,
  solicitarRecuperacion,
  resetPassword,
  perfil
} from "../controllers/auth.controller.js";


import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// ==========================
// 🔐 AUTH
// ==========================

// Registro
router.post("/register", register);

// Login
router.post("/login", login);

// Recuperación de contraseña
router.post("/recuperar", solicitarRecuperacion);

// Resetear contraseña
router.post("/reset/:token", resetPassword);

// ==========================
// 👤 USUARIO LOGUEADO
// ==========================
  
router.get("/me", verifyToken, perfil);




export default router;