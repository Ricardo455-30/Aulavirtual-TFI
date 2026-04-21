require('dotenv').config();
const mysql = require('mysql2/promise');
(async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  console.log('Notas en la tabla notas:');
  const [rows] = await pool.query('SELECT * FROM notas LIMIT 10');
  console.log(rows);
  console.log('Total notas:', rows.length);
  await pool.end();
})().catch(e => console.error(e));