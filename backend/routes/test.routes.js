import { Router } from "express";
import {  verifyToken  } from "../middlewares/auth.middleware.js";
import { permitirRoles } from "../middlewares/rol.middleware.js";

const router = Router();

router.get(
  "/admin",
   verifyToken ,
  permitirRoles("admin"),
  (req, res) => {
    res.json({ message: "Bienvenido ADMIN 😎" });
  }
);

router.get(
  "/docente",
   verifyToken ,
  permitirRoles("docente"),
  (req, res) => {
    res.json({ message: "Bienvenido DOCENTE 👨‍🏫" });
  }
);

export default router;
