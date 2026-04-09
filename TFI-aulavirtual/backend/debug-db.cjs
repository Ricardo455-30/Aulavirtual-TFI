require('dotenv').config();
const mysql = require('mysql2/promise');
(async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  console.log('Alumnos en curso 2:');
  const [rows1] = await pool.query('SELECT id_alumno FROM alumnos WHERE id_curso = 2');
  console.log(rows1);
  console.log('Alumnos inscritos en materia 3:');
  const [rows2] = await pool.query('SELECT id_alumno, estado FROM alumno_materia WHERE id_materia = 3');
  console.log(rows2);
  console.log('Alumnos inscritos en materia 3 con Cursando (sin curso):');
  const [rows3] = await pool.query(`
    SELECT al.id_alumno, u.nombre, u.apellido, am.estado
    FROM alumnos al
    JOIN usuarios u ON al.id_usuario = u.id_usuario
    JOIN alumno_materia am ON am.id_alumno = al.id_alumno
    WHERE am.id_materia = 3 AND am.estado = 'Cursando'
  `);
  console.log(rows3);
  await pool.end();
})().catch(e => console.error(e));