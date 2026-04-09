// routes/cursos.routes.js
import express from "express";
import {
  crearCurso,
  getCursos
} from "../controllers/cursos.controller.js";

import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verifyToken, crearCurso);
router.get("/", verifyToken, getCursos);

export default router;