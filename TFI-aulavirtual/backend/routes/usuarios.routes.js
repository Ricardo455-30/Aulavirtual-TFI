// routes/usuarios.routes.js
import express from "express";
import {  listarUsuarios, cambiarEstadoUsuario, } from "../controllers/usuarios.controller.js";
import { verifyToken, esAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Listar usuarios con filtros y paginación
router.get("/usuarios", verifyToken, esAdmin, listarUsuarios);
// Cambiar estado de un usuario (rota entre estados)
router.patch("/usuarios/:id/estado", verifyToken, esAdmin, cambiarEstadoUsuario);

export default router;