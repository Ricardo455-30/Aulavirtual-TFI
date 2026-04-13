# 📚 DOCUMENTACIÓN DE ENDPOINTS - TAREAS Y ENTREGAS

## Base URL
```
http://localhost:8000/api
```

---

## 📋 TAREAS - ENDPOINTS

### 1️⃣ CREAR TAREA (Docente)
**Método:** `POST`  
**Ruta:** `/tareas`  
**Autenticación:** Requerida (Docente)

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "id_materia": 1,
  "id_curso": 1,
  "titulo": "Investigación sobre React",
  "descripcion": "Realiza una investigación sobre conceptos avanzados de React",
  "fecha_entrega": "2026-05-15"
}
```

**Response (201):**
```json
{
  "message": "Tarea creada correctamente",
  "id_tarea": 1,
  "tarea": {
    "id_tarea": 1,
    "id_materia": 1,
    "id_curso": 1,
    "titulo": "Investigación sobre React",
    "descripcion": "Realiza una investigación sobre conceptos avanzados de React",
    "fecha_entrega": "2026-05-15"
  }
}
```

---

### 2️⃣ OBTENER TAREAS (Docente/Sistema)
**Método:** `GET`  
**Ruta:** `/tareas?id_materia=1&id_curso=1`  
**Autenticación:** Requerida

**Query Params:**
- `id_materia` (requerido)
- `id_curso` (requerido)

**Response (200):**
```json
[
  {
    "id_tarea": 1,
    "id_materia": 1,
    "id_curso": 1,
    "titulo": "Investigación sobre React",
    "descripcion": "Realiza una investigación sobre conceptos avanzados de React",
    "fecha_entrega": "2026-05-15",
    "fecha_creacion": "2026-04-11T10:30:00.000Z"
  }
]
```

---

### 3️⃣ OBTENER TAREA POR ID
**Método:** `GET`  
**Ruta:** `/tareas/:id`  
**Autenticación:** Requerida

**Response (200):**
```json
{
  "id_tarea": 1,
  "id_materia": 1,
  "id_curso": 1,
  "titulo": "Investigación sobre React",
  "descripcion": "Realiza una investigación sobre conceptos avanzados de React",
  "fecha_entrega": "2026-05-15",
  "fecha_creacion": "2026-04-11T10:30:00.000Z"
}
```

---

### 4️⃣ EDITAR TAREA (Docente)
**Método:** `PUT`  
**Ruta:** `/tareas/:id`  
**Autenticación:** Requerida (Docente - propietario de la tarea)

**Body (al menos un campo):**
```json
{
  "titulo": "Investigación sobre React - Editado",
  "descripcion": "Nueva descripción",
  "fecha_entrega": "2026-05-20"
}
```

**Response (200):**
```json
{
  "message": "Tarea actualizada correctamente"
}
```

---

### 5️⃣ ELIMINAR TAREA (Docente)
**Método:** `DELETE`  
**Ruta:** `/tareas/:id`  
**Autenticación:** Requerida (Docente - propietario de la tarea)

**Response (200):**
```json
{
  "message": "Tarea eliminada correctamente"
}
```

---

### 6️⃣ OBTENER TAREAS DEL ALUMNO (Alumno)
**Método:** `GET`  
**Ruta:** `/tareas/alumno/tareas/:id_materia/:id_curso`  
**Autenticación:** Requerida (Alumno)

**Response (200):**
```json
[
  {
    "id_tarea": 1,
    "id_materia": 1,
    "id_curso": 1,
    "titulo": "Investigación sobre React",
    "descripcion": "Realiza una investigación sobre conceptos avanzados de React",
    "fecha_entrega": "2026-05-15",
    "fecha_creacion": "2026-04-11T10:30:00.000Z",
    "id_entrega": 1,
    "archivo": "1681234567-123456789.pdf",
    "comentario": "Mi investigación",
    "fecha_entrega_alumno": "2026-04-20T15:45:00.000Z",
    "nota": 8.5,
    "estado": "Corregido"
  }
]
```

---

## 📤 ENTREGAS - ENDPOINTS

### 1️⃣ ENTREGAR TAREA (Alumno)
**Método:** `POST`  
**Ruta:** `/entregas`  
**Autenticación:** Requerida (Alumno)  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `id_tarea` (requerido): ID de la tarea
- `archivo` (opcional): Archivo para subir
- `comentario` (opcional): Comentario del alumno

**Requisitos:**
- Alumno debe estar inscrito en el curso
- El archivo debe ser < 10MB
- Tipos permitidos: PDF, DOC, DOCX, PPT, PPTX, Excel, imágenes, ZIP, videos, audio

**Response (201):**
```json
{
  "message": "Tarea entregada correctamente",
  "id_entrega": 1,
  "entrega": {
    "id_entrega": 1,
    "id_tarea": 1,
    "id_alumno": 5,
    "archivo": "1681234567-123456789.pdf",
    "comentario": "Mi solución del ejercicio",
    "estado": "Entregado"
  }
}
```

---

### 2️⃣ OBTENER ENTREGAS DE UNA TAREA (Docente)
**Método:** `GET`  
**Ruta:** `/entregas/tarea/:id_tarea`  
**Autenticación:** Requerida (Docente - propietario de la tarea)

**Response (200):**
```json
[
  {
    "id_entrega": 1,
    "id_tarea": 1,
    "id_alumno": 5,
    "archivo": "1681234567-123456789.pdf",
    "comentario": "Mi solución",
    "fecha_entrega": "2026-04-20T15:45:00.000Z",
    "nota": 8.5,
    "estado": "Corregido",
    "nombre": "Juan García",
    "email": "juan.garcia@email.com"
  }
]
```

---

### 3️⃣ OBTENER ENTREGA POR ID
**Método:** `GET`  
**Ruta:** `/entregas/obtener/:id`  
**Autenticación:** Requerida

**Response (200):**
```json
{
  "id_entrega": 1,
  "id_tarea": 1,
  "id_alumno": 5,
  "archivo": "1681234567-123456789.pdf",
  "comentario": "Mi solución",
  "fecha_entrega": "2026-04-20T15:45:00.000Z",
  "nota": 8.5,
  "estado": "Corregido",
  "nombre": "Juan García",
  "email": "juan.garcia@email.com",
  "titulo_tarea": "Investigación sobre React"
}
```

---

### 4️⃣ CALIFICAR ENTREGA (Docente)
**Método:** `PUT`  
**Ruta:** `/entregas/:id/calificar`  
**Autenticación:** Requerida (Docente - propietario de la tarea)

**Body:**
```json
{
  "nota": 8.5,
  "comentario": "Excelente trabajo, falta revisar la parte de hooks"
}
```

**Response (200):**
```json
{
  "message": "Entrega calificada correctamente"
}
```

---

### 5️⃣ OBTENER ENTREGAS DEL ALUMNO
**Método:** `GET`  
**Ruta:** `/entregas/mis-entregas`  
**Autenticación:** Requerida (Alumno)

**Query Params (opcionales):**
- `id_materia`: Filtrar por materia
- `id_curso`: Filtrar por curso

**Response (200):**
```json
[
  {
    "id_entrega": 1,
    "id_tarea": 1,
    "id_alumno": 5,
    "archivo": "1681234567-123456789.pdf",
    "comentario": "Mi solución",
    "fecha_entrega": "2026-04-20T15:45:00.000Z",
    "nota": 8.5,
    "estado": "Corregido",
    "titulo": "Investigación sobre React",
    "descripcion": "Realiza una investigación sobre conceptos avanzados de React",
    "fecha_limite": "2026-05-15",
    "materia": "Desarrolllozo de Aplicaciones",
    "curso": "4to A"
  }
]
```

---

### 6️⃣ DESCARGAR ARCHIVO DE ENTREGA
**Método:** `GET`  
**Ruta:** `/entregas/descargar/:id`  
**Autenticación:** Requerida

**Response:** Descarga el archivo

---

### 7️⃣ ELIMINAR ENTREGA (Alumno)
**Método:** `DELETE`  
**Ruta:** `/entregas/:id`  
**Autenticación:** Requerida (Alumno - propietario de la entrega)

**Restricciones:**
- No se puede eliminar una entrega ya corregida

**Response (200):**
```json
{
  "message": "Entrega eliminada correctamente"
}
```

---

## 🔐 ROLES Y PERMISOS

| Endpoint | Docente | Alumno | Directivo |
|----------|---------|--------|-----------|
| POST `/tareas` | ✅ | ❌ | ❌ |
| GET `/tareas` | ✅ | ✅ | ✅ |
| GET `/tareas/:id` | ✅ | ✅ | ✅ |
| PUT `/tareas/:id` | ✅* | ❌ | ❌ |
| DELETE `/tareas/:id` | ✅* | ❌ | ❌ |
| GET `/tareas/alumno/tareas/:id_materia/:id_curso` | ❌ | ✅ | ❌ |
| POST `/entregas` | ❌ | ✅ | ❌ |
| GET `/entregas/tarea/:id_tarea` | ✅* | ❌ | ❌ |
| GET `/entregas/obtener/:id` | ✅ | ✅ | ✅ |
| PUT `/entregas/:id/calificar` | ✅* | ❌ | ❌ |
| GET `/entregas/mis-entregas` | ❌ | ✅ | ❌ |
| GET `/entregas/descargar/:id` | ✅ | ✅ | ✅ |
| DELETE `/entregas/:id` | ❌ | ✅** | ❌ |

**Legend:**
- ✅* = Solo si es propietario de la tarea/entrega
- ✅** = Solo si no está corregida

---

## 🌳 ESTADOS DE ENTREGA

- **Pendiente**: Inicial, no hay entrega aún
- **Entregado**: El alumno ha entregado la tarea
- **Corregido**: El docente ha calificado la entrega

---

## ⚠️ CÓDIGOS DE ERROR

- `400` - Validación fallida (campos requeridos, datos inválidos)
- `401` - No autenticado (sin token o token inválido)
- `403` - No autorizado (rol insuficiente o sin permisos)
- `404` - Recurso no encontrado
- `500` - Error interno del servidor

---

## 📝 NOTAS IMPORTANTES

1. **Autenticación**: Todos los endpoints requieren un token JWT en el header `Authorization: Bearer {token}`
2. **Validación de roles**: Los roles se validan del token JWT (`req.user.rol`)
3. **Subida de archivos**: El campo del archivo debe llamarse exactamente `archivo`
4. **Permisos**: Un docente solo puede modificar/ver tareas que le corresponden (basado en `docente_materia_curso`)
5. **Consultas anidadas**: Las entregas del alumno incluyen información de la tarea y viceversa
