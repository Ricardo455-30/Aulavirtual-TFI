require('dotenv').config();
const mysql = require('mysql2/promise');
(async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  console.log('Alumnos con id_alumno 2 y 4:');
  const [rows] = await pool.query('SELECT id_alumno, id_usuario FROM alumnos WHERE id_alumno IN (2,4)');
  console.log(rows);
  console.log('Usuarios:');
  const [rows2] = await pool.query('SELECT id_usuario, nombre, apellido FROM usuarios WHERE id_usuario IN (6,13)');
  console.log(rows2);
  await pool.end();
})().catch(e => console.error(e));