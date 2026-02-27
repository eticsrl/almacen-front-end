# 🎯 INTEGRACIÓN CON EL MENÚ - Service Personals

## Ubicación Actual en el Menú

El módulo **Service Personals** ya está integrado en:

```
MENÚ PRINCIPAL
    └── Mantenimiento
            └── Servicios del Personal ← AQUÍ ESTÁ
```

**URL:** `/mantenimiento/servicios-personal`

---

## Si Quieres Cambiar la Ubicación del Menú

### Opción 1: Moverlo a otra sección

Si prefieres que esté en otra sección, edita el router:

```javascript
// src/router/index.js

// Cambiar DE:
{
  path: '/mantenimiento',
  name: 'Mantenimiento',
  children: [
    { path: 'servicios-personal', name: 'ServiciosPersonal', component: ServicePersonalsView }
  ]
}

// A:
{
  path: '/recursos-humanos',  // Nueva sección
  name: 'RecursosHumanos',
  component: RouterView,
  children: [
    { path: 'servicios-personal', name: 'ServiciosPersonal', component: ServicePersonalsView }
  ]
}
```

### Opción 2: Cambiar el nombre en el menú

```javascript
// En router/index.js, cambia el nombre:
{ path: 'servicios-personal', name: 'Servicios del Personal', component: ServicePersonalsView }
```

---

## Actualizando el Componente Navbar (si existe)

Si tienes un componente de navegación que lista los menús, puede que necesites agregarlo manualmente:

```vue
<!-- En Navbar.vue o similar -->

<el-menu-item 
  index="/mantenimiento/servicios-personal"
  @click="goTo('/mantenimiento/servicios-personal')"
>
  <span>Servicios del Personal</span>
</el-menu-item>
```

---

## Verificación de Rutas

Para verificar que la ruta esté correctamente registrada:

```javascript
// En la consola del navegador (F12)
import router from '@/router'
console.log(router.getRoutes())

// Debes ver una ruta similar a:
{
  path: '/mantenimiento/servicios-personal',
  name: 'ServiciosPersonal',
  component: ServicePersonalsView
}
```

---

## Acceso Directo por URL

Incluso sin menú, puedes acceder escribiendo directamente en la barra:

```
http://localhost:5173/mantenimiento/servicios-personal
```

---

## Si Quieres Agregar un Ícono al Menú

```vue
<el-menu-item index="/mantenimiento/servicios-personal">
  <i class="el-icon-service"></i>
  <span>Servicios del Personal</span>
</el-menu-item>
```

### Iconos Sugeridos:
- `el-icon-service` - Servicios
- `el-icon-document` - Documentos
- `el-icon-user` - Usuario
- `el-icon-office-building` - Edificio/Organización

---

## Permiso para Acceder (Opcional)

Si implementas permisos, puedes restringir el acceso:

```javascript
// En router/index.js
{
  path: '/mantenimiento/servicios-personal',
  name: 'ServiciosPersonal',
  component: ServicePersonalsView,
  meta: { 
    requiresAuth: true,
    requiredPermission: 'view-service-personals'  // Permiso opcional
  }
}
```

---

## Breadcrumb (Ruta de Navegación)

Si tienes componente Breadcrumb, auto-se actualizará basado en las rutas del router.

Para personalizarlo, puedes agregar labels:

```javascript
{
  path: '/mantenimiento/servicios-personal',
  name: 'ServiciosPersonal',
  component: ServicePersonalsView,
  meta: {
    breadcrumbLabel: 'Servicios del Personal',
    breadcrumbParent: 'Mantenimiento'
  }
}
```

---

## Verificación Final

✅ **La ruta está registrada:**
```
/mantenimiento/servicios-personal → ServicePersonals.vue
```

✅ **Acceso:**
- Por URL: `http://localhost:5173/mantenimiento/servicios-personal`
- Por menú: Mantenimiento > Servicios del Personal

✅ **Autenticación:**
- Heredada del proyecto (requiresAuth: true)
- Token enviado automáticamente

---

## Resumen de lo que Cambiar (si es necesario)

| Si quieres... | Dónde cambiar |
|--------------|---------------|
| Cambiar ubicación en menú | router/index.js (cambiar path) |
| Cambiar nombre | router/index.js (cambiar name) |
| Cambiar componente | router/index.js (cambiar component) |
| Cambiar ícono | Navbar.vue o componente de menú |
| Cambiar URL | router/index.js (cambiar path) |

---

## Conclusión

La ruta ya está integrada y funcional. Solo necesitas:

1. ✅ Verificar que funciona: http://localhost:5173/mantenimiento/servicios-personal
2. ✅ Confirmar que aparece en el menú (si existe)
3. ✅ Hacer cambios si lo necesitas

¡Listo! 🚀

---

**Fecha:** 5 de febrero de 2026
