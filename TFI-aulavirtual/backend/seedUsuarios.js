import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

async function seed() {
  // 1️⃣ Configuración de la DB
  const connection = await mysql.createConnection({
    host: 'localhost',     // Cambiar si tu host es distinto
    user: 'root',          // Usuario MySQL
    password: 'Churo4553044',          // Contraseña MySQL
    database: 'aulavirtual'  // Cambiar por tu DB
  });

  // 2️⃣ Usuarios a crear
  const usuarios = [
    {
      nombre: 'Super',
      apellido: 'Admin',
      email: 'superadmin@gmail.com',
      password: 'admin123',
      id_rol: 1,
      estado: 'Activo'
    },
    {
      nombre: 'Admin',
      apellido: 'Principal',
      email: 'admin@gmail.com',
      password: 'admin123',
      id_rol: 1,
      estado: 'Activo'
    },
    {
      nombre: 'Juan',
      apellido: 'Perez',
      email: 'empleado1@gmail.com',
      password: 'empleado123',
      id_rol: 2,
      estado: 'Activo'
    },
    {
      nombre: 'Maria',
      apellido: 'Gomez',
      email: 'socio1@gmail.com',
      password: 'socio123',
      id_rol: 3,
      estado: 'Activo'
    }
  ];

  // 3️⃣ Insertar cada usuario
  for (let u of usuarios) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    await connection.execute(
      `INSERT INTO usuarios (nombre, apellido, email, password, id_rol, estado, creado_en, actualizado_en)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [u.nombre, u.apellido, u.email, hashedPassword, u.id_rol, u.estado]
    );
    console.log(`Usuario ${u.email} insertado correctamente.`);
  }

  await connection.end();
  console.log('Seed completada ✅');
}

seed().catch(err => console.error(err));