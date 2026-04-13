-- 🌱 SCRIPT PARA AGREGAR MATERIAS INSCRITAS PARA ALUMNOS

-- Insertar inscripciones (alumno_materia) para diferentes alumnos
-- Alumno 1 (id_usuario=1) -> Materias 1 y 3
INSERT INTO `alumno_materia` VALUES 
(1, 1, 1, 'Cursando'),
(2, 1, 3, 'Cursando');

-- Alumno 2 (id_usuario=6) -> Ya tiene Matematica y Lengua registradas
-- (4,2,3,'Cursando'),(5,2,1,'Cursando') - YA EXISTEN

-- Alumno 3 (id_usuario=11) -> Materias 1 y 3
INSERT INTO `alumno_materia` VALUES 
(3, 3, 1, 'Cursando'),
(4, 3, 3, 'Cursando');

-- Alumno 4 (id_usuario=13) -> Materia 1
INSERT INTO `alumno_materia` VALUES 
(6, 4, 1, 'Cursando');

-- Alumno 5 (id_usuario=15) -> Materia 3
INSERT INTO `alumno_materia` VALUES 
(7, 5, 3, 'Cursando');

SELECT '✅ Inscripciones de materias agregadas correctamente' as resultado;
SELECT am.id_alumno, u.nombre, u.apellido, m.nombre as materia, am.estado
FROM alumno_materia am
JOIN alumnos a ON am.id_alumno = a.id_alumno
JOIN usuarios u ON a.id_usuario = u.id_usuario
JOIN materias m ON am.id_materia = m.id_materia
ORDER BY am.id_alumno;
