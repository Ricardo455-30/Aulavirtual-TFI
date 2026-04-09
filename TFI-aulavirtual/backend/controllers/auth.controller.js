import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { getRutaPublica } from "../middlewares/upload.js";
const JWT_SECRET = process.env.JWT_SECRET;

// =======================
// CONFIG MAIL
// =======================
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// =======================
// EMAILS
// =======================
const enviarCorreoPendiente = async (email, nombre) => {
  try {
    await transporter.sendMail({
      from: `"Campus Virtual" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Registro recibido - Cuenta pendiente",
      html: `
        <h2>Hola ${nombre}</h2>
        <p>Tu registro fue recibido correctamente.</p>
        <p>Tu cuenta se encuentra en estado <b>Pendiente de aprobación</b>.</p>
        <p>Un administrador revisará tu información.</p>
      `,
    });
  } catch (error) {
    console.error("Error email pendiente:", error);
  }
};

const enviarCorreoAprobado = async (email, nombre) => {
  try {
    await transporter.sendMail({
      from: `"Campus Virtual" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Cuenta aprobada",
      html: `
        <h2>Hola ${nombre}</h2>
        <p>Tu cuenta ha sido <b>aprobada</b>.</p>
        <p>Ya puedes iniciar sesión.</p>
      `,
    });
  } catch (error) {
    console.error("Error email aprobado:", error);
  }
};

const enviarCorreoRechazado = async (email, nombre) => {
  try {
    await transporter.sendMail({
      from: `"Campus Virtual" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Solicitud rechazada",
      html: `
        <h2>Hola ${nombre}</h2>
        <p>Tu solicitud fue <b>rechazada</b>.</p>
        <p>Puedes volver a registrarte o contactar soporte.</p>
      `,
    });
  } catch (error) {
    console.error("Error email rechazado:", error);
  }
};

// =======================
// REGISTRO
// =======================
export const registroCompleto = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    if (!JWT_SECRET) throw new Error("JWT_SECRET no definido");

    await conn.beginTransaction();

    let {
      nombre,
      apellido,
      email,
      password,
      id_rol,
      legajo,
      especialidad,
      titulo,
      telefono,
      direccion
    } = req.body;

    email = email?.trim().toLowerCase();

    if (!nombre || !apellido || !email || !password || !id_rol) {
      throw new Error("Faltan datos obligatorios");
    }

    const rolesPermitidos = [3, 4];
    if (!rolesPermitidos.includes(Number(id_rol))) {
      throw new Error("Rol inválido");
    }

    // Verificar email duplicado
    const [exist] = await conn.query(
      "SELECT id_usuario FROM usuarios WHERE email = ?",
      [email]
    );
    if (exist.length > 0) {
      throw new Error("El email ya está registrado");
    }

    // Archivos
    const dniFile = req.files?.["dni"]?.[0];
    const perfilFile = req.files?.["perfil"]?.[0];
    if (!dniFile || !perfilFile) {
      throw new Error("Debes subir DNI y foto de perfil");
    }

    const hash = await bcrypt.hash(password, 10);

    // Crear usuario
    const [user] = await conn.query(
      `INSERT INTO usuarios 
        (nombre, apellido, email, password, id_rol, estado, creado_en)
       VALUES (?, ?, ?, ?, ?, 'Pendiente', NOW())`,
      [nombre, apellido, email, hash, id_rol]
    );

    const id_usuario = user.insertId;

    // Alumno
    if (Number(id_rol) === 4) {
      if (!legajo) throw new Error("Falta legajo");
      await conn.query(
        "INSERT INTO alumnos (id_usuario, legajo) VALUES (?, ?)",
        [id_usuario, legajo]
      );
    }

    // Docente
    if (Number(id_rol) === 3) {
      if (!especialidad || !titulo) throw new Error("Faltan datos del docente");
      await conn.query(
        `INSERT INTO docentes 
          (id_usuario, especialidad, titulo, telefono, direccion)
         VALUES (?, ?, ?, ?, ?)`,
        [id_usuario, especialidad, titulo, telefono || null, direccion || null]
      );
    }

    // Archivos: usar función getRutaPublica
    const rutaDni = getRutaPublica(dniFile);
    const rutaPerfil = getRutaPublica(perfilFile);

    await conn.query(
      `INSERT INTO usuario_archivos 
        (id_usuario, nombre_archivo, ruta_archivo, tipo_archivo, fecha_subida)
       VALUES (?, ?, ?, 'dni', NOW())`,
      [id_usuario, dniFile.filename, rutaDni]
    );

    await conn.query(
      `INSERT INTO usuario_archivos 
        (id_usuario, nombre_archivo, ruta_archivo, tipo_archivo, fecha_subida)
       VALUES (?, ?, ?, 'perfil', NOW())`,
      [id_usuario, perfilFile.filename, rutaPerfil]
    );

    await conn.commit();

    // Enviar correo (no rompe la transacción)
    try {
      enviarCorreoPendiente(email, nombre);
    } catch (err) {
      console.warn("Error enviando correo:", err.message);
    }

    res.status(201).json({
      message: "Registro exitoso. Usuario pendiente de aprobación"
    });

  } catch (error) {
    await conn.rollback();
    console.error("ERROR REGISTRO:", error);
    res.status(400).json({ error: error.message });
  } finally {
    conn.release();
  }
};

// =======================
// LOGIN
// =======================
export const login = async (req, res) => {
  try {
    if (!JWT_SECRET) throw new Error("JWT_SECRET no definido");

    let { email, password } = req.body;
    email = email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({
        message: "Email y contraseña obligatorios"
      });
    }

    const [rows] = await pool.query(
      `SELECT u.*, r.nombre_rol 
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const usuario = rows[0];

    if (usuario.estado === "Pendiente") {
      return res.status(403).json({ message: "Usuario pendiente" });
    }

    if (usuario.estado === "Inactivo") {
      return res.status(403).json({ message: "Usuario inactivo" });
    }

    if (usuario.estado === "Rechazado") {
      return res.status(403).json({ message: "Usuario rechazado" });
    }

    const valid = await bcrypt.compare(password, usuario.password);

    if (!valid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, rol: usuario.nombre_rol },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "1h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        rol: usuario.nombre_rol
      }
    });

  } catch (error) {
    console.error("ERROR LOGIN:", error);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// GET ME
// =======================
export const getMe = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const [rows] = await pool.query(
      `SELECT id_usuario AS id, nombre, apellido, email
       FROM usuarios WHERE id_usuario = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error("ERROR /ME:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// =======================
// APROBAR USUARIO
// =======================
export const aprobarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT nombre, email, estado FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const usuario = rows[0];

    if (usuario.estado === "Activo") {
      return res.status(400).json({ message: "Ya está aprobado" });
    }

    await pool.query(
      "UPDATE usuarios SET estado = 'Activo' WHERE id_usuario = ?",
      [id]
    );

    enviarCorreoAprobado(usuario.email, usuario.nombre);

    res.json({ message: "Usuario aprobado" });

  } catch (error) {
    console.error("ERROR APROBAR:", error);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// RECHAZAR USUARIO
// =======================
export const rechazarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT nombre, email FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const usuario = rows[0];

    await pool.query(
      "UPDATE usuarios SET estado = 'Rechazado' WHERE id_usuario = ?",
      [id]
    );

    enviarCorreoRechazado(usuario.email, usuario.nombre);

    res.json({ message: "Usuario rechazado" });

  } catch (error) {
    console.error("ERROR RECHAZAR:", error);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// OBTENER PENDIENTES
// =======================
export const getPendientes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.id_usuario as id,
        u.nombre as NOMBRE,
        u.apellido as APELLIDO,
        u.email as EMAIL,
        r.nombre_rol as ROL,
        COUNT(ua.id_archivo) as archivos_subidos
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id_rol
      LEFT JOIN usuario_archivos ua ON u.id_usuario = ua.id_usuario
      WHERE u.estado = 'Pendiente'
      GROUP BY u.id_usuario
    `);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// APROBADOS
// =======================
export const getAprobados = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.id_usuario as id,
        u.nombre as NOMBRE,
        u.apellido as APELLIDO,
        u.email as EMAIL,
        r.nombre_rol as ROL,
        COUNT(ua.id_archivo) as archivos_subidos
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id_rol
      LEFT JOIN usuario_archivos ua ON u.id_usuario = ua.id_usuario
      WHERE u.estado = 'Activo'
      GROUP BY u.id_usuario
    `);

    res.json(rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// RECHAZADOS
// =======================
export const getRechazados = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.id_usuario as id,
        u.nombre as NOMBRE,
        u.apellido as APELLIDO,
        u.email as EMAIL,
        r.nombre_rol as ROL,
        COUNT(ua.id_archivo) as archivos_subidos
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id_rol
      LEFT JOIN usuario_archivos ua ON u.id_usuario = ua.id_usuario
      WHERE u.estado = 'Rechazado'
      GROUP BY u.id_usuario
    `);

    res.json(rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// OBTENER ARCHIVOS DE USUARIO
// =======================
export const getArchivosUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Consulta para traer los archivos del usuario
    const [rows] = await pool.query(`
      SELECT 
        id_archivo,
        nombre_archivo AS nombre,
        ruta_archivo AS ruta,
        tipo_archivo
      FROM usuario_archivos
      WHERE id_usuario = ?
    `, [id]);

    // Devolver archivos en formato que el frontend espera
    res.json(rows);

  } catch (error) {
    console.error("ERROR OBTENIENDO ARCHIVOS:", error);
    res.status(500).json({ error: error.message });
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