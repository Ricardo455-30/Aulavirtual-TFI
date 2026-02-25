import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";


// =========================
// 🔐 LOGIN
// =========================
export const login = async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT u.*, r.nombre_rol 
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const usuario = rows[0];

    const passwordValida = await bcrypt.compare(
      contraseña,
      usuario.contraseña
    );

    if (!passwordValida) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        rol: usuario.nombre_rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.nombre_rol,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// =========================
// 📝 REGISTER
// =========================
export const register = async (req, res) => {
  const {
    nombre,
    apellido,
    email,
    contraseña,
    rol,
    claveRol,
    datosEspecificos
  } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 🔎 1. Verificar si el usuario ya existe
    const [existe] = await connection.query(
      "SELECT id_usuario FROM usuarios WHERE email = ?",
      [email]
    );

    if (existe.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // 🎭 2. Obtener id_rol desde la tabla roles
    const [rolResult] = await connection.query(
      "SELECT id_rol FROM roles WHERE nombre_rol = ?",
      [rol]
    );

    if (rolResult.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Rol inválido" });
    }

    const idRol = rolResult[0].id_rol;

    // 🔐 3. Validar clave si es docente o tutor
    if (rol === "docente" && claveRol !== "CLAVE_DOCENTE_2025") {
      await connection.rollback();
      return res.status(403).json({ message: "Clave docente incorrecta" });
    }

    if (rol === "tutor" && claveRol !== "CLAVE_TUTOR_2025") {
      await connection.rollback();
      return res.status(403).json({ message: "Clave tutor incorrecta" });
    }

    // 🔑 4. Encriptar contraseña
    console.log("BODY COMPLETO:", req.body);
console.log("PASSWORD:", contraseña);
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // 👤 5. Insertar en usuarios
    const [usuarioResult] = await connection.query(
      `INSERT INTO usuarios 
      (nombre, apellido, email, contraseña, id_rol, estado, creado_en, actualizado_en) 
      VALUES (?, ?, ?, ?, ?, 'Activo', NOW(), NOW())`,
      [nombre, apellido, email, hashedPassword, idRol]
    );

    const idUsuario = usuarioResult.insertId;

    // 📚 6. Insertar datos según rol

    // ALUMNO
    if (rol === "alumno") {
      await connection.query(
        `INSERT INTO alumnos 
        (legajo, nombre, apellido, dni, fecha_nacimiento, id_usuario)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          datosEspecificos.legajo,
          nombre,
          apellido,
          datosEspecificos.dni,
          datosEspecificos.fecha_nacimiento,
          idUsuario
        ]
      );
    }

    // DOCENTE
    if (rol === "docente") {
      await connection.query(
        `INSERT INTO docentes 
        (nombre, apellido, titulo, especialidad, id_usuario)
        VALUES (?, ?, ?, ?, ?)`,
        [
          nombre,
          apellido,
          datosEspecificos.titulo,
          datosEspecificos.especialidad,
          idUsuario
        ]
      );
    }

    // TUTOR
    if (rol === "tutor") {
      await connection.query(
        `INSERT INTO padres_tutores 
        (nombre, apellido, telefono, email, id_usuario)
        VALUES (?, ?, ?, ?, ?)`,
        [
          nombre,
          apellido,
          datosEspecificos.telefono,
          email,
          idUsuario
        ]
      );
    }

    await connection.commit();

    res.json({ message: "Usuario registrado correctamente" });

  } catch (error) {
    await connection.rollback();
    console.error("Error register:", error);
    res.status(500).json({ message: "Error del servidor" });
  } finally {
    connection.release();
  }
};




// ==================================================
// 📧 SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// ==================================================
export const solicitarRecuperacion = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email requerido" });
  }

  try {
    const [rows] = await pool.query(
  "SELECT email FROM usuarios WHERE email = ?",
  [email]
);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 🔐 Generar token seguro
    const token = crypto.randomBytes(32).toString("hex");

    // ⏳ Expira en 1 hora
    const expire = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      "UPDATE usuarios SET reset_token = ?, reset_token_expire = ? WHERE email = ?",
      [token, expire, email]
    );

    // =============================
    // CONFIGURACIÓN DE CORREO
    // =============================
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 🔗 URL dinámica (dev o producción)
    const baseURL = process.env.FRONTEND_URL || "http://localhost:5173";
    const link = `${baseURL}/reset/${token}`;

    // 📧 Enviar correo
    await transporter.sendMail({
      from: `"Soporte Sistema" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperación de contraseña",
      html: `
        <div style="font-family: Arial, sans-serif; padding:20px;">
          <h2 style="color:#2563eb;">Recuperación de contraseña</h2>
          <p>Hola, Somos del centro de soprte tecnico del aula virtual del TFI. 
          Hemos recibimos una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el botón para continuar:</p>

          <a href="${link}" 
             style="
               display:inline-block;
               padding:12px 20px;
               background:#2563eb;
               color:white;
               text-decoration:none;
               border-radius:6px;
               font-weight:bold;
             ">
            Restablecer contraseña
          </a>

          <p style="margin-top:20px;">
            Este enlace expira en <b>1 hora</b>.
          </p>

          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
      `,
    });

    res.json({ message: "Correo enviado correctamente" });

  } catch (error) {
    console.error("Error recuperación:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};



// ==================================================
// 🔑 RESTABLECER CONTRASEÑA
// ==================================================
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { nuevaPassword } = req.body;

  if (!nuevaPassword || nuevaPassword.length < 6) {
    return res.status(400).json({
      message: "La contraseña debe tener al menos 6 caracteres"
    });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE reset_token = ? AND reset_token_expire > ?",
      [token, new Date()]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        message: "Token inválido o expirado"
      });
    }

    // 🔐 Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    await pool.query(
      `UPDATE usuarios 
       SET contraseña = ?, 
           reset_token = NULL, 
           reset_token_expire = NULL 
       WHERE reset_token = ?`,
      [hashedPassword, token]
    );

    res.json({ message: "Contraseña actualizada correctamente" });

  } catch (error) {
    console.error("Error reset:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};