import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "../config/cloudinary.js"; // El archivo de la imagen

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "tfi_escuela", // Nombre de la carpeta que se creará en Cloudinary
    allowed_formats: ["jpg", "png", "pdf"],
  },
});

export const uploadCloud = multer({ storage });