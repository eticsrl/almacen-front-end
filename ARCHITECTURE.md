# 📊 ARQUITECTURA DEL MÓDULO SERVICE PERSONALS

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                      APLICACIÓN VUE 3                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │            ROUTER                                       │   │
│  │  /mantenimiento/servicios-personal                     │   │
│  │  ↓                                                      │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │      VIEW: ServicePersonals.vue (o Advanced)   │   │   │
│  │  │  ┌──────────────────────────────────────────┐ │   │   │
│  │  │  │ - openModal()                            │ │   │   │
│  │  │  │ - submitForm()                           │ │   │   │
│  │  │  │ - handleDelete()                         │ │   │   │
│  │  │  └──────────────────────────────────────────┘ │   │   │
│  │  │  ┌──────────────────────────────────────────┐ │   │   │
│  │  │  │ COMPONENTES:                             │ │   │   │
│  │  │  │ - ServicePersonalForm.vue                │ │   │   │
│  │  │  │ - ServicePersonalDetailTable.vue         │ │   │   │
│  │  │  └──────────────────────────────────────────┘ │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │         ↓ usa                      ↓ emite eventos    │   │
│  │  ┌──────────────────┐      ┌──────────────────┐      │   │
│  │  │ STORE (Pinia)    │      │ USUARIOS         │      │   │
│  │  │                  │      │ - clic editar    │      │   │
│  │  │ - state          │      │ - clic eliminar  │      │   │
│  │  │ - actions        │      │ - guardar        │      │   │
│  │  │ - getters        │      └──────────────────┘      │   │
│  │  └──────────────────┘                                │   │
│  │         ↓ llama                                       │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ SERVICE: servicePersonal.js                   │   │   │
│  │  │ - getAll()                                    │   │   │
│  │  │ - getById(id)                                │   │   │
│  │  │ - create(payload)                            │   │   │
│  │  │ - update(id, payload)                        │   │   │
│  │  │ - destroy(id)                                │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │         ↓ usa axios                                  │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ API CLIENT: axios (configurado)              │   │   │
│  │  │ - Base URL: /api                              │   │   │
│  │  │ - Headers: Authorization: Bearer token       │   │   │
│  │  │ - CORS: habilitado                            │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └────────────────────────────────────────────────────┘   │
│                                                                 │
│                       ↓ HTTP Requests                         │
│  ═══════════════════════════════════════════════════════════  │
│                                                                 │
│  ┌────────────────────────────────────────────────────┐       │
│  │         BACKEND (Laravel API)                       │       │
│  │                                                     │       │
│  │  GET    /api/service-personals                     │       │
│  │  POST   /api/service-personals                     │       │
│  │  GET    /api/service-personals/{id}                │       │
│  │  PUT    /api/service-personals/{id}                │       │
│  │  DELETE /api/service-personals/{id}                │       │
│  │                                                     │       │
│  │  ↓ Controlador                                     │       │
│  │  ServicePersonalController                         │       │
│  │                                                     │       │
│  │  ↓ Modelo                                          │       │
│  │  ServicePersonal                                   │       │
│  │                                                     │       │
│  │  ↓ Tabla BD                                        │       │
│  │  service_personals                                 │       │
│  │                                                     │       │
│  └────────────────────────────────────────────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Datos (CRUD)

### CREATE (Crear nuevo servicio)

```
USUARIO
   ↓
[Clic "Nuevo Servicio"]
   ↓
openModal() → modalVisible = true
   ↓
[Completa formulario]
   ↓
submitForm()
   ↓
validate()
   ↓
store.createServicePersonal(form)
   ↓
api.post('/service-personals', form)
   ↓
Backend: Guarda en BD
   ↓
Retorna datos con ID
   ↓
store.servicePersonals.push(response.data)
   ↓
UI se actualiza
   ↓
ElMessage.success("Creado!")
```

### READ (Listar servicios)

```
USUARIO ACCEDE A /mantenimiento/servicios-personal
   ↓
onMounted() → store.fetchServicePersonals()
   ↓
api.get('/service-personals')
   ↓
Backend: Obtiene de BD
   ↓
Retorna array de servicios
   ↓
store.servicePersonals = response.data.data
   ↓
UI renderiza tabla con datos
   ↓
La tabla se muestra con todos los servicios
```

### UPDATE (Editar servicio)

```
USUARIO
   ↓
[Clic "Editar" en un servicio]
   ↓
openModal(servicio) → modalVisible = true, form = {...servicio}
   ↓
[Modifica datos]
   ↓
submitForm()
   ↓
validate()
   ↓
store.updateServicePersonal(id, form)
   ↓
api.put('/service-personals/{id}', form)
   ↓
Backend: Actualiza en BD
   ↓
Retorna datos actualizados
   ↓
store.servicePersonals[index] = response.data
   ↓
UI se actualiza
   ↓
ElMessage.success("Actualizado!")
```

### DELETE (Eliminar servicio)

```
USUARIO
   ↓
[Clic "Eliminar"]
   ↓
ElMessageBox.confirm()
   ↓
[Usuario confirma]
   ↓
store.deleteServicePersonal(id)
   ↓
api.delete('/service-personals/{id}')
   ↓
Backend: Elimina de BD
   ↓
Retorna confirmación
   ↓
store.servicePersonals = store.servicePersonals.filter(sp => sp.id !== id)
   ↓
UI se actualiza (se remueve de tabla)
   ↓
ElMessage.success("Eliminado!")
```

---

## Estructura de Carpetas

```
farmacia-sl-front-end-potosi/
├── src/
│   ├── components/
│   │   ├── ServicePersonalForm.vue           ← Formulario reutilizable
│   │   └── ServicePersonalDetailTable.vue    ← Tabla reutilizable
│   ├── services/
│   │   └── servicePersonal.js                ← Llamadas API
│   ├── stores/
│   │   ├── servicePersonalStore.js           ← State básico
│   │   └── servicePersonalStoreAdvanced.js   ← State con búsqueda
│   ├── views/
│   │   ├── ServicePersonals.vue              ← Vista simple
│   │   └── ServicePersonalsAdvanced.vue      ← Vista avanzada
│   └── router/
│       └── index.js                          ← Rutas (actualizado)
├── RESUMEN_EJECUTIVO.md                       ← Resumen general
├── SERVICE_PERSONALS_DOCUMENTATION.md         ← Doc técnica
├── README_SERVICE_PERSONALS.md                ← Guía de uso
├── CUSTOMIZATION_EXAMPLES.js                  ← Ejemplos
├── VERIFICATION_CHECKLIST.md                  ← Verificación
├── MENU_INTEGRATION.md                        ← Menú
└── ARCHITECTURE.md                            ← Este archivo
```

---

## Puntos de Integración

### 1. Authentication (Autenticación)

```javascript
// Automático con axios.defaults
Headers: {
  'Authorization': 'Bearer ' + localStorage.getItem('token'),
  'X-CSRF-TOKEN': csrfToken
}
```

### 2. Error Handling (Manejo de Errores)

```javascript
try {
  const response = await create(payload)
  // Éxito
} catch (error) {
  if (error.response?.status === 422) {
    // Errores de validación
    errors.value = error.response.data.errors
  } else if (error.response?.status === 401) {
    // No autenticado
    router.push('/login')
  } else if (error.response?.status === 403) {
    // No autorizado
    ElMessage.error('No tienes permiso')
  }
}
```

### 3. Validaciones

**Frontend:**
- Campos requeridos
- Tipos de dato
- Formato de fechas

**Backend (esperado):**
- Validaciones adicionales
- Reglas de negocio
- Integridad referencial

---

## Dependencias

```json
{
  "dependencies": {
    "vue": "^3.x",           // Ya instalado
    "pinia": "^2.x",         // Ya instalado
    "element-plus": "^2.x",  // Ya instalado
    "axios": "^1.x"          // Ya instalado
  }
}
```

---

## Performance

### Optimizaciones Implementadas

✅ **Componentes Reutilizables:**
- Form se puede usar en multiple lugares
- Table se puede usar en multiple lugares

✅ **State Management:**
- Pinia para estado centralizado
- No props drilling innecesario

✅ **Computed Properties:**
- Filtrado reactivo (versión avanzada)
- Re-render solo cuando cambian dependencias

✅ **Lazy Loading:**
- Los datos se cargan solo cuando entra el usuario

### Mejoras Posibles

⏳ **Paginación:**
- Reduce elementos en DOM
- Mejora scroll performance

⏳ **Virtual Scrolling:**
- Para listas con miles de registros

⏳ **Caching:**
- Guardar datos en localStorage

---

## Testing (Si quieres agregar)

### Unit Tests (Vitest)
```javascript
// tests/services/servicePersonal.spec.js
describe('ServicePersonal Service', () => {
  it('should fetch all service personals', async () => {
    // Test
  })
})
```

### Component Tests (Vitest + Vue Test Utils)
```javascript
// tests/components/ServicePersonalForm.spec.js
describe('ServicePersonalForm', () => {
  it('should validate required fields', () => {
    // Test
  })
})
```

### E2E Tests (Cypress)
```javascript
// cypress/e2e/service-personals.cy.js
describe('Service Personals CRUD', () => {
  it('should create a new service', () => {
    // Test
  })
})
```

---

## Seguridad

### Implementado
✅ CSRF Protection (Sanctum)  
✅ Bearer Token Authentication  
✅ Route Protection (requiresAuth)  
✅ Input Validation (Frontend)  

### Recomendado Implementar
⚠️ Backend Validation  
⚠️ Authorization Policies  
⚠️ Rate Limiting  
⚠️ Audit Logging  

---

## Escalabilidad

El módulo está diseñado para:

✅ Agregar nuevos campos fácilmente  
✅ Cambiar la UI sin afectar lógica  
✅ Reutilizar componentes en otras vistas  
✅ Escalar a cientos de registros  

---

## Conclusión

La arquitectura es **modular**, **mantenible** y **escalable**.

Seguir patrones del proyecto asegura:
- Consistencia visual y funcional
- Facilidad de mantenimiento
- Reutilización de código
- Fácil integración con nuevas funciones

**¡Arquitectura lista para producción!** ✅

---

**Documento creado:** 5 de febrero de 2026
