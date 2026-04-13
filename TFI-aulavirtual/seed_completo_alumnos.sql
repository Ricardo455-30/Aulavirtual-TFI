-- 🌱 SCRIPT COMPLETO DE DATOS DE PRUEBA PARA ALUMNOS

-- Primero, asegurarse de que hay datos iniciales limpios y correctos
-- 1. Actualizar alumnos 4 y 5 para que tengan un curso asignado
UPDATE `alumnos` SET `id_curso` = 2 WHERE `id_alumno` = 4;
UPDATE `alumnos` SET `id_curso` = 1 WHERE `id_alumno` = 5;

-- 2. Limpiar inscripciones previas (opcional, si quieres empezar de cero)
-- DELETE FROM `alumno_materia` WHERE `id_alumno` > 0;

-- 3. INSERTAR INSCRIPCIONES DE MATERIAS PARA TODOS LOS ALUMNOS
-- Alumno 1 (id_usuario=1, Curso 2) - Materias: Matematica(1) Cursando, Lengua(3) Aprobado
INSERT IGNORE INTO `alumno_materia` VALUES 
(1, 1, 1, 'Cursando'),
(2, 1, 3, 'Aprobado');

-- Alumno 2 (id_usuario=6, Curso 1) - Materias: Matematica(1) Cursando, Lengua(3) Desaprobado
-- (4,2,3,'Cursando'),(5,2,1,'Cursando') - YA EXISTEN (modificar abajo)

-- Alumno 3 (id_usuario=11, Curso 2) - Materias: Matematica(1) Aprobado, Lengua(3) Cursando
INSERT IGNORE INTO `alumno_materia` VALUES 
(3, 3, 1, 'Aprobado'),
(6, 3, 3, 'Cursando');

-- Alumno 4 (id_usuario=13, Curso 2) - Materia: Matematica(1) Desaprobado
INSERT IGNORE INTO `alumno_materia` VALUES 
(7, 4, 1, 'Desaprobado');

-- Alumno 5 (id_usuario=15, Curso 1) - Materia: Lengua(3) Cursando
INSERT IGNORE INTO `alumno_materia` VALUES 
(8, 5, 3, 'Cursando');

-- Actualizar alumno 2 para tener diferentes estados (si ya existen)
UPDATE `alumno_materia` SET `estado` = 'Cursando' WHERE `id_alumno` = 2 AND `id_materia` = 1;
UPDATE `alumno_materia` SET `estado` = 'Desaprobado' WHERE `id_alumno` = 2 AND `id_materia` = 3;

-- 4. CREAR CLASES DE PRUEBA para ambas materias en ambos cursos
INSERT IGNORE INTO `clases` (`id_curso`, `id_materia`, `fecha`) VALUES 
-- Curso 1, Materia Matematica
(1, 1, '2026-04-01'),
(1, 1, '2026-04-03'),
(1, 1, '2026-04-08'),
(1, 1, '2026-04-10'),
-- Curso 1, Materia Lengua
(1, 3, '2026-04-02'),
(1, 3, '2026-04-04'),
(1, 3, '2026-04-09'),
(1, 3, '2026-04-11'),
-- Curso 2, Materia Matematica
(2, 1, '2026-04-01'),
(2, 1, '2026-04-05'),
(2, 1, '2026-04-08'),
(2, 1, '2026-04-12'),
-- Curso 2, Materia Lengua
(2, 3, '2026-04-02'),
(2, 3, '2026-04-06'),
(2, 3, '2026-04-09'),
(2, 3, '2026-04-13');

SELECT '✅ Datos de prueba agregados correctamente' as resultado;
SELECT '📋 Alumnos y sus materias inscritas:' as info;
SELECT am.id_alumno, u.nombre, u.apellido, m.nombre as materia, a.id_curso, am.estado
FROM alumno_materia am
JOIN alumnos a ON am.id_alumno = a.id_alumno
JOIN usuarios u ON a.id_usuario = u.id_usuario
JOIN materias m ON am.id_materia = m.id_materia
ORDER BY am.id_alumno;
