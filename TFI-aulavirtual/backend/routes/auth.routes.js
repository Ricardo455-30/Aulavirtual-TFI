import express from "express";
import { 
  login, 
  registroCompleto, 
  getMe, 
  aprobarUsuario, 
  rechazarUsuario ,
  getPendientes,
  getAprobados,
  getRechazados,
  getArchivosUsuario,
  resetPassword,
  solicitarRecuperacion

} from "../controllers/auth.controller.js";

import { uploadArchivos } from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/auth.js"; // 👈 IMPORTANTE

const router = express.Router();

router.post("/login", login);
router.post("/registro", uploadArchivos, registroCompleto);

//  FIX ACA
router.get("/me", verifyToken, getMe);

router.post("/aprobar/:id", aprobarUsuario);
router.post("/rechazar/:id", rechazarUsuario);
router.get("/pendientes", getPendientes);
router.get("/aprobados", getAprobados);
router.get("/rechazados", getRechazados);
router.get("/archivos/:id", getArchivosUsuario);
router.post("/reset-password", resetPassword);
router.post("/solicitar-recuperacion", solicitarRecuperacion);


export default router;