# ✅ Correcciones de Componentes de Tareas

## Resumen
Se corrigieron 3 componentes principales para que funcionen correctamente con la BD:
- **CrearTareas.jsx** (Docente)
- **RecibirTarea.jsx** (Docente)
- **EnviarTareas.jsx** (Alumno)

---

## 📋 Cambios Realizados

### 1️⃣ **CrearTareas.jsx** (Docente - Crear tareas)
**Cambios:**
- ✅ Agregado campo `fecha_creacion` al crear una tarea (se envía la fecha actual)
- ✅ Los campos enviados ahora coinciden totalmente con la BD:
  - `id_materia`, `id_curso`, `titulo`, `descripcion`, `fecha_entrega`, `fecha_creacion`

**Campos esperados por BD:**
```
id_materia: int
id_curso: int  
titulo: varchar(150)
descripcion: text (nullable)
fecha_entrega: date (nullable)
fecha_creacion: timestamp (se genera aquí)
```

---

### 2️⃣ **RecibirTarea.jsx** (Docente - Calificar entregas)
**Cambios:**
- ✅ Cambiado `entrega.nombre` → `entrega.alumno_nombre`
- ✅ Cambiado `entrega.email` → `entrega.alumno_email`
- ✅ El endpoint ahora espera que retorne datos del alumno haciendo INNER JOIN

**Endpoint corregido:**
```javascript
GET /api/entregas/tarea/:id_tarea?with_alumno=true
```

**Respuesta esperada (array de entregas con datos del alumno):**
```json
[{
  "id_entrega": 1,
  "id_tarea": 5,
  "id_alumno": 10,
  "archivo": "tarea.pdf",
  "comentario": "Mi solución",
  "fecha_entrega": "2026-04-12T14:30:00Z",
  "nota": 8.5,
  "estado": "Entregado",
  
  // AGREGADOS DESDE TABLA ALUMNOS (JOIN):
  "alumno_nombre": "Juan Pérez",
  "alumno_email": "juan@example.com"
}]
```

---

### 3️⃣ **EnviarTareas.jsx** (Alumno - Enviar tareas)
**Cambios:**
- ✅ Endpoint actualizado para cargar tareas con sus entregas:
  ```javascript
  GET /api/entregas/tareas/:id_materia/:id_curso
  ```
- ✅ Mapeo de entregas corregido: Ahora busca `tarea.entrega` en vez de campos individuales
- ✅ Agregado `estado: "Entregado"` al crear entrega

**Respuesta esperada del endpoint:**
```json
[{
  "id_tarea": 5,
  "id_materia": 2,
  "id_curso": 1,
  "titulo": "Investigación React",
  "descripcion": "Hacer un análisis...",
  "fecha_entrega": "2026-04-20",
  "fecha_creacion": "2026-04-10T10:00:00Z",
  
  // ENTREGA DEL ALUMNO (si existe):
  "entrega": {
    "id_entrega": 1,
    "archivo": "miresp.pdf",
    "comentario": "Adjunto mi análisis",
    "fecha_entrega": "2026-04-15T11:20:00Z",
    "nota": 8.5,
    "estado": "Entregado"
  }
}]
```

---

## 🔧 Requisitos del Backend

### Endpoints que deben existir/corregirse:

#### 1. **Crear tarea** (POST)
```
POST /api/tareas
Body: {
  id_materia: int,
  id_curso: int,
  titulo: string,
  descripcion?: string,
  fecha_entrega?: date,
  fecha_creacion: timestamp
}
```

#### 2. **Obtener entregas con datos del alumno** (GET)
```
GET /api/entregas/tarea/:id_tarea?with_alumno=true
Response: Array de entregas con INNER JOIN a tabla alumnos
Campos agregados: alumno_nombre, alumno_email
```

#### 3. **Obtener tareas del alumno con entregas** (GET)
```
GET /api/entregas/tareas/:id_materia/:id_curso
Response: Array de tareas con LEFT JOIN a entregas
Estructura: { ...tarea, entrega: { ...entregas_tareas } }
```

#### 4. **Crear entrega** (POST)
```
POST /api/entregas
Body (FormData): {
  id_tarea: int,
  archivo?: File,
  comentario?: string,
  estado: "Entregado"  // ← Agregado por frontend
}
Backend debe:
- Obtener id_alumno del token/sesión
- Asignar automáticamente fecha_entrega actual
- Insertar con estado = "Entregado"
```

#### 5. **Calificar entrega** (PUT)
```
PUT /api/entregas/:id_entrega/calificar
Body: {
  nota: decimal(4,2),  // 0-10
  comentario?: string
}
Backend debe:
- Cambiar estado a "Corregido"
- Actualizar nota y comentario
```

---

## 📊 Estructura actual de BD (Validada)

### Tabla: `tareas`
```sql
id_tarea INT AUTO_INCREMENT PRIMARY KEY
id_materia INT
id_curso INT
titulo VARCHAR(150)
descripcion TEXT
fecha_entrega DATE
fecha_creacion TIMESTAMP
```

### Tabla: `entregas_tareas`
```sql
id_entrega INT AUTO_INCREMENT PRIMARY KEY
id_tarea INT -- FK hacia tareas
id_alumno INT -- FK hacia alumnos
archivo VARCHAR(255)
comentario TEXT
fecha_entrega TIMESTAMP -- Cuándo envió el alumno
nota DECIMAL(4,2)
estado ENUM('Pendiente','Entregado','Corregido')
```

---

## ✨ Estados de Entrega

La lógica de trabajo es:
1. **Pendiente** → No hay entrega aún
2. **Entregado** → Alumno envió, esperando calificación
3. **Corregido** → Docente calificó y asignó nota

---

## 🚀 Próximos pasos

1. **Backend**: Verificar/crear los endpoints con JOIN correctos
2. **Testing**: Probar que los datos fluyen correctamente
3. **Sincronización**: Asegurar que frontend y backend usan los mismos nombres de campos

---

*Documento generado: 12 de abril de 2026*
