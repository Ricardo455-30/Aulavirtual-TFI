# 🔧 CÓMO AGREGAR DATOS DE PRUEBA PARA ALUMNOS Y MATERIAS

## Opción 1: Ejecutar en MySQL Workbench (más fácil)

1. Abre **MySQL Workbench**
2. Conecta a tu base de datos `aulavirtual`
3. Copia y pega todo el contenido de abajo:

```sql
-- 1. ASIGNAR CURSOS A LOS ALUMNOS
UPDATE `alumnos` SET `id_curso` = 1 WHERE `id_alumno` = 1;
UPDATE `alumnos` SET `id_curso` = 1 WHERE `id_alumno` = 2;
UPDATE `alumnos` SET `id_curso` = 2 WHERE `id_alumno` = 3;
UPDATE `alumnos` SET `id_curso` = 2 WHERE `id_alumno` = 4;
UPDATE `alumnos` SET `id_curso` = 1 WHERE `id_alumno` = 5;

-- 2. INSCRIBIR ALUMNOS EN MATERIAS (alumno_materia)
INSERT IGNORE INTO `alumno_materia` VALUES 
(1, 1, 1, 'Cursando'),  -- Alumno 1 -> Matematica
(2, 1, 3, 'Cursando'),  -- Alumno 1 -> Lengua
(3, 3, 1, 'Cursando'),  -- Alumno 3 -> Matematica
(4, 3, 3, 'Cursando'),  -- Alumno 3 -> Lengua
(5, 4, 1, 'Cursando'),  -- Alumno 4 -> Matematica
(6, 4, 3, 'Cursando'),  -- Alumno 4 -> Lengua
(7, 5, 1, 'Cursando'),  -- Alumno 5 -> Matematica
(8, 5, 3, 'Cursando');  -- Alumno 5 -> Lengua

-- 3. VERIFICAR QUE TODO ESTÁ CORRECTO
SELECT 'ALUMNOS:' as info;
SELECT a.id_alumno, u.nombre, u.apellido, a.id_curso, c.nombre as curso
FROM alumnos a
LEFT JOIN cursos c ON a.id_curso = c.id_curso
JOIN usuarios u ON a.id_usuario = u.id_usuario
ORDER BY a.id_alumno;

SELECT 'INSCRIPCIONES DE MATERIAS:' as info;
SELECT am.id_alumno, u.nombre, u.apellido, m.nombre as materia, am.estado
FROM alumno_materia am
JOIN alumnos a ON am.id_alumno = a.id_alumno
JOIN usuarios u ON a.id_usuario = u.id_usuario
JOIN materias m ON am.id_materia = m.id_materia
ORDER BY am.id_alumno;
```

4. Ejecuta (Ctrl + Shift + Enter o el botón de ejecutar)

---

## Opción 2: Ejecutar desde terminal (si prefieres)

```bash
mysql -u root -p aulavirtual < seed_completo_alumnos.sql
```

---

## ✅ DESPUÉS DE EJECUTAR:

1. **Recarga el navegador** (F5)
2. **Abre las DevTools** (F12)
3. **Ve a Console** y busca logs con 🔐, 📤, ✅, ❌
4. **Inicia sesión como ALUMNO** (usuario con rol 'alumno')
5. **Ve a "Mis Materias"** y verifica que aparezcan

---

## 🧪 USUARIOS DE PRUEBA (alumnos):

Basándome en los datos, los alumnos son:
- **Usuario 1 (id_usuario=1, id_alumno=1)**: Nombre en usuarios
- **Usuario 6 (id_usuario=6, id_alumno=2)**: Nombre en usuarios  
- **Usuario 11 (id_usuario=11, id_alumno=3)**: Nombre en usuarios
- **Usuario 13 (id_usuario=13, id_alumno=4)**: Nombre en usuarios
- **Usuario 15 (id_usuario=15, id_alumno=5)**: Nombre en usuarios

---

## 🔴 Si aún no funciona:

1. **Comparte los logs de la consola** (F12 > Console)
2. **Comparte los logs del backend** (donde ejecutas `npm start` o `npm run dev`)
3. **Verifica que estés logeado como alumno** (no como directivo o docente)
