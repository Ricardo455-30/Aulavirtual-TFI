import pool from "./config/db.js";
import bcrypt from "bcryptjs";

const seed = async () => {
  try {
    /* =====================================================
       LIMPIEZA TOTAL
    ===================================================== */
    await pool.query("SET FOREIGN_KEY_CHECKS = 0");

    const tablas = [
      "calificaciones",
      "entregas_tareas",
      "tareas",
      "examenes",
      "asignaciones",
      "materias",
      "alumnos_cursos",
      "alumnos_tutores",
      "alumnos",
      "padres_tutores",
      "docentes",
      "cursos",
      "usuarios",
      "roles"
    ];

    for (const tabla of tablas) {
      await pool.query(`DELETE FROM ${tabla}`);
    }

    await pool.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("Tablas limpiadas ✅");

    /* =====================================================
       ROLES
    ===================================================== */
    await pool.query(`
      INSERT INTO roles (nombre_rol, descripcion) VALUES
      ('admin','Administrador del sistema'),
      ('directivo','Gestión institucional'),
      ('docente','Profesor'),
      ('alumno','Alumno'),
      ('tutor','Padre o tutor')
    `);
    console.log("Roles creados ✅");

    // Obtener IDs reales de roles
    const [roles] = await pool.query(`SELECT id_rol, nombre_rol FROM roles`);
    const rolesMap = {};
    roles.forEach(r => (rolesMap[r.nombre_rol] = r.id_rol));

    /* =====================================================
       USUARIOS
    ===================================================== */
    const password = await bcrypt.hash("123456", 10);

    const crearUsuario = async (nombre, apellido, email, rol) => {
      const [res] = await pool.query(
        `INSERT INTO usuarios 
        (nombre,apellido,email,contraseña,id_rol,estado,creado_en,actualizado_en)
        VALUES (?,?,?,?,?, 'Activo', NOW(), NOW())`,
        [nombre, apellido, email, password, rol]
      );
      return res.insertId;
    };

    const idAdmin = await crearUsuario("Admin","General","admin@demo.com",rolesMap.admin);
    const idDirectivo = await crearUsuario("Laura","Directora","directivo@demo.com",rolesMap.directivo);
    const idUsuarioDocente = await crearUsuario("Juan","Perez","docente@demo.com",rolesMap.docente);
    const idUsuarioAlumno = await crearUsuario("Maria","Gomez","alumno@demo.com",rolesMap.alumno);
    
    const idUsuarioTutor = await crearUsuario("Carlos","Gomez","tutor@demo.com",rolesMap.tutor);

    console.log("Usuarios creados ✅");

    /* =====================================================
       DOCENTE
    ===================================================== */
    const [resDocente] = await pool.query(
      `INSERT INTO docentes (nombre,apellido,titulo,especialidad,id_usuario)
       VALUES (?,?,?,?,?)`,
      ["Juan","Perez","Profesor","Matemática", idUsuarioDocente]
    );
    const idDocente = resDocente.insertId;

    /* =====================================================
       ALUMNO
    ===================================================== */
    const [resAlumno] = await pool.query(
      `INSERT INTO alumnos (legajo,nombre,apellido,dni,fecha_nacimiento,id_usuario)
       VALUES (?,?,?,?,?,?)`,
      ["A001","Maria","Gomez","12345678","2010-05-12", idUsuarioAlumno]
    );
    const idAlumno = resAlumno.insertId;

    /* =====================================================
       TUTOR
    ===================================================== */
    const [resTutor] = await pool.query(
      `INSERT INTO padres_tutores (nombre,apellido,telefono,email,id_usuario)
       VALUES (?,?,?,?,?)`,
      ["Carlos","Gomez","1122334455","tutor@demo.com", idUsuarioTutor]
    );
    const idTutor = resTutor.insertId;

    console.log("Docente, alumno y tutor creados ✅");

    /* =====================================================
       CURSO
    ===================================================== */
    const [resCurso] = await pool.query(
      `INSERT INTO cursos (anio,division,turno) VALUES (?,?,?)`,
      [2026,"A","Mañana"]
    );
    const idCurso = resCurso.insertId;

    /* =====================================================
       RELACIONES
    ===================================================== */
    await pool.query(
      `INSERT INTO alumnos_cursos (id_alumno,id_curso,anio_lectivo)
       VALUES (?,?,?)`,
      [idAlumno, idCurso, 2026]
    );

    await pool.query(
      `INSERT INTO alumnos_tutores (id_alumno,id_tutor,parentesco)
       VALUES (?,?,?)`,
      [idAlumno, idTutor, "Padre"]
    );

    console.log("Relaciones creadas ✅");

    /* =====================================================
       MATERIA
    ===================================================== */
    const [resMateria] = await pool.query(
      `INSERT INTO materias (nombre_materia,carga_horaria)
       VALUES (?,?)`,
      ["Matemática", 4]
    );
    const idMateria = resMateria.insertId;

    /* =====================================================
       ASIGNACIÓN
    ===================================================== */
    const [resAsignacion] = await pool.query(
      `INSERT INTO asignaciones (id_docente,id_materia,id_curso)
       VALUES (?,?,?)`,
      [idDocente, idMateria, idCurso]
    );
    const idAsignacion = resAsignacion.insertId;

    /* =====================================================
       TAREA
    ===================================================== */
    const [resTarea] = await pool.query(
      `INSERT INTO tareas (id_asignacion,titulo,descripcion,fecha_entrega)
       VALUES (?,?,?,?)`,
      [idAsignacion,"TP 1","Ejercicios básicos","2026-04-10"]
    );
    const idTarea = resTarea.insertId;

    /* =====================================================
       EXAMEN
    ===================================================== */
    const [resExamen] = await pool.query(
      `INSERT INTO examenes (id_asignacion,tipo_examen,fecha,descripcion)
       VALUES (?,?,?,?)`,
      [idAsignacion,"Parcial","2026-05-10","Primer parcial"]
    );
    const idExamen = resExamen.insertId;

    /* =====================================================
       CALIFICACIÓN
    ===================================================== */
    await pool.query(
      `INSERT INTO calificaciones
       (id_alumno,id_asignacion,tipo,id_referencia,nota,fecha)
       VALUES (?,?,?,?,?,?)`,
      [idAlumno,idAsignacion,"Examen",idExamen,8.5,"2026-05-10"]
    );

    console.log("Materias, tareas, exámenes y notas creadas ✅");

    console.log("\n🌱 SEED COMPLETADO CORRECTAMENTE");
    console.log("🔑 Contraseña por defecto: 123456\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  }
};

seed();
