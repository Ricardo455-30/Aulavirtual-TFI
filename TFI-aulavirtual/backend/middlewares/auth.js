import jwt from "jsonwebtoken";

// =======================
// VERIFY TOKEN
// =======================
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🔴 Validar header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token requerido o mal formado"
      });
    }

    // 🔑 Extraer token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token no proporcionado"
      });
    }

    // 🔴 Validar SECRET
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET no definido");
      return res.status(500).json({
        message: "Error interno del servidor"
      });
    }

    // 🔓 Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 📌 Guardar usuario en request
    req.user = decoded;

    next();

  } catch (error) {
    console.error("JWT ERROR:", error.message);

    return res.status(401).json({
      message: "Token inválido o expirado"
    });
  }
};

// =======================
// MIDDLEWARE ADMIN
// =======================
export const esAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado"
      });
    }

    const rolMinuscula = req.user.rol?.toLowerCase();

    if (rolMinuscula !== "admin" && rolMinuscula !== "superadmin") {
      return res.status(403).json({
        message: "Acceso denegado"
      });
    }

    next();

  } catch (error) {
    console.error("ERROR ADMIN:", error);
    return res.status(500).json({
      message: "Error del servidor"
    });
  }
};


/// =======================
// MIDDLEWARE DOCENTE
// =======================

export const soloDocente = (req, res, next) => {
  if (req.user?.rol?.toLowerCase() !== "docente") {
    return res.status(403).json({ 
      error: "Acceso solo docentes",
      rolRecibido: req.user?.rol
    });
  }
  next();
};

/// =======================
// MIDDLEWARE DIRECTIVO
// =======================  
export const soloDirectivo = (req, res, next) => {
  if (req.user.rol?.toLowerCase() !== "directivo") {
    return res.status(403).json({ error: "Acceso solo directivos" });
  }
  next();
};

/// =======================
// MIDDLEWARE ALUMNO
// =======================  
export const soloAlumno = (req, res, next) => {
  if (req.user.rol?.toLowerCase() !== "alumno") {
    return res.status(403).json({ error: "Acceso solo alumnos" });
  }
  next();
};
