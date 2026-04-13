-- 🌱 SCRIPT DE PRUEBA PARA LLENAR DATOS DE ASISTENCIA

-- Insertar clases de prueba (Curso 1, Materias 1 y 3)
INSERT INTO `clases` (`id_curso`, `id_materia`, `fecha`) VALUES 
(1, 1, '2026-04-01'),
(1, 1, '2026-04-03'),
(1, 1, '2026-04-08'),
(1, 1, '2026-04-10'),
(2, 3, '2026-04-02'),
(2, 3, '2026-04-04'),
(2, 3, '2026-04-09'),
(2, 3, '2026-04-11');

-- Insertar asistencia de prueba para alumno 2 (id_alumno=2, id_usuario=6) en Curso 1
-- Primero obtener id_clase para Curso 1, Materia 1
INSERT INTO `asistencia` (`id_clase`, `id_alumno`, `estado`) VALUES 
-- Clases del Curso 1 (con id_clase del 1 al 4)
(1, 2, 'Presente'),
(2, 2, 'Presente'),
(3, 2, 'Ausente'),
(4, 2, 'Justificado'),
-- Clases del Curso 2 (con id_clase del 5 al 8)
(5, 2, 'Presente'),
(6, 2, 'Presente'),
(7, 2, 'Presente'),
(8, 2, 'Ausente');

-- Insertar asistencia para alumno 3 (id_alumno=3, id_usuario=11) en Curso 2
INSERT INTO `asistencia` (`id_clase`, `id_alumno`, `estado`) VALUES 
(5, 3, 'Presente'),
(6, 3, 'Ausente'),
(7, 3, 'Presente'),
(8, 3, 'Presente');

SELECT '✅ Datos de prueba insertados correctamente' as resultado;
SELECT * FROM alumnos WHERE id_curso IN (1, 2);
SELECT * FROM clases;
SELECT * FROM asistencia;
