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
  const { nombre, email, contraseña, rol } = req.body;

  try {
    const [existe] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (existe.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(contraseña, 10);

    await pool.query(
      "INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, hashedPassword, rol]
    );

    res.json({ message: "Usuario registrado correctamente" });

  } catch (error) {
    console.error("Error register:", error);
    res.status(500).json({ message: "Error del servidor" });
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
          <p>Hola, recibimos una solicitud para restablecer tu contraseña.</p>
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
      "SELECT id FROM usuarios WHERE reset_token = ? AND reset_token_expire > ?",
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