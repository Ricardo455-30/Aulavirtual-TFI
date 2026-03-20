import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    //  Validar header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token requerido" });
    }

    // Extraer token
    const token = authHeader.split(" ")[1];

    //  Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //  Guardar usuario en request
    req.user = decoded;

    next();

  } catch (error) {
    console.error("Error en verifyToken:", error.message);

    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
};