require('dotenv').config();
const mysql = require('mysql2/promise');
(async () => {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  console.log('Ciclos lectivos:');
  const [rows] = await pool.query('SELECT * FROM ciclo_lectivo');
  console.log(rows);
  await pool.end();
})().catch(e => console.error(e));