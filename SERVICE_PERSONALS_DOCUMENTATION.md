# CRUD Service Personals - Documentación

## Descripción General
Se ha creado un módulo completo de CRUD para la tabla `service_personals` en el frontend, siguiendo la estructura y patrones del proyecto.

## Archivos Creados

### 1. Servicio API (`src/services/servicePersonal.js`)
Proporciona funciones para comunicarse con el backend:
- `getAll()` - Obtiene todos los servicios del personal
- `getById(id)` - Obtiene un servicio por ID
- `create(payload)` - Crea un nuevo servicio
- `update(id, payload)` - Actualiza un servicio existente
- `destroy(id)` - Elimina un servicio

**Endpoints esperados:**
- GET `/service-personals` - Obtener todos
- POST `/service-personals` - Crear
- PUT `/service-personals/{id}` - Actualizar
- DELETE `/service-personals/{id}` - Eliminar
- GET `/service-personals/{id}` - Obtener por ID

### 2. Store (Pinia) (`src/stores/servicePersonalStore.js`)
Gestiona el estado global de servicios del personal:

**State:**
- `servicePersonals: ref([])` - Lista de servicios del personal
- `loading: ref(false)` - Estado de carga
- `currentServicePersonal: ref(null)` - Servicio actual seleccionado
- `errors: ref(null)` - Errores de validación

**Actions:**
- `fetchServicePersonals()` - Obtiene todos los servicios
- `fetchServicePersonalById(id)` - Obtiene un servicio por ID
- `createServicePersonal(payload)` - Crea un nuevo servicio
- `updateServicePersonal(id, payload)` - Actualiza un servicio
- `deleteServicePersonal(id)` - Elimina un servicio

### 3. Componente Formulario (`src/components/ServicePersonalForm.vue`)
Formulario reutilizable para crear/editar servicios del personal:

**Props:**
- `modelValue` - Objeto con los datos del formulario

**Campos:**
- Personal ID (number, requerido)
- Descripción (textarea, requerido)
- Fecha Inicio (date, requerido)
- Fecha Fin (date, opcional)

**Métodos expuestos:**
- `submitForm()` - Valida y retorna los datos del formulario

### 4. Componente Tabla (`src/components/ServicePersonalDetailTable.vue`)
Tabla reutilizable para mostrar servicios del personal:

**Props:**
- `data` - Array de servicios a mostrar

**Eventos:**
- `@edit` - Se emite cuando se hace clic en editar
- `@delete` - Se emite cuando se hace clic en eliminar

### 5. Vista Principal (`src/views/ServicePersonals.vue`)
Página principal de gestión de servicios del personal:

**Funcionalidades:**
- Listado de todos los servicios del personal
- Crear nuevo servicio (modal)
- Editar servicio existente (modal)
- Eliminar servicio (con confirmación)
- Validación de formularios
- Mensajes de éxito/error

## Rutas Registradas

Se agregó la siguiente ruta en `src/router/index.js`:

```javascript
{
  path: '/mantenimiento/servicios-personal',
  name: 'ServiciosPersonal',
  component: ServicePersonalsView
}
```

**URL de acceso:** `/mantenimiento/servicios-personal`

## Estructura de Datos

La tabla `service_personals` en el backend debe tener la siguiente estructura:

```
id (int, primary key)
personal_id (int, foreign key)
descripcion (string)
fecha_inicio (date)
fecha_fin (date, nullable)
created_at (timestamp)
updated_at (timestamp)
```

## Cómo Usar

### 1. Acceder a la sección
Navega a través del menú "Mantenimiento" > "Servicios del Personal"

### 2. Crear un nuevo servicio
- Haz clic en el botón "Nuevo Servicio"
- Completa el formulario
- Haz clic en "Guardar"

### 3. Editar un servicio
- Haz clic en el botón "Editar" en la fila del servicio
- Modifica los datos necesarios
- Haz clic en "Guardar"

### 4. Eliminar un servicio
- Haz clic en el botón "Eliminar" en la fila del servicio
- Confirma la eliminación

## Validaciones

- Personal ID: Requerido, debe ser un número
- Descripción: Requerido
- Fecha Inicio: Requerido
- Fecha Fin: Opcional

## Dependencias

- Vue 3 (Composition API)
- Pinia (State Management)
- Element Plus (UI Components)
- Axios (HTTP Client)

## Integración con Backend

El servicio `servicePersonal.js` utiliza la instancia de Axios configurada en `src/services/api.js`, que incluye:
- Manejo automático de tokens de autenticación (Bearer token)
- Base URL configurada desde variables de entorno
- Manejo de errores y validaciones

## Notas Importantes

1. El endpoint del backend debe estar disponible en `/service-personals`
2. La respuesta del backend debe seguir el formato:
   ```json
   {
     "data": [...]
   }
   ```
3. Los errores de validación (422) se capturan en el store
4. Se incluyen mensajes de éxito/error automáticos

## Próximos Pasos Opcionales

Si deseas expandir la funcionalidad:

1. **Validaciones adicionales** - Agregar validaciones más complejas en el formulario
2. **Búsqueda y filtrado** - Agregar campos de búsqueda en la tabla
3. **Paginación** - Implementar paginación si hay muchos registros
4. **Exportación** - Agregar opción de exportar a Excel/PDF
5. **Relaciones** - Mostrar nombre del personal en lugar de solo el ID
