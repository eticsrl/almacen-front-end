# DOCUMENTACIÓN COMPLETA - PROYECTO FARMACIA POTOSÍ

**Fecha:** 10 de febrero de 2026  
**Proyecto:** myfarmacy - Sistema de Gestión de Farmacia  
**Versión:** 0.0.0  
**Framework:** Vue 3 + Vite + Pinia

---

## TABLA DE CONTENIDOS

1. [Cómo Comienza el Proyecto](#cómo-comienza-el-proyecto)
2. [Estructura Completa de Carpetas](#estructura-completa-de-carpetas)
3. [Archivos Principales y Sus Funciones](#archivos-principales-y-sus-funciones)
4. [Flujo de Ejecución](#flujo-de-ejecución)
5. [Tecnologías Utilizadas](#tecnologías-utilizadas)
6. [Comandos para Desarrollo](#comandos-para-desarrollo)
7. [Cómo Agregar un Módulo Nuevo](#cómo-agregar-un-módulo-nuevo)
8. [Rutas Disponibles en el Sistema](#rutas-disponibles-en-el-sistema)

---

## CÓMO COMIENZA EL PROYECTO

### Paso 1: El Navegador Carga `index.html`
**Ubicación:** `/var/www/html/farmacia-sl-front-end-potosi/index.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <div id="app"></div>  <!-- Aquí se monta toda la app -->
  </head>
  <body>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### Paso 2: Se Ejecuta `main.js`
**Ubicación:** `/var/www/html/farmacia-sl-front-end-potosi/src/main.js`

Este archivo:
- Importa Vue 3
- Importa el componente App.vue
- Configura Router para navegación
- Configura Pinia para estado global
- Configura Element Plus para componentes UI
- Monta la aplicación en el div #app

### Paso 3: App.vue Muestra el Contenido
**Ubicación:** `/var/www/html/farmacia-sl-front-end-potosi/src/App.vue`

Contiene `<router-view />` que muestra la página según la ruta actual.

---

## ESTRUCTURA COMPLETA DE CARPETAS

```
/var/www/html/farmacia-sl-front-end-potosi/
│
├── 📄 index.html                               ← Archivo HTML principal
├── 📄 package.json                             ← Dependencias y scripts
├── 📄 vite.config.js                           ← Configuración de Vite
├── 📄 jsconfig.json                            ← Configuración de JavaScript
│
├── 📁 public/
│   └── 📁 imagenes/                            ← Imágenes estáticas
│
└── 📁 src/                                     ← CARPETA PRINCIPAL DEL CÓDIGO
    │
    ├── 📄 main.js                              ← PUNTO DE ENTRADA
    ├── 📄 App.vue                              ← COMPONENTE RAÍZ
    │
    ├── 📁 router/
    │   └── 📄 index.js                         ← Definición de todas las rutas
    │
    ├── 📁 views/                               ← Páginas principales
    │   ├── 📄 Dashboard.vue
    │   ├── 📄 Login.vue
    │   ├── 📄 Categories.vue
    │   ├── 📄 DocumentTypes.vue
    │   ├── 📄 Medicines.vue
    │   ├── 📄 MedicinesEntity.vue
    │   ├── 📄 Inventory.vue
    │   ├── 📄 Ingresos.vue
    │   ├── 📄 Discharges.vue
    │   ├── 📄 Suppliers.vue
    │   ├── 📄 Solicitudes.vue
    │   ├── 📄 Receipts.vue
    │   ├── 📄 PharmaceuticalForms.vue
    │   ├── 📄 MedicationRequest.vue
    │   ├── 📄 Reentry.vue
    │   ├── 📄 DischargeRecipes.vue
    │   └── 📄 ServicePersonals.vue
    │
    ├── 📁 components/                          ← Componentes reutilizables
    │   ├── 📄 Navbar.vue                       ← Barra de navegación
    │   ├── 📄 Sidebar.vue                      ← Menú lateral
    │   ├── 📄 Hamburger.vue                    ← Menú hamburguesa
    │   ├── 📄 BackendStatusIndicator.vue       ← Indicador de estado del backend
    │   ├── 📄 Breadcrumb.vue                   ← Migas de pan
    │   ├── 📄 PatientCard.vue                  ← Tarjeta de paciente
    │   ├── 📄 TagsView.vue
    │   │
    │   ├── Formularios:
    │   ├── 📄 EntryForm.vue                    ← Formulario de ingresos
    │   ├── 📄 DischargeForm.vue                ← Formulario de egresos
    │   ├── 📄 RecetaForm.vue                   ← Formulario de recetas
    │   ├── 📄 SolicitudForm.vue                ← Formulario de solicitudes
    │   ├── 📄 ServicePersonalForm.vue          ← Formulario de personal
    │   │
    │   ├── Tablas de Detalle:
    │   ├── 📄 EntryDetailTable.vue             ← Tabla de detalles de ingresos
    │   ├── 📄 DischargeDetailTable.vue         ← Tabla de detalles de egresos
    │   ├── 📄 RecetaDetailTable.vue            ← Tabla de detalles de recetas
    │   ├── 📄 SolicitudDetailTable.vue         ← Tabla de detalles de solicitudes
    │   ├── 📄 ServicePersonalDetailTable.vue   ← Tabla de detalles de personal
    │   │
    │   ├── Otros:
    │   ├── 📄 DescargoReceta.vue
    │   ├── 📄 EgresoRecetaDetailTable.vue
    │   ├── 📄 EgresoRecetaForm.vue
    │   ├── 📄 ReingresoReceta.vue
    │   │
    │   └── 📁 report/                          ← Componentes de reportes
    │       ├── 📄 EgresosPorFecha.vue
    │       ├── 📄 IngresosPorFecha.vue
    │       ├── 📄 InventarioResumen.vue
    │       ├── 📄 EgresosPorEspecialidad.vue
    │       ├── 📄 EgresosPorTipoRec.vue
    │       ├── 📄 ReingresosRecetas.vue
    │       ├── 📄 Kardex.vue
    │       └── 📄 MedicamentosPorPaciente.vue
    │
    ├── 📁 layout/
    │   └── 📄 DefaultLayout.vue                ← Template con Navbar + Sidebar
    │
    ├── 📁 services/                            ← Llamadas al API/Backend
    │   ├── 📄 api.js                           ← Configuración de Axios
    │   ├── 📄 main.js                          ← Servicios principales
    │   ├── 📄 category.js                      ← Servicio de categorías
    │   ├── 📄 documentType.js                  ← Servicio de tipos de documento
    │   ├── 📄 entity.js                        ← Servicio de entidades
    │   ├── 📄 medicine.js                      ← Servicio de medicinas
    │   ├── 📄 medicineEntity.js                ← Servicio de medicina-entidad
    │   ├── 📄 entry.js                         ← Servicio de ingresos
    │   ├── 📄 discharge.js                     ← Servicio de egresos
    │   ├── 📄 supplier.js                      ← Servicio de proveedores
    │   ├── 📄 solicitud.js                     ← Servicio de solicitudes
    │   ├── 📄 personalService.js               ← Servicio de personal
    │   ├── 📄 user.js                          ← Servicio de usuarios
    │   ├── 📄 healthCheck.js                   ← Verificación de salud del backend
    │   │
    │   ├── Reportes:
    │   ├── 📄 entryReports.js
    │   ├── 📄 dischargeReports.js
    │   ├── 📄 kardexReports.js
    │   ├── 📄 inventoryReport.js
    │   ├── 📄 patientRxReport.js
    │   ├── 📄 reentryReports.js
    │   ├── 📄 dischargeSpecialtyReport.js
    │   │
    │   └── 📁 afiliacion/                      ← Servicios de afiliación
    │   └── 📁 sissu/                           ← Servicios SISSU
    │
    ├── 📁 stores/                              ← Estado global (Pinia)
    │   ├── 📄 index.js                         ← Importa todos los stores
    │   ├── 📄 userStore.js                     ← Store de usuarios
    │   ├── 📄 categoryStore.js                 ← Store de categorías
    │   ├── 📄 documentTypeStore.js             ← Store de tipos de documento
    │   ├── 📄 entityStore.js                   ← Store de entidades
    │   ├── 📄 medicineStore.js                 ← Store de medicinas
    │   ├── 📄 medicineEntityStore.js           ← Store de medicina-entidad
    │   ├── 📄 entryStore.js                    ← Store de ingresos
    │   ├── 📄 dischargeStore.js                ← Store de egresos
    │   ├── 📄 supplierStore.js                 ← Store de proveedores
    │   ├── 📄 solicitudStore.js                ← Store de solicitudes
    │   ├── 📄 personalStore.js                 ← Store de personal
    │   ├── 📄 pharmaceuticalFormStore.js       ← Store de formas farmacéuticas
    │   ├── 📄 backendStatusStore.js            ← Store de estado del backend
    │   │
    │   ├── Reportes:
    │   ├── 📄 entryReportStore.js
    │   ├── 📄 dischargeReportStore.js
    │   ├── 📄 kardexReportsStore.js
    │   ├── 📄 inventoryReportStore.js
    │   ├── 📄 patientRxReportStore.js
    │   ├── 📄 reentryReportsStore.js
    │   ├── 📄 dischargeSpecialtyReportStore.js
    │   │
    │   └── 📁 afiliacion/
    │   └── 📁 sissu/
    │
    ├── 📁 styles/
    │   ├── 📄 index.scss                       ← Estilos principales (importa todos)
    │   ├── 📄 variables.scss                   ← Variables globales
    │   ├── 📄 normalize.scss
    │   ├── 📄 table.scss
    │   ├── 📄 form.scss
    │   └── ... (otros archivos de estilos)
    │
    ├── 📁 assets/
    │   ├── 📁 imagenes/                        ← Imágenes de la app
    │   └── 📁 404_images/                      ← Imágenes de error 404
    │
    └── 📁 api/
        └── 📄 medicineEntity.js                ← API para medicina-entidad

```

---

## ARCHIVOS PRINCIPALES Y SUS FUNCIONES

### 1. Configuración General

| Archivo | Ubicación | Función |
|---------|-----------|---------|
| **package.json** | `/var/www/html/farmacia-sl-front-end-potosi/package.json` | Define dependencias y scripts |
| **vite.config.js** | `/var/www/html/farmacia-sl-front-end-potosi/vite.config.js` | Configuración del empaquetador Vite |
| **jsconfig.json** | `/var/www/html/farmacia-sl-front-end-potosi/jsconfig.json` | Configuración de JavaScript (rutas con @) |
| **index.html** | `/var/www/html/farmacia-sl-front-end-potosi/index.html` | Página HTML principal |

### 2. Punto de Entrada de la Aplicación

| Archivo | Ubicación | Función |
|---------|-----------|---------|
| **main.js** | `/var/www/html/farmacia-sl-front-end-potosi/src/main.js` | Inicializa Vue, Router, Pinia, Element Plus |
| **App.vue** | `/var/www/html/farmacia-sl-front-end-potosi/src/App.vue` | Componente raíz que contiene `<router-view />` |

### 3. Enrutamiento

| Archivo | Ubicación | Función |
|---------|-----------|---------|
| **router/index.js** | `/var/www/html/farmacia-sl-front-end-potosi/src/router/index.js` | Define todas las rutas del sistema |

### 4. Disposición/Layout

| Archivo | Ubicación | Función |
|---------|-----------|---------|
| **DefaultLayout.vue** | `/var/www/html/farmacia-sl-front-end-potosi/src/layout/DefaultLayout.vue` | Template con Navbar, Sidebar y contenido |

### 5. Componentes de Navegación

| Archivo | Ubicación | Función |
|---------|-----------|---------|
| **Navbar.vue** | `/var/www/html/farmacia-sl-front-end-potosi/src/components/Navbar.vue` | Barra de navegación superior |
| **Sidebar.vue** | `/var/www/html/farmacia-sl-front-end-potosi/src/components/Sidebar.vue` | Menú lateral |
| **Hamburger.vue** | `/var/www/html/farmacia-sl-front-end-potosi/src/components/Hamburger.vue` | Menú hamburguesa responsive |

### 6. Servicios API (Conexión con Backend)

| Archivo | Ubicación | Función |
|---------|-----------|---------|
| **api.js** | `/var/www/html/farmacia-sl-front-end-potosi/src/services/api.js` | Configuración de Axios |
| **medicine.js** | `/var/www/html/farmacia-sl-front-end-potosi/src/services/medicine.js` | CRUD de medicinas |
| **entry.js** | `/var/www/html/farmacia-sl-front-end-potosi/src/services/entry.js` | CRUD de ingresos |
| **discharge.js** | `/var/www/html/farmacia-sl-front-end-potosi/src/services/discharge.js` | CRUD de egresos |
| **supplier.js** | `/var/www/html/farmacia-sl-front-end-potosi/src/services/supplier.js` | CRUD de proveedores |
| **user.js** | `/var/www/html/farmacia-sl-front-end-potosi/src/services/user.js` | Autenticación y usuarios |

### 7. Estado Global (Pinia Stores)

| Archivo | Ubicación | Función |
|---------|-----------|---------|
| **userStore.js** | `/var/www/html/farmacia-sl-front-end-potosi/src/stores/userStore.js` | Estado del usuario autenticado |
| **medicineStore.js** | `/var/www/html/farmacia-sl-front-end-potosi/src/stores/medicineStore.js` | Estado de medicinas |
| **entryStore.js** | `/var/www/html/farmacia-sl-front-end-potosi/src/stores/entryStore.js` | Estado de ingresos |
| **dischargeStore.js** | `/var/www/html/farmacia-sl-front-end-potosi/src/stores/dischargeStore.js` | Estado de egresos |

### 8. Estilos

| Archivo | Ubicación | Función |
|---------|-----------|---------|
| **index.scss** | `/var/www/html/farmacia-sl-front-end-potosi/src/styles/index.scss` | Importa todos los estilos |
| **variables.scss** | `/var/www/html/farmacia-sl-front-end-potosi/src/styles/variables.scss` | Variables globales (colores, fuentes) |

---

## FLUJO DE EJECUCIÓN

```
1. INICIO EN NAVEGADOR
   └─> index.html carga
   └─> Ejecuta <script src="/src/main.js"></script>

2. EJECUCIÓN DE main.js
   └─> import createApp from 'vue'
   └─> import App from './App.vue'
   └─> import router from './router'
   └─> import store from './stores'
   └─> createApp(App)
       └─> app.use(store)          ← Activa Pinia
       └─> app.use(router)         ← Activa Vue Router
       └─> app.use(ElementPlus)    ← Activa Element Plus
   └─> app.mount('#app')           ← Monta en index.html

3. APP.VUE RENDERIZA
   └─> <router-view />             ← Muestra componente según ruta

4. ROUTER EVALÚA LA RUTA
   └─> "/" → Dashboard
   └─> "/ingresos/listado" → Ingresos
   └─> "/egresos/listado" → Egresos
   └─> etc.

5. COMPONENTE RENDERIZA
   └─> Muestra DefaultLayout (Navbar + Sidebar)
   └─> Mostrar contenido de la vista

6. INTERACCIÓN CON BACKEND
   └─> Componente llama servicio (ej: medicine.js)
   └─> Servicio usa Axios para API
   └─> Respuesta se guarda en Store (Pinia)
   └─> Componente obtiene datos del Store
   └─> Interfaz se actualiza
```

---

## TECNOLOGÍAS UTILIZADAS

### Framework Principal
- **Vue 3** - Framework JavaScript reactivo
- **Vite** - Herramienta de build ultra rápida

### Enrutamiento
- **Vue Router 4** - Navegación entre páginas

### Gestión de Estado
- **Pinia** - Store global para datos compartidos
- **pinia-plugin-persistedstate** - Persiste estado en localStorage

### Componentes UI
- **Element Plus** - Librería de componentes (tablas, formularios, botones, etc.)
- **@element-plus/icons-vue** - Iconos de Element Plus

### HTTP/API
- **Axios** - Cliente HTTP para llamadas al backend

### Utilidades
- **dayjs** - Manejo de fechas
- **sweetalert2** - Alertas modernas
- **pdfmake** - Generación de PDFs
- **vuejs-paginate-next** - Paginación

### Estilos
- **SCSS** - Preprocesador de CSS

### Build
- **@vitejs/plugin-vue** - Plugin Vue para Vite
- **sass** - Compilador SCSS

---

## COMANDOS PARA DESARROLLO

### Instalación
```bash
cd /var/www/html/farmacia-sl-front-end-potosi
npm install
```

### Desarrollo Local
```bash
npm run dev
```
Inicia servidor en `http://localhost:5173`

### Build para Producción
```bash
npm run build
```
Genera archivos optimizados en carpeta `dist/`

### Preview de Build
```bash
npm run preview
```
Muestra vista previa del build de producción

---

## CÓMO AGREGAR UN MÓDULO NUEVO

### Ejemplo: Agregar módulo "Pacientes"

#### Paso 1: Crear el Servicio
**Archivo:** `/var/www/html/farmacia-sl-front-end-potosi/src/services/patient.js`

```javascript
import { api } from './api.js'

export const patientService = {
  getAll: async () => {
    const { data } = await api.get('/patients')
    return data
  },
  
  getById: async (id) => {
    const { data } = await api.get(`/patients/${id}`)
    return data
  },
  
  create: async (patientData) => {
    const { data } = await api.post('/patients', patientData)
    return data
  },
  
  update: async (id, patientData) => {
    const { data } = await api.put(`/patients/${id}`, patientData)
    return data
  },
  
  delete: async (id) => {
    const { data } = await api.delete(`/patients/${id}`)
    return data
  }
}
```

#### Paso 2: Crear el Store
**Archivo:** `/var/www/html/farmacia-sl-front-end-potosi/src/stores/patientStore.js`

```javascript
import { defineStore } from 'pinia'
import { patientService } from '@/services/patient.js'

export const usePatientStore = defineStore('patient', {
  state: () => ({
    patients: [],
    currentPatient: null,
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchPatients() {
      this.loading = true
      try {
        this.patients = await patientService.getAll()
        this.error = null
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    async createPatient(patientData) {
      this.loading = true
      try {
        const newPatient = await patientService.create(patientData)
        this.patients.push(newPatient)
        this.error = null
        return newPatient
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    }
  }
})
```

#### Paso 3: Registrar Store en Index
**Archivo:** `/var/www/html/farmacia-sl-front-end-potosi/src/stores/index.js`

Agregar importación:
```javascript
export { usePatientStore } from './patientStore'
```

#### Paso 4: Crear Vista
**Archivo:** `/var/www/html/farmacia-sl-front-end-potosi/src/views/Patients.vue`

```vue
<template>
  <div class="patients-container">
    <h1>Gestión de Pacientes</h1>
    <!-- Contenido aquí -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePatientStore } from '@/stores/patientStore'

const patientStore = usePatientStore()

onMounted(() => {
  patientStore.fetchPatients()
})
</script>

<style scoped>
.patients-container {
  padding: 20px;
}
</style>
```

#### Paso 5: Agregar Ruta
**Archivo:** `/var/www/html/farmacia-sl-front-end-potosi/src/router/index.js`

En el array de rutas, agregar:
```javascript
{
  path: '/pacientes',
  name: 'Pacientes',
  component: RouterView,
  children: [
    { path: 'listado', name: 'listadoPacientes', component: Patients }
  ]
}
```

#### Paso 6: Agregar en Sidebar (Opcional)
**Archivo:** `/var/www/html/farmacia-sl-front-end-potosi/src/components/Sidebar.vue`

Agregar opción en menú para navegar a la nueva página.

---

## RUTAS DISPONIBLES EN EL SISTEMA

### Autenticación
- `/login` - Página de login

### Inicio
- `/` - Dashboard (página principal)

### Almacén
- `/almacen/inventario` - Ver inventario

### Ingresos (Compras)
- `/ingresos/listado` - Listado de ingresos
- `/ingresos/proveedores` - Gestión de proveedores

### Egresos (Salidas)
- `/egresos/listado` - Listado de egresos

### Recetas
- `/recetas/listado` - Listado de recetas de egreso
- `/recetas/dispensar` - Dispensar medicinas
- `/recetas/reingresos` - Reingresos de recetas

### Solicitudes
- `/solicitudes/listado` - Listado de solicitudes

### Configuración
- `/configuracion/categorias` - Categorías de medicinas
- `/configuracion/tipos-documento` - Tipos de documento
- `/configuracion/medicamentos` - Gestión de medicamentos
- `/configuracion/formas-farmaceuticas` - Formas farmacéuticas
- `/configuracion/personal-servicio` - Personal de servicio

### Reportes
- `/reportes/egresos` - Reportes de egresos
- `/reportes/ingresos` - Reportes de ingresos
- `/reportes/kardex` - Kardex
- `/reportes/inventario` - Resumen de inventario
- `/reportes/medicamentos-paciente` - Medicamentos por paciente
- `/reportes/especialidad` - Egresos por especialidad

---

## INFORMACIÓN ADICIONAL

### Base de Datos Disponible
- **Backup:** `/var/www/html/farmacia-sl-front-end-potosi/backup_20260206.sql`

### Documentación Complementaria
- **Arquitectura:** `/var/www/html/farmacia-sl-front-end-potosi/ARCHITECTURE.md`
- **Ejemplos de Customización:** `/var/www/html/farmacia-sl-front-end-potosi/CUSTOMIZATION_EXAMPLES.js`
- **Integración de Menú:** `/var/www/html/farmacia-sl-front-end-potosi/MENU_INTEGRATION.md`
- **Inicio Rápido:** `/var/www/html/farmacia-sl-front-end-potosi/START_HERE.md`
- **Verificación:** `/var/www/html/farmacia-sl-front-end-potosi/VERIFICATION_CHECKLIST.md`

### Estructura de Proyecto
```
Carpeta raíz: /var/www/html/farmacia-sl-front-end-potosi/
Código fuente: /var/www/html/farmacia-sl-front-end-potosi/src/
Configuración: /var/www/html/farmacia-sl-front-end-potosi/
Público: /var/www/html/farmacia-sl-front-end-potosi/public/
```

---

## NOTAS IMPORTANTES PARA SOPORTE

1. **Verificar Backend:** El servicio `healthCheck.js` verifica la disponibilidad del backend
2. **Persistencia de Datos:** Los datos del usuario se guardan en localStorage mediante `pinia-plugin-persistedstate`
3. **Autenticación:** Se requiere token JWT en `localStorage` bajo la clave `token`
4. **CORS:** Asegurar que el backend permite CORS desde `localhost:5173` (desarrollo)
5. **Variables de Entorno:** Crear `.env` si es necesario para cambiar URL del API

---

**Documento generado:** 10 de febrero de 2026  
**Proyecto:** myfarmacy - Sistema de Gestión de Farmacia  
**Versión:** 0.0.0
