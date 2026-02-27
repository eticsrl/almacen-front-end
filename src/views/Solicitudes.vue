<template>
    <div>
      <el-card>
        <div class="header">
          <h2>Egresos</h2>
          <el-button type="primary" 
          :icon="Plus"
          @click="nuevaSolicitud">Nueva Solicitud</el-button>
      </div>

        <div class="filtros-contenedor flex items-center justify-between mb-4">
          <el-date-picker
            v-model="filters.rango"
            type="daterange"
            start-placeholder="Desde"
            end-placeholder="Hasta"
            @change="fetchDischarges"
          />
          <el-select
          v-model="filters.tipo_documento_id"
          placeholder="Tipo de documento"
          @change="fetchDischarges"
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
          v-model="filters.servicio_id"
          placeholder="Tipo de servicio"
          @change="fetchDischarges"
          clearable
          style="width: 220px; margin-left: 10px"
        >
          <el-option
            v-for="item in services"
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
          @change="fetchDischarges"
        >
          <el-option label="PENDIENTE" :value="27" />
          <el-option label="ACTIVO" :value="28" />
          <el-option label="ANULADO" :value="29" />
        </el-select>

        <el-button @click="limpiarFiltros" style="margin-left: 10px">
          Limpiar Filtros
        </el-button>
        </div>
  
        <el-table :data="dischargeStore.discharges"
        style="width: 100%"
        :default-sort="{ prop: 'numero', order: 'descending' }"
        >  
          <el-table-column prop="numero" label="Nro Egreso" sortable width="90" />
          <el-table-column prop="fecha_egreso" label="Fecha" width="140" >
          <template #default="{ row }">
            {{ dayjs(row.fecha_egreso).format('DD-MM-YYYY HH:mm') }}
          </template>
          </el-table-column>
          <el-table-column prop="tipo_documento" label="Tipo Documento" />
          <el-table-column prop="observaciones" label="Observaciones" />
          <el-table-column prop="servicio" label="Servicio" />
          <el-table-column prop="personal" label="Personal" />
          <el-table-column prop="usuario" label="Usuario" />
          <el-table-column prop="estado" label="Estado" />
          <el-table-column label="Acciones" width="180">
            <template #default="{ row }">
            <!-- Botón "Ver" para ACTIVO o ANULADO -->
            <el-tooltip :content="'Ver'" placement="top" v-if="row.estado_id === 28 || row.estado_id === 29">
              <el-button
                :icon="View"
                :type="row.estado_id === 28 ? 'success' : 'danger'"
                size="small"
                @click="editarEgreso(row)"
              />
            </el-tooltip>

            <!-- Botón "Editar" solo si está PENDIENTE -->
            <el-tooltip content="Editar" placement="top" v-else>
              <el-button
                :icon="Edit"
                type="primary"
                size="small"
                @click="editarEgreso(row)"
              />
            </el-tooltip>

            <!-- Botón "Anular" solo si está PENDIENTE -->
            <el-tooltip content="Anular" placement="top" v-if="row.estado_id === 27">
              <el-button
                :icon="Delete"
                type="danger"
                size="small"
                @click="anularEngreso(row)"
              />
            </el-tooltip>
            <el-tooltip content="Imprimir" placement="top">
                <el-button
                  :icon="Printer"
                  size="small"
                  type="info"
                  @click="imprimirEgreso(row.id)"
                />
              </el-tooltip>
          </template>
          
          </el-table-column>
        </el-table>
      </el-card>
  
      <DischargePrintModal
        v-model="showPrint"
        :discharge-id="printId"
        :discharge="printDischarge"
        
      />

      <!-- Modal -->
      <SolicitudForm
        v-model="showForm"
        :discharge="current"
        :stock-details="entryStore.detailsWithStock"
        @save="handleSave"
        @close="showForm = false"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessageBox, ElMessage} from 'element-plus'
  import { Edit, View, Delete, Plus,Printer} from '@element-plus/icons-vue'
  import dayjs from 'dayjs'

  import { useDischargeStore } from '@/stores/dischargeStore'
  import { useUserStore } from '@/stores/userStore'
  import { useEntryStore } from '@/stores/entryStore'

  import SolicitudForm from '@/components/SolicitudForm.vue'

  import { useDocumentTypeStore } from '@/stores/documentTypeStore'

  import DischargePrintModal from '@/components/report/DischargePrintModal.vue'
  
  const dischargeStore = useDischargeStore()
  const userStore = useUserStore()
  const entryStore = useEntryStore()
  
  const documentTypeStore = useDocumentTypeStore()

  const showForm = ref(false)
  const current = ref(null)
 
  const filters = ref({ rango: [] })
  const documentTypes = ref([])
  const entries = ref([])
  const services = ref([])

  const showPrint = ref(false)
  const printId = ref(null)
  const printDischarge = ref(null)

  const isReadOnly = ref(false)

  const fetchDischarges = async () => {
    const [start, end] = filters.value.rango || []
    const params = {
      fecha_inicio: start,
      fecha_fin: end,
    }
  
    if (filters.value.tipo_documento_id) {
  params.tipo_documento_id = filters.value.tipo_documento_id
  }

  if (filters.value.servicio_id) {
  params.servicio_id = filters.value.servicio_id
  }

    await dischargeStore.fetchDischarges(params)
  }
  
  const nuevaSolicitud = async () => {
  
    current.value = null
    await entryStore.fetchStockDetails()
    showForm.value = true
  }


  
  const editarEgreso = async (discharge) => {
 
    current.value = discharge
    await entryStore.fetchStockDetails()
    isReadOnly.value = discharge.estado_id === 28 || discharge.estado_id === 29
    showForm.value = true

  }
  
  const handleSave = () => {
    showForm.value = false
    fetchDischarges()
  }

  const limpiarFiltros = () => {
  filters.value = {
    rango: [],
    tipo_documento_id: null,
  }
  fetchDischarges()
}
  
  onMounted(async () => {
    await entryStore.fetchStockDetails()
    entries.value = entryStore.fetchStockDetails

   await documentTypeStore.fetchDocumentTypes({ categoria_id: 2 })
   documentTypes.value = documentTypeStore.documentTypes

   await documentTypeStore.fetchDocumentTypes({ categoria_id: 8 })
   services.value = documentTypeStore.documentTypes
   fetchDischarges()
   
  })
  
  const imprimirEgreso = (id) => {
  const row = dischargeStore.discharges.find(e => e.id === id) || null
  printDischarge.value = row
  console.log('Imprimiendo egreso:', id, row)
  printId.value = id
  showPrint.value = true
}

  </script>
  <style>
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
  