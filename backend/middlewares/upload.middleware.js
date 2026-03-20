import multer from "multer";
import path from "path";
import fs from "fs";

//  Carpetas base
const baseDir = "uploads/";
const imgDir = baseDir + "imagenes/";
const pdfDir = baseDir + "pdfs/";

//  Crear carpetas si no existen
[baseDir, imgDir, pdfDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

//  Función para decidir carpeta según tipo
const getFolder = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if ([".jpg", ".jpeg", ".png"].includes(ext)) {
    return imgDir;
  }

  if (ext === ".pdf") {
    return pdfDir;
  }

  return baseDir; // fallback
};

//  Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = getFolder(file);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nombre = Date.now() + "-" + file.originalname;
    cb(null, nombre);
  },
});

//  Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png|pdf/;
  const ext = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Formato no permitido (solo jpg, png, pdf)"));
  }
};

//  Middleware final
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});