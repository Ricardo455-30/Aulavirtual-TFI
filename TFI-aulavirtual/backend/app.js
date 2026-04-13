// src/app.js
import express from "express";
import cors from "cors";
import path from "path";
// rutas
import authRoutes from "./routes/auth.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import alumnosRoutes from "./routes/alumnos.routes.js";
import docentesRoutes from "./routes/docentes.routes.js";
import cursosRoutes from "./routes/cursos.routes.js";
import materiasRoutes from "./routes/materias.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import relacionesRoutes from "./routes/relaciones.routes.js";
import notasRoutes from "./routes/notas.routes.js";
import boletinroutes from "./routes/boletin.routes.js";
import asistenciaRoutes from "./routes/asistencia.routes.js";
import tareasRoutes from "./routes/tareas.routes.js";
import entregasTareasRoutes from "./routes/entregas_tareas.routes.js";


const app = express();

//  CORS CONFIG (IMPORTANTE)
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// servir archivos (IMPORTANTE)
app.use("/uploads", express.static(path.join("./uploads")));

// rutas
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/alumnos", alumnosRoutes);
app.use("/api/docentes", docentesRoutes);
app.use("/api/cursos", cursosRoutes);
app.use("/api/materias", materiasRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/relaciones", relacionesRoutes);
app.use("/api/boletin", boletinroutes);
app.use("/api/admin1", usuariosRoutes); // para admin/usuarios
app.use("/api/notas", notasRoutes);
app.use("/api/asistencia", asistenciaRoutes);
app.use("/api/tareas", tareasRoutes);
app.use("/api/entregas", entregasTareasRoutes);

// error handler for multer and generic errors
app.use((err, req, res, next) => {
  console.error("Error middleware:", err.message || err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "El archivo supera el tamaño máximo permitido" });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ error: "Campo de archivo inesperado" });
  }

  if (err.message && err.message.includes("Solo se permiten")) {
    return res.status(400).json({ error: err.message });
  }

  // Log full error for debugging
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.get("/", (req, res) => {
  res.send("Servidor funcionando ");
});

export default app;