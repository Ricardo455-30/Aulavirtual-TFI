import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
import jwt from 'jsonwebtoken';

// Crear token de prueba como docente
const token = jwt.sign(
  { id: 1, rol: 'docente' },
  process.env.JWT_SECRET || 'tu_secret_aqui',
  { expiresIn: '1h' }
);

// Crear archivo de prueba
const testFile = 'test-file.txt';
fs.writeFileSync(testFile, 'Contenido de prueba para el archivo');

// Preparar FormData
const formData = new FormData();
formData.append('titulo', 'Test Upload');
formData.append('descripcion', 'Descripción de prueba');
formData.append('id_materia', '1');
formData.append('id_curso', '1');
formData.append('archivo', fs.createReadStream(testFile));

// Enviar request
axios.post('http://localhost:8000/api/materias/contenidos', formData, {
  headers: {
    ...formData.getHeaders(),
    Authorization: `Bearer ${token}`
  }
})
.then(res => {
  console.log('✅ Éxito:', res.data);
  fs.unlinkSync(testFile);
})
.catch(err => {
  console.error('❌ Error:', err.response?.data || err.message);
  fs.unlinkSync(testFile);
});
