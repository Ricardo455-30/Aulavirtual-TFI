-- 🌱 SCRIPT PARA AGREGAR NOTAS DE PRUEBA

-- Insertar notas para Alumno 1 (id_alumno=1)
INSERT INTO `notas` (`id_alumno`, `id_materia`, `tipo`, `descripcion`, `nota`, `fecha`, `trimestre`, `es_promocion`) VALUES 
(1, 1, 'Parcial', 'Primer parcial Matematica', 8.50, '2026-03-15', 1, 0),
(1, 1, 'Parcial', 'Segundo parcial Matematica', 9.00, '2026-04-10', 2, 0),
(1, 3, 'Parcial', 'Primer parcial Lengua', 7.50, '2026-03-20', 1, 0),
(1, 3, 'TP', 'Trabajo práctico Lengua', 8.75, '2026-03-25', 1, 0);

-- Insertar notas para Alumno 2 (id_alumno=2)
INSERT INTO `notas` (`id_alumno`, `id_materia`, `tipo`, `descripcion`, `nota`, `fecha`, `trimestre`, `es_promocion`) VALUES 
(2, 1, 'Parcial', 'Primer parcial Matematica', 7.00, '2026-03-15', 1, 0),
(2, 1, 'Recuperatorio', 'Recuperatorio Matematica', 8.00, '2026-04-05', 2, 0),
(2, 3, 'Parcial', 'Primer parcial Lengua', 6.50, '2026-03-20', 1, 0),
(2, 3, 'TP', 'Trabajo práctico Lengua', 7.25, '2026-03-25', 1, 0);

-- Insertar notas para Alumno 3 (id_alumno=3)
INSERT INTO `notas` (`id_alumno`, `id_materia`, `tipo`, `descripcion`, `nota`, `fecha`, `trimestre`, `es_promocion`) VALUES 
(3, 1, 'Parcial', 'Primer parcial Matematica', 9.50, '2026-03-15', 1, 0),
(3, 1, 'Final', 'Examen final Matematica', 9.75, '2026-06-15', 3, 1),
(3, 3, 'Parcial', 'Primer parcial Lengua', 8.50, '2026-03-20', 1, 0),
(3, 3, 'Final', 'Examen final Lengua', 9.00, '2026-06-20', 3, 1);

-- Insertar notas para Alumno 4 (id_alumno=4)
INSERT INTO `notas` (`id_alumno`, `id_materia`, `tipo`, `descripcion`, `nota`, `fecha`, `trimestre`, `es_promocion`) VALUES 
(4, 1, 'Parcial', 'Primer parcial Matematica', 5.00, '2026-03-15', 1, 0),
(4, 1, 'TP', 'Trabajo práctico Matematica', 6.50, '2026-03-25', 1, 0),
(4, 1, 'Recuperatorio', 'Recuperatorio Matematica', 4.75, '2026-04-05', 2, 0);

-- Insertar notas para Alumno 5 (id_alumno=5)
INSERT INTO `notas` (`id_alumno`, `id_materia`, `tipo`, `descripcion`, `nota`, `fecha`, `trimestre`, `es_promocion`) VALUES 
(5, 3, 'Parcial', 'Primer parcial Lengua', 8.00, '2026-03-20', 1, 0),
(5, 3, 'Parcial', 'Segundo parcial Lengua', 8.50, '2026-04-15', 2, 0),
(5, 3, 'TP', 'Trabajo práctico Lengua', 9.00, '2026-03-25', 1, 0);

SELECT '✅ Notas de prueba insertadas correctamente' as resultado;
SELECT u.nombre, u.apellido, m.nombre as materia, n.tipo, n.nota, n.trimestre
FROM notas n
JOIN alumnos a ON n.id_alumno = a.id_alumno
JOIN usuarios u ON a.id_usuario = u.id_usuario
JOIN materias m ON n.id_materia = m.id_materia
ORDER BY a.id_alumno, n.id_materia;
