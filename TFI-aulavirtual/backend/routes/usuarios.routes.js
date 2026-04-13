// routes/usuarios.routes.js
import express from "express";
import {  listarUsuarios, cambiarEstadoUsuario, obtenerUsuarioActual } from "../controllers/usuarios.controller.js";
import { verifyToken, esAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Obtener datos del usuario autenticado (sin restricción de rol)
router.get("/me", verifyToken, obtenerUsuarioActual);

// Listar usuarios con filtros y paginación
router.get("/", verifyToken, esAdmin, listarUsuarios);
// Cambiar estado de un usuario (rota entre estados)
router.patch("/:id/estado", verifyToken, esAdmin, cambiarEstadoUsuario);

export default router;