import { alumnoSoloPropio } from "./alumno.middleware.js";
import { tutorDeAlumno } from "./tutor.middleware.js";

export const accesoAlumnoFlexible = (alumnoMiddleware, tutorMiddleware) => {
  return async (req, res, next) => {
    const rol = req.user.rol;

    if (rol === "admin" || rol === "directivo") return next();
    if (rol === "alumno") return alumnoMiddleware(req, res, next);
    if (rol === "tutor") return tutorMiddleware(req, res, next);

    return res.status(403).json({ message: "Acceso no autorizado" });
  };
};

export const accesoDocenteFlexible = (docenteMiddleware) => {
  return async (req, res, next) => {
    const rol = req.user.rol;

    if (rol === "admin" || rol === "directivo") return next();
    if (rol === "docente") return docenteMiddleware(req, res, next);

    return res.status(403).json({ message: "Acceso no autorizado" });
  };
};
