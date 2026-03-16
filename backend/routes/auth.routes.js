import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import {
  
  solicitarRecuperacion,
  resetPassword,
} from "../controllers/auth.controller.js";
const router = Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/solicitar-recuperacion
router.post("/recuperar", solicitarRecuperacion);

// POST /api/auth/reset/:token
router.post("/reset/:token", resetPassword);
export default router;
