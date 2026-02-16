export const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    const rol = req.user.rol;

    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({ message: "Rol no autorizado" });
    }

    next();
  };
};
