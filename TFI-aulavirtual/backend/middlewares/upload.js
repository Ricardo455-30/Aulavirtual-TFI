import multer from "multer";
import path from "path";
import fs from "fs";

// Carpeta base de uploads
const uploadPath = "./uploads/archivos_registros";

// Crear carpeta base si no existe
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configuración de storage de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = uploadPath;

    // Separar por tipo de archivo
    if (file.fieldname === "dni") {
      folder = path.join(uploadPath, "dni");
    } else if (file.fieldname === "perfil") {
      folder = path.join(uploadPath, "perfil");
    } else if (file.fieldname === "archivo") {
      folder = path.join(uploadPath, "contenidos"); // ✅ NUEVO
    }

    // Crear subcarpeta si no existe
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

// Filtro de tipos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "application/zip",
    "video/mp4",
    "audio/mpeg"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes, PDF y documentos compatibles"), false);
  }
};

// ✅ INSTANCIA BASE (esto te faltaba)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ==============================
// EXPORTS
// ==============================

// Para registro (dni + perfil)
export const uploadArchivos = upload.fields([
  { name: "dni", maxCount: 1 },
  { name: "perfil", maxCount: 1 }
]);

// Para contenidos (archivo único)
export const uploadContenido = upload.single("archivo");

// ==============================
// RUTA PÚBLICA
// ==============================
export const getRutaPublica = (file) => {
  if (!file) return null;

  if (file.fieldname === "dni") {
    return `uploads/archivos_registros/dni/${file.filename}`;
  } else if (file.fieldname === "perfil") {
    return `uploads/archivos_registros/perfil/${file.filename}`;
  } else if (file.fieldname === "archivo") {
    return `uploads/archivos_registros/contenidos/${file.filename}`; // ✅ NUEVO
  }

  return `uploads/${file.filename}`;
};