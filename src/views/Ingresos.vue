<template>
  <div>
    <el-card>
      <div class="header">
          <h2>Ingresos</h2>
          <el-button type="primary" 
          :icon="Plus"
          @click="nuevoIngreso">Nuevo Ingreso</el-button>
      </div>
      
      <div class="filtros-contenedor flex items-center justify-between mb-4">
        <el-date-picker
          v-model="filters.rango"
          type="daterange"
          start-placeholder="Desde"
          end-placeholder="Hasta"
          @change="fetchEntries"
        /> 
        <el-select
          v-model="filters.tipo_documento_id"
          placeholder="Tipo de documento"
          @change="fetchEntries"
          clearable
          style="width: 220px; margin-left: 10px"
        >
          <el-option
            v-for="item in documentTypes"
            :key="item.id"
            :label="item.descripcion"
            :value="item.id"
          />
        </el-select>
        <el-select
          v-model="filters.estado_id"
          placeholder="Filtrar por estado"
          clearable
          style="width: 200px; margin-left: 10px"
          @change="fetchEntries"
        >
          <el-option label="Pendiente" :value="27" />
          <el-option label="Activo" :value="28" />
          <el-option label="Anulado" :value="29" />
        </el-select>

        <el-button @click="limpiarFiltros" style="margin-left: 10px">
          Limpiar Filtros
        </el-button>
        
      </div>

      <el-table :data="entryStore.entries" 
      :default-sort="{ prop: 'numero', order: 'descending' }"
      style="width: 100%"
    
      >
        <el-table-column prop="numero" label="Nro Ingreso" sortable width="100" />
        <el-table-column label="Fecha" prop="fecha_ingreso"  width="180">
          <template #default="{ row }">
            {{ dayjs(row.fecha_ingreso).format('DD-MM-YYYY HH:mm') }}
          </template>
        </el-table-column>
        <el-table-column prop="tipo_documento" label="Tipo de Ingreso" />
        <el-table-column prop="proveedor" label="Proveedor" />
        <el-table-column prop="observaciones" label="Observaciones" />
        <el-table-column prop="usuario" label="Usuario" width="120" />
        <el-table-column prop="estado" label="Estado" width="120" >
          <template #default="{ row }">
            <el-tag
              :type="getEstadoTagType(row.estado_id)"
              effect="plain"
              disable-transitions 
              >
                {{ row.estado }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Acciones" width="180">
          <template #default="{ row }">
            <!-- Botón "Ver" para ACTIVO o ANULADO -->
            <el-tooltip 
              :content="'Ver'" 
              placement="right" 
              v-if="row.estado_id === 28 || row.estado_id === 29">
              <el-button
                :icon="View"
                :type="row.estado_id === 28 ? 'success' : 'danger'"
                size="small"
                @click="editarIngreso(row)"
              />
            </el-tooltip>

            <!-- Botón "Editar" solo si está PENDIENTE -->
            <el-tooltip content="Editars" placement="right" v-else>
              <el-button
                :icon="Edit"
                type="primary"
                size="small"
                @click="editarIngreso(row)"
              />
            </el-tooltip>

            <!-- Botón "Anular" solo si está PENDIENTE -->
            <el-tooltip content="Anular" placement="right" v-if="row.estado_id === 27">
              <el-button
                :icon="Delete"
                type="danger"
                size="small"
                @click="anularIngreso(row)"
              />
            </el-tooltip>
            
              <el-tooltip content="Imprimir" placement="right">
                <el-button
                  :icon="Printer"
                  size="small"
                  type="info"
                  @click="imprimirIngreso(row.id)"
                />
              </el-tooltip>

          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- Modal Imprimir -->
    <entry-print-modal
        v-model="showPrint"
        :entry-id="printId"
        :entry="printEntry"
        
      />
    <!-- Modal Formulario -->
    <entry-form
      v-model="showForm"
      :entry="current"
      :readonly="isReadOnly"
      :stock-details="entryStore.detailsWithStock"
      @saved="handleSave"
      @close="showForm = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { ElMessageBox, ElMessage} from 'element-plus'
import { Edit, View, Delete, Plus,Printer } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

import { useEntryStore } from '@/stores/entryStore'
import EntryForm from '@/components/EntryForm.vue'
import { useUserStore } from '@/stores/userStore'
import { useDocumentTypeStore } from '@/stores/documentTypeStore'

import EntryPrintModal from '@/components/report/EntryPrintModal.vue'

// script setup
const logError = (error) => {
  // Solo se ejecuta en modo de desarrollo
  if (__DEV__) { 
    console.error('Error de depuración detallado:', error);
  } else {
    // Código para enviar el error a un servicio de tracking (ej. Sentry) en producción
    trackProdError(error); 
  }
}

const userStore = useUserStore()
const entryStore = useEntryStore()

const entityId = computed(() => userStore.user.entity.id)
const documentTypeStore = useDocumentTypeStore()

const showForm = ref(false)
const current = ref(null)

const showPrint = ref(false)
const printId = ref(null)
const printEntry = ref(null)

const filters = ref({
  rango: [],
  tipo_documento_id: null,
  estado_id: null,
})
const documentTypes = ref([])
const isReadOnly = ref(false)

const fetchEntries = async () => {
  const [start, end] = filters.value.rango || []
  const params = {
    fecha_inicio: start,
    fecha_fin: end,
    estado_id: filters.value.estado_id,
  }

  if (entityId.value !== null && entityId.value !== undefined) {
    params.entity_id = entityId.value
    console.log('Filtrando por entidad:', entityId.value)
  }
  
  if (filters.value.tipo_documento_id) {
  params.tipo_documento_id = filters.value.tipo_documento_id
  }

  await entryStore.fetchEntries(params)
}

const limpiarFiltros = () => {
  filters.value = {
    rango: [],
    tipo_documento_id: null,
    estado_id: null,
  }
  fetchEntries()
}

onMounted(async () => {
  await documentTypeStore.fetchDocumentTypes({ categoria_id: 1 })
  documentTypes.value = documentTypeStore.documentTypes

  entryStore.fetchStockDetails()
  fetchEntries()
})



const nuevoIngreso = () => {
  isReadOnly.value = false
  current.value = null
  showForm.value = true
}

const editarIngreso = (entry) => {
 // 1. Crear una COPIA del objeto de ingreso (row) para evitar mutar el array de la tabla
    const entryToForm = { ...entry }

    // 2. FILTRAR los detalles: Excluir los que tienen estado_id = 29 (ANULADO)
    if (entryToForm.details && Array.isArray(entryToForm.details)) {
        entryToForm.details = entryToForm.details.filter(detail => detail.estado_id !== 29)
    }

    // 3. Asignar la entrada filtrada a la variable reactiva 'current'

  current.value = entryToForm
  //current.value = entry
  console.log('Editar ingreso:', entry['details'])
  isReadOnly.value = entry.estado_id === 28  || entry.estado_id === 29 // Solo lectura si está activo
  showForm.value = true
}



const anularIngreso = async (entry) => {
  try {
    await ElMessageBox.confirm(
      `¿Está seguro de que desea anular el ingreso #${entry.numero}? Esta acción no se puede deshacer.`,
      'Confirmar anulación',
      {
        confirmButtonText: 'Sí, anular',
        cancelButtonText: 'Cancelar',
        type: 'warning',
      }
    )

    await entryStore.remove(entry.id)
    ElMessage.success('Ingreso anulado correctamente')
    fetchEntries()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error al anular ingreso:', error)
      ElMessage.error('No se pudo anular el ingreso')
    }
  }
}


const handleSave = () => {
  showForm.value = false
  fetchEntries()
}


watch(
  () => userStore.user,
  (val) => {
    if (val && val.entity_id) {
      entryStore.fetchStockDetails()
      fetchEntries()
    }
  },
  { immediate: true }
)


const getEstadoTagType = (estadoId) => {
  switch (estadoId) {
    case 27: return 'primary'     // Pendiente
    case 28: return 'success'  // Activo
    case 29: return 'danger'   // Anulado
    default: return ''         // Sin color
  }
}
const imprimirIngreso = (id) => {
  const row = entryStore.entries.find(e => e.id === id) || null
  printEntry.value = row         // si trae details, lo usa; si no, carga por id
  printId.value = id
  showPrint.value = true
}
</script>
<style scoped>
.filters input {
  width: 220px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .filtros-contenedor {
    margin-bottom: 1rem;
  }

</style>

