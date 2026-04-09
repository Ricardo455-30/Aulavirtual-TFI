// routes/docentes.routes.js
import express from "express";
import {
  crearDocente,
  getDocentes
} from "../controllers/docentes.controller.js";

import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verifyToken, crearDocente);
router.get("/", verifyToken, getDocentes);

export default router;