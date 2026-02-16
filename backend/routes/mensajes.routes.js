import { Router } from "express";
import { enviarMensaje } from "../controllers/mensajes.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyToken, enviarMensaje);

export default router;
