import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

// Middlewares

// Rutas
import authRoutes from "./routes/auth.routes.js";
import alumnosRoutes from "./routes/alumnos.routes.js";
import docentesRoutes from "./routes/docentes.routes.js";
import cursosRoutes from "./routes/cursos.routes.js";
import calificacionesRoutes from "./routes/calificaciones.routes.js";
import tareasRoutes from "./routes/tareas.routes.js";
import asistenciasRoutes from "./routes/asistencias.routes.js";
import materialesRoutes from "./routes/materiales.routes.js";
import examenesRoutes from "./routes/examenes.routes.js";
import testRoutes from "./routes/test.routes.js";
import entregasRoutes from "./routes/entregas.routes.js";
import materiasRoutes from "./routes/materias.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import directivosRoutes from "./routes/directivos.routes.js"; // <--- 1. NUEVA IMPORTACIÓN

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ===== RUTAS =====

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/alumnos", alumnosRoutes);
app.use("/api/docentes", docentesRoutes);
app.use("/api/cursos", cursosRoutes);
app.use("/api/calificaciones", calificacionesRoutes);
app.use("/api/tareas", tareasRoutes);
app.use("/api/asistencias", asistenciasRoutes);
app.use("/api/materias", materiasRoutes);
app.use("/api/materiales", materialesRoutes);
app.use("/api/examenes", examenesRoutes);
app.use("/api/entregas", entregasRoutes);
app.use("/api/users", usuariosRoutes);
app.use("/api/directivos", directivosRoutes); // <--- 2. NUEVA RUTA REGISTRADA

app.get("/", (req, res) => {
  res.json({ message: "API TFI funcionando correctamente ✅" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Error interno del servidor" });
});

export default app;