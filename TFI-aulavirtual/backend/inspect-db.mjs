import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Churo4553044',
  database: 'aulavirtual',
});

const [tables] = await pool.query('SHOW TABLES');
console.log('TABLES');
console.log(tables);

const names = ['alumnos', 'alumno_materia', 'materias', 'notas', 'cursos', 'usuarios', 'docente_materia_curso', 'docentes'];
for (const name of names) {
  try {
    const [rows] = await pool.query(`DESCRIBE ${name}`);
    console.log(`\nTABLE ${name}`);
    console.table(rows);
  } catch (err) {
    console.error('ERROR', name, err.message);
  }
}

// Query docente_materia_curso
const [dmcRows] = await pool.query('SELECT * FROM docente_materia_curso');
console.log('\nDOCENTE_MATERIA_CURSO DATA');
console.table(dmcRows);

// Query docentes
const [docRows] = await pool.query('SELECT id_docente, id_usuario FROM docentes');
console.log('\nDOCENTES DATA');
console.table(docRows);

await pool.end();
