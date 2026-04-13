# 🔧 Ejemplos Backend Necesarios

## Endpoints que deben existir/actualizarse

### 1. Obtener Entregas con Datos del Alumno

**Archivo:** `controllers/entregas_tareas.controller.js`

```javascript
// GET /api/entregas/tarea/:id_tarea
exports.obtenerEntregasPorTarea = async (req, res) => {
  try {
    const { id_tarea } = req.params;
    const with_alumno = req.query.with_alumno; // ?with_alumno=true

    let query = `
      SELECT 
        et.*,
        if(with_alumno = true, a.nombre as alumno_nombre, null) as alumno_nombre,
        if(with_alumno = true, a.email as alumno_email, null) as alumno_email
      FROM entregas_tareas et
    `;

    if (with_alumno === 'true') {
      query = `
        SELECT 
          et.*,
          a.nombre as alumno_nombre,
          a.email as alumno_email
        FROM entregas_tareas et
        INNER JOIN alumnos a ON et.id_alumno = a.id_alumno
      `;
    }

    query += ` WHERE et.id_tarea = ? ORDER BY et.fecha_entrega DESC`;

    const [entregas] = await connection.execute(query, [id_tarea]);
    res.json(entregas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

### 2. Obtener Tareas del Alumno con Entregas

**Archivo:** `controllers/tareas.controller.js`

```javascript
// GET /api/entregas/tareas/:id_materia/:id_curso
exports.obtenerTareasAlumnoWithEntregas = async (req, res) => {
  try {
    const { id_materia, id_curso } = req.params;
    const id_alumno = req.usuario.id_alumno; // Del token

    const query = `
      SELECT 
        t.*,
        JSON_OBJECT(
          'id_entrega', et.id_entrega,
          'archivo', et.archivo,
          'comentario', et.comentario,
          'fecha_entrega', et.fecha_entrega,
          'nota', et.nota,
          'estado', et.estado
        ) as entrega
      FROM tareas t
      LEFT JOIN entregas_tareas et 
        ON t.id_tarea = et.id_tarea 
        AND et.id_alumno = ?
      WHERE t.id_materia = ? 
        AND t.id_curso = ?
      ORDER BY t.fecha_entrega ASC
    `;

    const [tareas] = await connection.execute(query, [
      id_alumno,
      id_materia,
      id_curso
    ]);

    // Parsear entrega si es null
    const tareasProcessadas = tareas.map(t => ({
      ...t,
      entrega: t.entrega ? JSON.parse(t.entrega) : null
    }));

    res.json(tareasProcessadas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

### 3. Crear Entrega

**Archivo:** `controllers/entregas_tareas.controller.js`

```javascript
// POST /api/entregas
exports.crearEntrega = async (req, res) => {
  try {
    const { id_tarea, comentario } = req.body;
    const id_alumno = req.usuario.id_alumno; // Del token
    let archivo = null;

    // Si hay archivo, guardarlo
    if (req.file) {
      archivo = req.file.filename;
    }

    // Verificar si ya existe entrega
    const [existente] = await connection.execute(
      'SELECT id_entrega FROM entregas_tareas WHERE id_tarea = ? AND id_alumno = ?',
      [id_tarea, id_alumno]
    );

    let query, params;

    if (existente.length > 0) {
      // Actualizar
      query = `
        UPDATE entregas_tareas 
        SET archivo = ?, comentario = ?, fecha_entrega = NOW(), estado = 'Entregado'
        WHERE id_tarea = ? AND id_alumno = ?
      `;
      params = [archivo || existente[0].archivo, comentario, id_tarea, id_alumno];
    } else {
      // Crear nueva
      query = `
        INSERT INTO entregas_tareas 
        (id_tarea, id_alumno, archivo, comentario, fecha_entrega, estado)
        VALUES (?, ?, ?, ?, NOW(), 'Entregado')
      `;
      params = [id_tarea, id_alumno, archivo, comentario];
    }

    await connection.execute(query, params);

    res.json({ 
      mensaje: existente.length > 0 ? 'Entrega actualizada' : 'Entrega creada',
      id_alumno,
      id_tarea
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

### 4. Calificar Entrega

**Archivo:** `controllers/entregas_tareas.controller.js`

```javascript
// PUT /api/entregas/:id_entrega/calificar
exports.calificarEntrega = async (req, res) => {
  try {
    const { id_entrega } = req.params;
    const { nota, comentario } = req.body;

    // Validar nota
    if (nota < 0 || nota > 10) {
      return res.status(400).json({ error: 'Nota debe estar entre 0 y 10' });
    }

    const query = `
      UPDATE entregas_tareas 
      SET nota = ?, comentario = ?, estado = 'Corregido'
      WHERE id_entrega = ?
    `;

    await connection.execute(query, [nota, comentario || null, id_entrega]);

    res.json({ 
      mensaje: 'Entrega calificada correctamente',
      id_entrega,
      nota,
      estado: 'Corregido'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

### 5. Rutas Necesarias

**Archivo:** `routes/entregas_tareas.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const controller = require('../controllers/entregas_tareas.controller');

// Obtener entregas de una tarea (con datos del alumno)
router.get('/tarea/:id_tarea', auth, controller.obtenerEntregasPorTarea);

// Obtener tareas del alumno con entregas
router.get('/tareas/:id_materia/:id_curso', auth, controller.obtenerTareasAlumnoWithEntregas);

// Crear/actualizar entrega
router.post('/', auth, upload.single('archivo'), controller.crearEntrega);

// Calificar entrega
router.put('/:id_entrega/calificar', auth, controller.calificarEntrega);

// Descargar archivo
router.get('/descargar/:id_entrega', auth, controller.descargarArchivo);

// Eliminar entrega
router.delete('/:id_entrega', auth, controller.eliminarEntrega);

module.exports = router;
```

---

## 📋 Checklist de Verificación

- [ ] El endpoint `/api/entregas/tarea/:id_tarea` retorna datos del alumno (nombre, email)
- [ ] El endpoint `/api/entregas/tareas/:id_materia/:id_curso` retorna tareas con entregas anidadas
- [ ] Al crear entrega, se obtiene `id_alumno` del token automáticamente
- [ ] El campo `estado` se asigna automáticamente a "Entregado" al crear
- [ ] Al calificar, el estado cambia a "Corregido"
- [ ] Los campos `fecha_creacion` en tareas se guardan automáticamente
- [ ] Los campos de las entregas coinciden: `id_entrega`, `archivo`, `comentario`, `fecha_entrega`, `nota`, `estado`

---

## 🔗 Dependencias en Frontend

Los componentes ahora esperan:

| Componente | Endpoint | Método | Parámetros |
|-----------|----------|--------|-----------|
| CrearTareas | `/api/tareas` | POST | id_materia, id_curso, titulo, descripcion, fecha_entrega, fecha_creacion |
| CrearTareas | `/api/materias/docente` | GET | - |
| RecibirTarea | `/api/materias/docente` | GET | - |
| RecibirTarea | `/api/tareas` | GET | ?id_materia=X&id_curso=Y |
| RecibirTarea | `/api/entregas/tarea/:id_tarea?with_alumno=true` | GET | - |
| RecibirTarea | `/api/entregas/:id_entrega/calificar` | PUT | nota, comentario |
| EnviarTareas | `/api/alumnos/mis-materias` | GET | - |
| EnviarTareas | `/api/entregas/tareas/:id_materia/:id_curso` | GET | - |
| EnviarTareas | `/api/entregas` | POST | id_tarea, archivo, comentario, estado |
| EnviarTareas | `/api/entregas/:id_entrega` | DELETE | - |

---

*Documento de referencia backend - Usar como guía para implementación*
