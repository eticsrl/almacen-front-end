// ============================================
// EJEMPLOS DE CUSTOMIZACIÓN - Service Personals
// ============================================

// ============================================
// 1. AGREGAR NUEVO CAMPO A LA TABLA
// ============================================

/*
Para agregar un nuevo campo, por ejemplo 'estado' (activo/inactivo):

A) Actualizar la BD:
   ALTER TABLE service_personals ADD COLUMN estado VARCHAR(20) DEFAULT 'activo';

B) Actualizar ServicePersonalForm.vue:
   En el template:
   <el-form-item label="Estado" prop="estado">
     <el-select v-model="form.estado">
       <el-option label="Activo" value="activo" />
       <el-option label="Inactivo" value="inactivo" />
     </el-select>
   </el-form-item>

   En las validaciones:
   const rules = {
     ...
     estado: [
       { required: true, message: 'Estado es requerido', trigger: 'change' }
     ]
   }

C) Actualizar ServicePersonalDetailTable.vue:
   <el-table-column prop="estado" label="Estado" width="100">
     <template #default="{ row }">
       <el-tag :type="row.estado === 'activo' ? 'success' : 'danger'">
         {{ row.estado }}
       </el-tag>
     </template>
   </el-table-column>

D) Actualizar ServicePersonals.vue form inicial:
   const form = reactive({
     personal_id: '',
     descripcion: '',
     fecha_inicio: null,
     fecha_fin: null,
     estado: 'activo'  // <-- Agregar
   })
*/

// ============================================
// 2. RELACIÓN CON TABLA PERSONAL (mostrar nombre)
// ============================================

/*
En lugar de mostrar solo personal_id, mostrar el nombre:

A) Actualizar servicePersonal.js:
   export const getPersonalName = (id) => {
     return api.get(`/personal/${id}`)
   }

B) Crear computed en store avanzado:
   const servicePersonalsWithNames = computed(() => {
     return servicePersonals.value.map(sp => ({
       ...sp,
       personal_nombre: personalStore.getPersonalById(sp.personal_id)?.nombre
     }))
   })

C) Actualizar tabla:
   <el-table-column prop="personal_nombre" label="Personal" />

D) Actualizar formulario a select:
   <el-form-item label="Personal" prop="personal_id">
     <el-select v-model="form.personal_id" filterable>
       <el-option 
         v-for="p in personalList" 
         :key="p.id"
         :label="p.nombre"
         :value="p.id"
       />
     </el-select>
   </el-form-item>
*/

// ============================================
// 3. AGREGAR FILTROS AVANZADOS
// ============================================

/*
En servicePersonalStoreAdvanced.js:

const filters = ref({
  personal_id: null,
  estado: null,
  fecha_inicio: null,
  fecha_fin: null
})

const filteredServicePersonals = computed(() => {
  let filtered = servicePersonals.value

  if (searchQuery.value) {
    filtered = filtered.filter(sp =>
      sp.descripcion?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (filters.value.personal_id) {
    filtered = filtered.filter(sp => sp.personal_id === filters.value.personal_id)
  }

  if (filters.value.estado) {
    filtered = filtered.filter(sp => sp.estado === filters.value.estado)
  }

  if (filters.value.fecha_inicio) {
    filtered = filtered.filter(sp => 
      new Date(sp.fecha_inicio) >= new Date(filters.value.fecha_inicio)
    )
  }

  if (filters.value.fecha_fin) {
    filtered = filtered.filter(sp => 
      new Date(sp.fecha_fin) <= new Date(filters.value.fecha_fin)
    )
  }

  return filtered
})
*/

// ============================================
// 4. AGREGAR PAGINACIÓN
// ============================================

/*
En servicePersonalStore.js:

import { computed, ref } from 'vue'

const pageSize = ref(10)
const currentPage = ref(1)

const paginatedServicePersonals = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return servicePersonals.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(servicePersonals.value.length / pageSize.value)
})

En la vista:
<el-pagination
  v-model:current-page="store.currentPage"
  :page-size="store.pageSize"
  :total="store.servicePersonals.length"
  @current-change="page => store.currentPage = page"
/>
*/

// ============================================
// 5. AGREGAR ORDENAMIENTO
// ============================================

/*
En servicePersonalDetailTable.vue:

const props = defineProps({
  data: Array,
  sortBy: String,
  sortOrder: String
})

const columnConfig = {
  onHeaderClick: (column) => {
    emit('sort', column.prop)
  }
}

En ServicePersonals.vue:
const sortBy = ref('fecha_inicio')
const sortOrder = ref('descending')

const handleSort = (column) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'ascending' ? 'descending' : 'ascending'
  } else {
    sortBy.value = column
    sortOrder.value = 'ascending'
  }
}
*/

// ============================================
// 6. AGREGAR BÚSQUEDA Y FILTROS A LA VISTA
// ============================================

/*
En ServicePersonalsAdvanced.vue:

<template>
  <el-card class="box-card">
    <div class="mb-4">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input
            v-model="store.searchQuery"
            placeholder="Buscar por descripción..."
            clearable
          />
        </el-col>
        <el-col :span="12">
          <el-select
            v-model="store.filters.estado"
            placeholder="Filtrar por estado"
            clearable
          >
            <el-option label="Activo" value="activo" />
            <el-option label="Inactivo" value="inactivo" />
          </el-select>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>
*/

// ============================================
// 7. AGREGAR ACCIONES MASIVAS
// ============================================

/*
En servicePersonalStore.js:

const deleteMultiple = async (ids) => {
  try {
    const promises = ids.map(id => destroy(id))
    await Promise.all(promises)
    servicePersonals.value = servicePersonals.value.filter(
      sp => !ids.includes(sp.id)
    )
  } catch (error) {
    console.error('Error al eliminar múltiples:', error)
    throw error
  }
}

En ServicePersonalDetailTable.vue:

const selectedRows = ref([])

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

En template:
<el-table-column type="selection" width="50" />

En ServicePersonals.vue:

const deleteSelected = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('Selecciona al menos un registro')
    return
  }

  await store.deleteMultiple(selectedRows.value.map(r => r.id))
  ElMessage.success('Registros eliminados')
}
*/

// ============================================
// 8. AGREGAR EXPORTACIÓN A EXCEL
// ============================================

/*
Instalar: npm install xlsx

En servicePersonalStore.js:

import XLSX from 'xlsx'

const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(servicePersonals.value)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Servicios Personal')
  XLSX.writeFile(wb, 'servicios_personal.xlsx')
}

En ServicePersonals.vue:

<el-button @click="store.exportToExcel()">
  Exportar Excel
</el-button>
*/

// ============================================
// 9. AGREGAR CONFIRMACIÓN DE CAMBIOS
// ============================================

/*
En ServicePersonalForm.vue:

const hasChanges = computed(() => {
  return JSON.stringify(form) !== JSON.stringify(props.modelValue)
})

En template del modal:

<el-dialog
  @close="confirmClose"
  :close-on-click-modal="false"
>
  ...
</el-dialog>

const confirmClose = () => {
  if (hasChanges.value) {
    ElMessageBox.confirm(
      '¿Descartar cambios?',
      'Confirmar',
      { type: 'warning' }
    ).then(() => {
      modalVisible.value = false
    })
  } else {
    modalVisible.value = false
  }
}
*/

// ============================================
// 10. AGREGAR VALIDACIÓN PERSONALIZADA
// ============================================

/*
En ServicePersonalForm.vue:

const validateDateRange = (rule, value, callback) => {
  if (form.fecha_inicio && form.fecha_fin) {
    if (new Date(form.fecha_inicio) > new Date(form.fecha_fin)) {
      callback(new Error('La fecha inicio debe ser anterior a la fecha fin'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

const rules = {
  ...existingRules,
  fecha_fin: [
    { validator: validateDateRange, trigger: 'change' }
  ]
}
*/

// ============================================
// 11. AGREGAR AUDITORÍA
// ============================================

/*
En servicePersonalStore.js:

const auditLog = ref([])

const logAction = (action, data) => {
  auditLog.value.push({
    action,
    data,
    timestamp: new Date(),
    user: userStore.user.id
  })
}

const createServicePersonal = async (payload) => {
  const response = await create(payload)
  logAction('CREATE', response.data.data)
  return response
}

const getAuditLog = () => {
  return auditLog.value
}
*/

// ============================================
// 12. AGREGAR NOTIFICACIONES EN TIEMPO REAL
// ============================================

/*
En servicePersonalStore.js (con WebSockets):

import { useNotificationStore } from '@/stores/notificationStore'

const notifications = useNotificationStore()

const subscribeToUpdates = () => {
  const channel = echo.channel('service_personals')
  
  channel.listen('ServicePersonalCreated', (e) => {
    servicePersonals.value.push(e.servicePersonal)
    notifications.add('Nuevo servicio creado', 'success')
  })

  channel.listen('ServicePersonalUpdated', (e) => {
    const index = servicePersonals.value.findIndex(sp => sp.id === e.servicePersonal.id)
    if (index !== -1) {
      servicePersonals.value[index] = e.servicePersonal
    }
  })

  channel.listen('ServicePersonalDeleted', (e) => {
    servicePersonals.value = servicePersonals.value.filter(sp => sp.id !== e.id)
  })
}

En onMounted():
subscribeToUpdates()
*/

// ============================================
// FIN DE EJEMPLOS
// ============================================
