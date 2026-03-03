# Sistema de Roles y Permisos

Este documento describe cómo usar el sistema de roles y permisos en la aplicación.

## Arquitectura

### Servicios
- **`src/services/role.js`** - API para gestionar roles
- **`src/services/permission.js`** - API para gestionar permisos

### Stores (Pinia)
- **`src/stores/roleStore.js`** - Estado global de roles
- **`src/stores/permissionStore.js`** - Estado global de permisos

### Composables
- **`src/composables/usePermission.js`** - Lógica para verificar permisos y roles

### Vistas
- **`src/views/Roles.vue`** - CRUD de roles
- **`src/views/Permissions.vue`** - CRUD de permisos

## Cómo usar

### 1. Verificar permisos en componentes

```vue
<script setup>
import { usePermission } from '@/composables/usePermission.js'

const { hasPermission, hasRole, isAdmin } = usePermission()
</script>

<template>
  <!-- Mostrar solo si el usuario tiene permiso -->
  <div v-if="hasPermission('view_users')">
    <p>Usuarios visibles</p>
  </div>

  <!-- Mostrar solo si el usuario tiene rol -->
  <div v-if="hasRole('admin')">
    <p>Panel de administrador</p>
  </div>

  <!-- Mostrar si es admin -->
  <div v-if="isAdmin">
    <p>Eres administrador</p>
  </div>

  <!-- Verificar múltiples permisos (al menos uno) -->
  <button v-if="hasPermission(['delete_users', 'edit_users'])">
    Modificar usuarios
  </button>
</template>
```

### 2. Verificar permisos en rutas

Actualiza `src/router/index.js`:

```javascript
const routes = [
  {
    path: '/admin',
    component: DefaultLayout,
    meta: { 
      requiresAuth: true,
      requiredPermission: 'access_admin_panel'
    },
    children: [
      // rutas del admin
    ]
  }
]

// En beforeEach:
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.token) {
    next('/login')
    return
  }

  if (to.meta.requiredPermission) {
    const { hasPermission } = usePermission()
    if (!hasPermission(to.meta.requiredPermission)) {
      next('/') // O una página de "no autorizado"
      return
    }
  }

  next()
})
```

### 3. Gestionar roles en la aplicación

Ve a `/mantenimiento/roles` para:
- ✏️ Crear nuevos roles
- 📝 Editar roles existentes
- 🔑 Asignar permisos a roles
- 🗑️ Eliminar roles

### 4. Gestionar permisos en la aplicación

Ve a `/mantenimiento/permisos` para:
- ✏️ Crear nuevos permisos
- 📝 Editar permisos existentes
- 🗑️ Eliminar permisos

## Endpoints esperados del backend (Laravel)

```
GET    /api/roles                    - Obtener todos los roles
GET    /api/roles/{id}               - Obtener un rol específico
POST   /api/roles                    - Crear nuevo rol
PUT    /api/roles/{id}               - Actualizar rol
DELETE /api/roles/{id}               - Eliminar rol
GET    /api/roles/{id}/permissions   - Obtener permisos de un rol
POST   /api/roles/{id}/permissions   - Asignar permisos a un rol

GET    /api/permissions              - Obtener todos los permisos
GET    /api/permissions/{id}         - Obtener un permiso específico
POST   /api/permissions              - Crear nuevo permiso
PUT    /api/permissions/{id}         - Actualizar permiso
DELETE /api/permissions/{id}         - Eliminar permiso
```

## Estructura de datos esperada

### Usuario (después de login/registro)

```javascript
user: {
  id: 1,
  name: 'Juan Pérez',
  email: 'juan@example.com',
  roles: [
    { id: 1, name: 'admin' },
    { id: 2, name: 'pharmacist' }
  ],
  permissions: [
    { id: 1, name: 'view_medicines' },
    { id: 2, name: 'create_medicines' },
    { id: 3, name: 'edit_medicines' }
  ]
}
```

### Rol

```javascript
{
  id: 1,
  name: 'admin',
  description: 'Administrador del sistema',
  permissions: [
    { id: 1, name: 'view_medicines' },
    { id: 2, name: 'create_medicines' },
    // ...
  ]
}
```

### Permiso

```javascript
{
  id: 1,
  name: 'view_medicines',
  description: 'Ver listado de medicamentos'
}
```

## Ejemplos avanzados

### Ocultar/mostrar menú según permisos

```vue
<script setup>
import { usePermission } from '@/composables/usePermission.js'

const { hasPermission } = usePermission()

const menuItems = [
  {
    label: 'Medicamentos',
    permission: 'view_medicines'
  },
  {
    label: 'Usuarios',
    permission: 'view_users'
  },
  {
    label: 'Configuración',
    permission: 'access_settings'
  }
]

const visibleMenuItems = menuItems.filter(item => 
  hasPermission(item.permission)
)
</script>

<template>
  <nav>
    <a v-for="item in visibleMenuItems" :key="item.label">
      {{ item.label }}
    </a>
  </nav>
</template>
```

### Proteger acciones en formularios

```vue
<script setup>
import { usePermission } from '@/composables/usePermission.js'

const { hasPermission } = usePermission()
</script>

<template>
  <form>
    <input type="text" placeholder="Nombre" />
    
    <!-- Solo mostrar botón guardar si tiene permiso -->
    <button 
      v-if="hasPermission('create_medicines')"
      type="submit"
    >
      Guardar Medicamento
    </button>

    <!-- Botón deshabilitado sin permiso -->
    <button 
      v-else
      type="button"
      disabled
      :title="!hasPermission('create_medicines') ? 'No tienes permiso' : ''"
    >
      No tienes permiso
    </button>
  </form>
</template>
```

## Notas importantes

1. Los permisos y roles se cargan cuando el usuario inicia sesión
2. Se almacenan en localStorage para optimizar rendimiento
3. Es recomendable revalidar permisos con el backend cada cierto tiempo
4. Los permisos se consideran "por defecto denegados" (deny-by-default)
5. El backend debe validar permisos en todas las operaciones CRUD
