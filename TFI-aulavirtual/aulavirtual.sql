-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: aulavirtual
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alumno_materia`
--

DROP TABLE IF EXISTS `alumno_materia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumno_materia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_alumno` int NOT NULL,
  `id_materia` int NOT NULL,
  `estado` enum('Cursando','Aprobado','Desaprobado') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_am_alumno` (`id_alumno`),
  KEY `fk_am_materia` (`id_materia`),
  CONSTRAINT `fk_am_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`),
  CONSTRAINT `fk_am_materia` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumno_materia`
--

LOCK TABLES `alumno_materia` WRITE;
/*!40000 ALTER TABLE `alumno_materia` DISABLE KEYS */;
INSERT INTO `alumno_materia` VALUES (4,2,3,'Cursando'),(5,2,1,'Cursando');
/*!40000 ALTER TABLE `alumno_materia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alumnos`
--

DROP TABLE IF EXISTS `alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumnos` (
  `id_alumno` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `legajo` varchar(50) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `id_curso` int DEFAULT NULL,
  PRIMARY KEY (`id_alumno`),
  UNIQUE KEY `matricula` (`legajo`),
  KEY `fk_alumno_usuario` (`id_usuario`),
  KEY `id_curso` (`id_curso`),
  CONSTRAINT `alumnos_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`),
  CONSTRAINT `fk_alumno_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumnos`
--

LOCK TABLES `alumnos` WRITE;
/*!40000 ALTER TABLE `alumnos` DISABLE KEYS */;
INSERT INTO `alumnos` VALUES (1,1,'A001',NULL,NULL,NULL,2),(2,6,'A002',NULL,NULL,NULL,1),(3,11,'A003',NULL,NULL,NULL,2),(4,13,'A006',NULL,NULL,NULL,NULL),(5,15,'A007',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `alumnos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignaciones`
--

DROP TABLE IF EXISTS `asignaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_curso` int NOT NULL,
  `id_materia` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_curso` (`id_curso`,`id_materia`),
  KEY `id_materia` (`id_materia`),
  CONSTRAINT `asignaciones_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE,
  CONSTRAINT `asignaciones_ibfk_2` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones`
--

LOCK TABLES `asignaciones` WRITE;
/*!40000 ALTER TABLE `asignaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `asignaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencia`
--

DROP TABLE IF EXISTS `asistencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_clase` int NOT NULL,
  `id_alumno` int NOT NULL,
  `estado` enum('Presente','Ausente','Justificado') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_clase` (`id_clase`,`id_alumno`),
  KEY `id_alumno` (`id_alumno`),
  CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`id_clase`) REFERENCES `clases` (`id_clase`) ON DELETE CASCADE,
  CONSTRAINT `asistencia_ibfk_2` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencia`
--

LOCK TABLES `asistencia` WRITE;
/*!40000 ALTER TABLE `asistencia` DISABLE KEYS */;
/*!40000 ALTER TABLE `asistencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clases`
--

DROP TABLE IF EXISTS `clases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clases` (
  `id_clase` int NOT NULL AUTO_INCREMENT,
  `id_curso` int NOT NULL,
  `id_materia` int NOT NULL,
  `fecha` date NOT NULL,
  PRIMARY KEY (`id_clase`),
  UNIQUE KEY `id_curso` (`id_curso`,`id_materia`,`fecha`),
  KEY `id_materia` (`id_materia`),
  CONSTRAINT `clases_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE,
  CONSTRAINT `clases_ibfk_2` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clases`
--

LOCK TABLES `clases` WRITE;
/*!40000 ALTER TABLE `clases` DISABLE KEYS */;
/*!40000 ALTER TABLE `clases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contenidos`
--

DROP TABLE IF EXISTS `contenidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contenidos` (
  `id_contenido` int NOT NULL AUTO_INCREMENT,
  `id_materia` int DEFAULT NULL,
  `id_curso` int DEFAULT NULL,
  `titulo` varchar(200) DEFAULT NULL,
  `descripcion` text,
  `archivo` varchar(255) DEFAULT NULL,
  `subido_por` int DEFAULT NULL,
  `creado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_contenido`),
  KEY `id_materia` (`id_materia`),
  KEY `id_curso` (`id_curso`),
  KEY `subido_por` (`subido_por`),
  CONSTRAINT `contenidos_ibfk_1` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`),
  CONSTRAINT `contenidos_ibfk_2` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`),
  CONSTRAINT `contenidos_ibfk_3` FOREIGN KEY (`subido_por`) REFERENCES `docentes` (`id_docente`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contenidos`
--

LOCK TABLES `contenidos` WRITE;
/*!40000 ALTER TABLE `contenidos` DISABLE KEYS */;
INSERT INTO `contenidos` VALUES (9,3,2,'Unidad Nº1','Se trabajara la comprensión lectora','1775688193326-184373042.pdf',4,'2026-04-08 19:43:13'),(10,3,2,'Unidad N°2','En esta unidad se vera la descomposición de las oraciones','1775703526923-359499786.pdf',4,'2026-04-08 23:58:46');
/*!40000 ALTER TABLE `contenidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cursos`
--

DROP TABLE IF EXISTS `cursos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cursos` (
  `id_curso` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `anio` int DEFAULT NULL,
  `division` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_curso`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cursos`
--

LOCK TABLES `cursos` WRITE;
/*!40000 ALTER TABLE `cursos` DISABLE KEYS */;
INSERT INTO `cursos` VALUES (1,'1° Año',1,'A'),(2,'1° Año',1,'B'),(3,'1° Año',1,'C'),(4,'2° Año',2,'A'),(5,'2° Año',2,'B'),(6,'2° Año',2,'C'),(7,'3° Año',3,'A'),(8,'3° Año',3,'B'),(9,'3° Año',3,'C'),(10,'4° Año',4,'A'),(11,'4° Año',4,'B'),(12,'5° Año',5,'A'),(13,'5° Año',5,'B'),(14,'6° Año',6,'A');
/*!40000 ALTER TABLE `cursos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directivos`
--

DROP TABLE IF EXISTS `directivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `directivos` (
  `id_directivo` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `oficina` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_directivo`),
  KEY `fk_directivo_usuario` (`id_usuario`),
  CONSTRAINT `fk_directivo_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directivos`
--

LOCK TABLES `directivos` WRITE;
/*!40000 ALTER TABLE `directivos` DISABLE KEYS */;
/*!40000 ALTER TABLE `directivos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `docente_materia_curso`
--

DROP TABLE IF EXISTS `docente_materia_curso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `docente_materia_curso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_docente` int NOT NULL,
  `id_materia` int NOT NULL,
  `id_curso` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_relacion` (`id_docente`,`id_materia`,`id_curso`),
  KEY `fk_dmc_materias` (`id_materia`),
  KEY `fk_dmc_curso` (`id_curso`),
  CONSTRAINT `fk_dmc_curso` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`),
  CONSTRAINT `fk_dmc_docente` FOREIGN KEY (`id_docente`) REFERENCES `docentes` (`id_docente`),
  CONSTRAINT `fk_dmc_materias` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `docente_materia_curso`
--

LOCK TABLES `docente_materia_curso` WRITE;
/*!40000 ALTER TABLE `docente_materia_curso` DISABLE KEYS */;
INSERT INTO `docente_materia_curso` VALUES (1,3,1,1),(2,4,3,2);
/*!40000 ALTER TABLE `docente_materia_curso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `docentes`
--

DROP TABLE IF EXISTS `docentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `docentes` (
  `id_docente` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `titulo` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_docente`),
  KEY `fk_docente_usuario` (`id_usuario`),
  CONSTRAINT `fk_docente_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `docentes`
--

LOCK TABLES `docentes` WRITE;
/*!40000 ALTER TABLE `docentes` DISABLE KEYS */;
INSERT INTO `docentes` VALUES (3,10,'Informatica','Ingeniero sistema',NULL,NULL),(4,12,'Programacion','Ingeniera sistema',NULL,NULL),(5,14,'Álgebra y Geometría','Lic. en Matemática',NULL,NULL),(6,16,'Ingles','Traducturado en Ingles',NULL,NULL);
/*!40000 ALTER TABLE `docentes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materias`
--

DROP TABLE IF EXISTS `materias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materias` (
  `id_materia` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `creado_por` int DEFAULT NULL,
  `creado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_materia`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materias`
--

LOCK TABLES `materias` WRITE;
/*!40000 ALTER TABLE `materias` DISABLE KEYS */;
INSERT INTO `materias` VALUES (1,'Matematica','Se dicta los días lunes y viernes 2hs al día.',11,'2026-04-06 23:49:59'),(3,'Lengua ','Se dicta de martes a jueves solo 1hs al dia',11,'2026-04-07 00:02:18');
/*!40000 ALTER TABLE `materias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notas`
--

DROP TABLE IF EXISTS `notas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_alumno` int DEFAULT NULL,
  `id_materia` int DEFAULT NULL,
  `tipo` enum('Parcial','Final','TP','Recuperatorio') DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `nota` decimal(5,2) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `trimestre` int DEFAULT NULL,
  `es_promocion` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_notas_alumno` (`id_alumno`),
  KEY `idx_notas_materia` (`id_materia`),
  CONSTRAINT `notas_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`),
  CONSTRAINT `notas_ibfk_2` FOREIGN KEY (`id_materia`) REFERENCES `materias` (`id_materia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notas`
--

LOCK TABLES `notas` WRITE;
/*!40000 ALTER TABLE `notas` DISABLE KEYS */;
/*!40000 ALTER TABLE `notas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  `descripcion` text,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre_rol` (`nombre_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'superadmin','Acceso total al sistema'),(2,'directivo','Gestiona la institucion'),(3,'docente','Encargado de dictar clases'),(4,'alumno','Estudiante del sistema');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_archivos`
--

DROP TABLE IF EXISTS `usuario_archivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_archivos` (
  `id_archivo` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `nombre_archivo` varchar(255) DEFAULT NULL,
  `ruta_archivo` varchar(255) DEFAULT NULL,
  `tipo_archivo` varchar(100) DEFAULT NULL,
  `fecha_subida` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_archivo`),
  KEY `fk_archivo_usuario` (`id_usuario`),
  CONSTRAINT `fk_archivo_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_archivos`
--

LOCK TABLES `usuario_archivos` WRITE;
/*!40000 ALTER TABLE `usuario_archivos` DISABLE KEYS */;
INSERT INTO `usuario_archivos` VALUES (1,1,'1775272304807-661085165.jpg','uploads\\archivos_registros\\dni\\1775272304807-661085165.jpg','dni','2026-04-04 00:11:45'),(2,1,'1775272304832-636639003.png','uploads\\archivos_registros\\perfil\\1775272304832-636639003.png','perfil','2026-04-04 00:11:45'),(3,6,'1775351572815-621300837.PNG','/uploads/1775351572815-621300837.PNG','dni','2026-04-04 22:12:53'),(4,6,'1775351572820-225363709.png','/uploads\\archivos_registros\\perfil\\1775351572820-225363709.png','perfil','2026-04-04 22:12:53'),(7,10,'1775367398566-613346577.png','uploads/archivos_registros/dni/1775367398566-613346577.png','dni','2026-04-05 02:36:39'),(8,10,'1775367398851-635068650.jpg','uploads/archivos_registros/perfil/1775367398851-635068650.jpg','perfil','2026-04-05 02:36:39'),(9,11,'1775422831741-921024813.PNG','uploads/archivos_registros/dni/1775422831741-921024813.PNG','dni','2026-04-05 18:00:31'),(10,11,'1775422831742-201840977.jpg','uploads/archivos_registros/perfil/1775422831742-201840977.jpg','perfil','2026-04-05 18:00:31'),(11,12,'1775423009455-650966360.jpg','uploads/archivos_registros/dni/1775423009455-650966360.jpg','dni','2026-04-05 18:03:29'),(12,12,'1775423009519-242123672.jpg','uploads/archivos_registros/perfil/1775423009519-242123672.jpg','perfil','2026-04-05 18:03:29'),(13,13,'1775423516006-857495453.jpg','uploads/archivos_registros/dni/1775423516006-857495453.jpg','dni','2026-04-05 18:11:56'),(14,13,'1775423516080-369280142.png','uploads/archivos_registros/perfil/1775423516080-369280142.png','perfil','2026-04-05 18:11:56'),(15,14,'1775423749212-86052422.jpg','uploads/archivos_registros/dni/1775423749212-86052422.jpg','dni','2026-04-05 18:15:49'),(16,14,'1775423749250-269674310.png','uploads/archivos_registros/perfil/1775423749250-269674310.png','perfil','2026-04-05 18:15:49'),(17,15,'1775423833307-356077773.png','uploads/archivos_registros/dni/1775423833307-356077773.png','dni','2026-04-05 18:17:13'),(18,15,'1775423833309-850404891.jpg','uploads/archivos_registros/perfil/1775423833309-850404891.jpg','perfil','2026-04-05 18:17:13'),(19,16,'1775424031583-198201473.jpg','uploads/archivos_registros/dni/1775424031583-198201473.jpg','dni','2026-04-05 18:20:31'),(20,16,'1775424031652-353168722.PNG','uploads/archivos_registros/perfil/1775424031652-353168722.PNG','perfil','2026-04-05 18:20:31');
/*!40000 ALTER TABLE `usuario_archivos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `id_rol` int NOT NULL,
  `estado` enum('Activo','Inactivo','Pendiente','Rechazado') NOT NULL DEFAULT 'Pendiente',
  `creado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expire` datetime DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_usuario_rol` (`id_rol`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Corbalan','Ricardo','corbalanricardo1@gmail.com','$2b$10$C0Lnew4sTl/rQyPK/ep8ve5ow1DsMc6RAkYd1krzxt8xPu4Zmo4FG',1,'Activo','2026-04-04 00:11:45','2026-04-04 22:58:34',NULL,NULL),(6,'esme','herrera','esmeraldaherrera2121@gmail.com','$2b$10$A47/F2vKn.U88u3iJB9R7uiSEHYbLe39AHvY/GlXV5Hb/RHFtsLA2',4,'Activo','2026-04-04 22:12:53','2026-04-07 19:36:58',NULL,NULL),(10,'jorge','corbalan','richardcorbalan455@gmail.com','$2b$10$xlkmNvtAP/zkxcrFWJx/a.guXWJ/COecrEprpNR5YpuOYT1M.4zhG',3,'Rechazado','2026-04-05 02:36:39','2026-04-05 17:24:33',NULL,NULL),(11,'Juan','morales','solodejuan1987@gmail.com','$2b$10$XMQfv31ew2sfoSZ.eGEQKOFz4gLrDKfoTm0xfS3oUSCzbk1MqAkMG',2,'Activo','2026-04-05 18:00:31','2026-04-05 18:25:31',NULL,NULL),(12,'Paula','Liberatore','anitaliberatore2000@gmail.com','$2b$10$EWSP.iZGdLdjIvQiUm50mO5Yr15EguuQy58dMflA10EiaLtivgd8m',3,'Activo','2026-04-05 18:03:29','2026-04-05 18:25:37',NULL,NULL),(13,'Ana','Liberatore','luz16062000@gmail.com','$2b$10$EbHSVvAKCmmpBqR2VSO91eP8LDva9UkpQlF.QZtY.IvBWXsLzYxie',4,'Activo','2026-04-05 18:11:56','2026-04-05 18:25:27',NULL,NULL),(14,'Ana Paula','Liberatore','anapaupau1696@gmail.com','$2b$10$ePp846XBJrca3Lm5RBc24eqRaURNBWo4zk2RelD47f/HW8imB2KQK',3,'Rechazado','2026-04-05 18:15:49','2026-04-05 18:25:38',NULL,NULL),(15,'Amparo','Barraza','amparobarrazacanto@gmail.com','$2b$10$K/LPX6b5qG6cPRko.qCBpet8lTXZUD3UvbfzJJN5csHmqmyQG2s6G',4,'Rechazado','2026-04-05 18:17:13','2026-04-05 18:25:29',NULL,NULL),(16,'Amparo','Canto','barrazacantoamparo@gmail.com','$2b$10$cn7luMfJ0PMNPn/E7qwHru/sN6u/v0MslvdkuzN1dlO02F9/siqZS',3,'Activo','2026-04-05 18:20:31','2026-04-05 18:25:39',NULL,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-09  3:36:31
