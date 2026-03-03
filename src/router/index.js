

import { createRouter, createWebHistory, RouterView } from 'vue-router'
import DefaultLayout from '@/layout/DefaultLayout.vue'
import Dashboard from '@/views/Dashboard.vue'
import Categorias from '@/views/Categories.vue'
import TipoDocumentos from '@/views/DocumentTypes.vue'
import Medicamentos from '@/views/Medicines.vue'
import MedicinesEntity from '@/views/MedicinesEntity.vue'
import Entities from '@/views/Entities.vue'
import Inventario from '@/views/Inventory.vue'
import IngresosView from '@/views/Ingresos.vue'
import Proveedores from '@/views/Suppliers.vue'
import EgresosView from '@/views/Discharges.vue'
import SolicitudesView from '@/views/Solicitudes.vue'
import Recetas from '@/views/Receipts.vue'
import Login from '@/views/Login.vue'
import FormaFarmaceutica from '@/views/PharmaceuticalForms.vue'
import MedicationRequest from '@/views/MedicationRequest.vue'
import ReingresosRecetas from '@/views/Reentry.vue'
import EgresoRecetasView from '@/views/DischargeRecipes.vue'
import EgresosPorFechaView from '@/components/report/EgresosPorFecha.vue'
import IngresosPorFechaView from '@/components/report/IngresosPorFecha.vue'
import FisicoValoradoView from '@/components/report/InventarioResumen.vue'
import MedicamentoPorEspecialidadView from '@/components/report/EgresosPorEspecialidad.vue'
import EgresoPorTipoRecView from '@/components/report/EgresosPorTipoRec.vue'
import ReingresosRecetaView from '@/components/report/ReingresosRecetas.vue'
import kardexPorFechaView from '@/components/report/Kardex.vue'
import MedicamentosPorPacienteView from '@/components/report/MedicamentosPorPaciente.vue'
import ServicePersonalsView from '@/views/ServicePersonals.vue'
import Register from '@/views/Register.vue'
import Roles from '@/views/Roles.vue'
import Permissions from '@/views/Permissions.vue'
import Users from '@/views/Users.vue'

import { useUserStore } from '@/stores/userStore.js'
import { usePermission } from '@/composables/usePermission.js'

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true }, // Agrega meta para proteger rutas
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      {
        path: '/almacen',
        name: 'Almacen',
        component: RouterView, 
        children: [
          
        
          { path: 'inventario', name: 'Inventario', component: Inventario },
          
        ]
      },
  
      {
        path: '/ingresos',
        name: 'Ingresos',
        component: RouterView, 
        children: [
          { path: 'listado', name: 'listadoIngresos', component: IngresosView },
          
          { path: 'proveedores', name: 'Proveedores', component: Proveedores }
        ]
      },
      {
        path: '/egresos',
        name: 'Egresos',
        component: RouterView, 
        children: [
          { path: 'listado', name: 'listadoEgresos', component: EgresosView },
          
        ]
      },
      {
        path: '/solicitudes',
        name: 'Solicitudes',
        component: RouterView, 
        children: [
          { path: 'listado', name: 'listadoSolicitudes', component: SolicitudesView },
          
        ]
      },
      {
        path: '/recetas',
        name: 'Recetas',
        component: RouterView, // Cambiado para usar RouterView directamente
        children: [
          { path: 'listado', name: 'RecetasEgresos', component:EgresoRecetasView},
          { path: 'dispensar', name: 'Dispensar', component: Recetas },
          { path: 'reingresos', name: 'ReingresosRecetas', component: ReingresosRecetas },
          /*{ path: 'solicitudes', name: 'Solicitudes', component:MedicationRequest}, // POR RAKSO POR DUPLICIDAD*/
          
        ]
      },
      {
        path: '/reportes',
        name: 'Reportes',
        component: RouterView, // Cambiado para usar RouterView directamente
        children: [
          {
            path: 'egresos',
            name: 'ReportesEgresos',
            component: RouterView,   //Necesario para anidar más niveles
            children: [
              { path: 'generalEgresos', name: 'EgresosPorFecha', component:EgresosPorFechaView}, 
              { path: 'fisicoValorado', name: 'FisicoValorado', component:FisicoValoradoView}
        ]

          },        
          
          { path: 'ingresos', name: 'IngresosPorFecha', component:IngresosPorFechaView},
          { path: 'kardex', name: 'kardexPorFecha', component:kardexPorFechaView},
          
          {
            path: 'recetas',
            name: 'ReportesResetas',
            component: RouterView,   //Necesario para anidar más niveles
            children: [
              { path: 'medicamentoEspecialidad', name: 'MedicamentoPorEspecialidad', component:MedicamentoPorEspecialidadView }, 
              { path: 'medicamentosPorPaciente', name: 'MedicamentosPorPaciente', component:MedicamentosPorPacienteView},
              { path: 'tipoReceta', name: 'TipoReceta', component:EgresoPorTipoRecView},
              { path: 'reingresosReceta', name: 'ReingresosReceta', component:ReingresosRecetaView}
              
            
            ]

          },  
          
          
        ]
      },
      {
        path: '/usuariosSystem',
        name: 'UsuariosSystem',
        component: RouterView, // Cambiado para usar RouterView directamente
        children: [
          { path: 'usuarios', name: 'Usuarios', component: Users, meta: { requiredPermission: 'manage_users' } },
          { path: 'roles', name: 'Roles', component: Roles, meta: { requiredPermission: 'manage_roles' } },
          { path: 'permisos', name: 'Permisos', component: Permissions, meta: { requiredPermission: 'manage_permissions' } },
        ]
      },
      {
        path: '/mantenimiento',
        name: 'Mantenimiento',
        component: RouterView, // Cambiado para usar RouterView directamente
        children: [
          
          { path: 'categorias', name: 'Categorias', component: Categorias },
          { path: 'tipodocumentos', name: 'TipoDocumentos', component: TipoDocumentos },
          { path: 'medicamentos', name: 'Medicamentos', component: Medicamentos },
          { path: 'formafarmaceutica', name: 'FormaFarmaceutica', component: FormaFarmaceutica },
          { path: 'servicios-personal', name: 'ServiciosPersonal', component: ServicePersonalsView },
          { path: 'entidades', name: 'Entidades', component: Entities, meta: { requiredPermission: 'manage_entities' } },
          { path: 'variables-configuracion', name: 'VariablesConfiguracion', component: () => import('@/views/VariablesConfiguracion.vue') },
        ]
      },
  
      
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const { hasPermission, hasRole } = usePermission()

  if (to.meta.requiresAuth && !userStore.token) {
    next('/login')
    return
  }

  if (to.meta.requiredPermission) {
    if (!hasPermission(to.meta.requiredPermission)) {
      next('/')
      return
    }
  }

  if (to.meta.requiredRole) {
    if (!hasRole(to.meta.requiredRole)) {
      next('/')
      return
    }
  }

  next()
})


export default router
