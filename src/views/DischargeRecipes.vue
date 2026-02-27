<template>
    <div>
      <el-card>
        <div class="header">
          <h2>Egresos por Receta</h2>
          <div class="flex gap-2">
            <el-button type="primary" :icon="Search" @click="fetchData" :loading="loading">Buscar</el-button>
            <el-button @click="resetFilters">Limpiar</el-button>
          </div>
        </div>
  
        <!-- Filtros -->
        
        <div class="filters grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            <div class="flex gap-2 items-center">

            <span class="muted w-28">Fecha egreso:</span>
            <el-date-picker
              v-model="filters.rangoEgreso"
              type="daterange"
              range-separator="→"
              start-placeholder="Desde"
              end-placeholder="Hasta"
              @change="fetchData"
            />
          </div>
          
          <div class="flex gap-2">
            <div class="flex gap-2">
            <el-input
              v-model="filters.paciente"
              placeholder="Paciente"
              clearable
              :prefix-icon="Search"
              style="width: 260px"
              @input="debouncedFetch"
              @clear="fetchData"
            />
     
            <el-input v-model="filters.numero" placeholder="N° Egreso" style="width: 160px" clearable />
          </div>
  
          <div class="flex gap-2">
           
            <el-select
              v-model="filters.tipo_receta_id"
              placeholder="Tipo de receta"
              clearable
              filterable
              style="width: 240px"
              @change="fetchData"
            >
              <el-option
                v-for="t in documentTypes"
                :key="t.id"
                :label="t.descripcion"
                :value="t.id"
              />
            </el-select>
            <el-input
              v-model="filters.medico"
              placeholder="Médico"
              clearable
              :prefix-icon="Search"
              style="width: 260px"
              @input="debouncedFetch"
              @clear="fetchData"
            />
          </div>
        </div>
        </div>
  
        <!-- Tabla -->
        <el-table
          :data="rows"
          v-loading="loading"
          style="width: 100%"
          :default-sort="{ prop: 'numero', order: 'descending' }"
          :row-key="rowKey"
        >

          <el-table-column prop="numero" label="N° Egreso" width="100" sortable />
          
          <el-table-column prop="fecha_egreso" label="Fecha"  width="180">
            <template #default="{ row }">
                {{ dayjs(row.fecha_egreso).format('DD-MM-YYYY HH:mm') }}
            </template>
          </el-table-column>

          <el-table-column prop="paciente" label="Paciente" min-width="220" />
          <el-table-column prop="medico" label="Médico" min-width="220" />
          <el-table-column prop="especialidad" label="Especialidad" width="200" />
          <el-table-column prop="tipo_receta" label="Tipo receta" width="200" />
          <el-table-column prop="egreso_id" label="Egreso" width="100" />
          <el-table-column label="Acciones" width="120" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="Ver detalle" placement="top">
              <el-button 
                :icon="View" 
                size="small" 
                @click="ver(row)" 
               />
            </el-tooltip>
              <!-- Imprimir -->
              <el-tooltip content="Imprimir" placement="top">
                <el-button
                  :icon="Printer"
                  type="info"
                  size="small"
                  @click="imprimirEgreso(row)"
                />
              </el-tooltip>
              
          </template>
        </el-table-column>
        </el-table>
      </el-card>
      <!-- Modal de impresión -->
      <RecEgrePrintDialog
            v-model="showPrint"
            :egreso="currentPrint"
          />
      <!-- Modal de detalle -->
      <EgresoRecetaDetailTable
        v-model="showDetail"
        :egreso="currentEgreso"
        />
    </div>
    
  </template>
  
  <script setup>
  import { ref, onMounted,watch} from 'vue'
  import dayjs from 'dayjs'
  import { ElMessage } from 'element-plus'
  import { View,Search,Printer } from '@element-plus/icons-vue'
  import { useDischargeStore } from '@/stores/dischargeStore'
  import { useDocumentTypeStore } from '@/stores/documentTypeStore'
  import EgresoRecetaDetailTable from '@/components/EgresoRecetaDetailTable.vue'
  import { useAfiliadoStore } from '@/stores/afiliacion/useAfiliadoStore'
  import RecEgrePrintDialog from '@/components/report/RecEgrePrintDialog.vue'

  
  /* Catálogo tipo receta (categoria_id = 6) */
  const documentTypes = ref([])
  const documentTypeStore = useDocumentTypeStore()
  const dischargeStore = useDischargeStore()
  const afiliadoStore = useAfiliadoStore()
  /* Estado */
  const rows = ref([])
  const loading = ref(false)
  /* Para Imprimir*/
  const showPrint    = ref(false)
  const currentPrint = ref(null)

  const today = dayjs().toDate()
  


  const filters = ref({
    receta_id: null,
    numero: null,
    entity_id: null,
    tipo_receta_id: null,
    paciente: '',
    medico: '',
    rangoEgreso:  [today, today],
    rangoEmision: []
  })
  const showDetail = ref(false)
  const currentEgreso = ref(null)
 
  const nf = (v) => {
    if (v === null || v === undefined || v === '') return ''
    return Number(v).toFixed(2)
  }
  const rowKey = (r) => `${r.egreso_id}-${r.receta_id}`
  
  let debounceTimer = null
  const debouncedFetch = () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(fetchData, 400)
  }


  async function fetchData () {
    loading.value = true
    try {
      const [egIni, egFin] = filters.value.rangoEgreso || []
      const [emIni, emFin] = filters.value.rangoEmision || []
      const params = {
        receta_id: filters.value.receta_id || undefined,
        numero: filters.value.numero || undefined,
        entity_id: filters.value.entity_id || undefined,
        tipo_receta_id: filters.value.tipo_receta_id || undefined,
        paciente: filters.value.paciente?.trim() || undefined,
        medico: filters.value.medico?.trim() || undefined,
        inicio: egIni ? dayjs(egIni).format('DD-MM-YYYY') : undefined,
        fin: egFin ? dayjs(egFin).format('DD-MM-YYYY') : undefined,
        emision_inicio: emIni ? dayjs(emIni).format('DD-MM-YYYY') : undefined,
        emision_fin: emFin ? dayjs(emFin).format('DD-MM-YYYY') : undefined
      }
      const data = await dischargeStore.fetchEgresosPorReceta (params)
      rows.value = Array.isArray(data) ? data : []
      console.log('[Egresos API] params =>', params)
      console.log('[Egresos API] response =>', data)
    } catch (e) {
      console.error(e)
      ElMessage.error('No se pudo cargar la lista.')
    } finally {
      loading.value = false
    }
  }
  
  function resetFilters () {
    filters.value = {
      receta_id: null,
      numero: null,
      entity_id: null,
      tipo_receta_id: null,
      paciente: '',
      medico: '',
      rangoEgreso: [],
      rangoEmision: []
    }
    fetchData()
  }
  
  onMounted(async () => {
    // tipos de receta
    await documentTypeStore.fetchDocumentTypes({ categoria_id: 6 })
    documentTypes.value = documentTypeStore.documentTypes
  
    fetchData()
  })
  const ver = async (row) => {
   // Abre el modal con el egreso que has clickado
   currentEgreso.value = row
  showDetail.value = true

  // (Opcional) si quieres mostrar PatientCard dentro del modal
  if (row.paciente_id) {
    try {
      await afiliadoStore.obtenerInfoAfiliado(row.paciente_id)
    } catch (e) {
      console.warn('No se pudo cargar info afiliado:', e)
      // No rompas la UI si falla; el modal igual se muestra
    }
  }
}
async function imprimirEgreso(row) {
  // Si en la fila no tienes los items completos, trae el detalle
  if (!row.items || !row.items.length) {
    try {
      const full = await dischargeStore.fetchEgresosPorReceta({egreso_id:row.egreso_id}) 
     
      currentPrint.value = full
    } catch (e) {
      console.error(e)
      // fallback a lo que tengas
      currentPrint.value = row
    }
  } else {
    currentPrint.value = row
    console.log("para imprimir",currentPrint.value)
  }
  showPrint.value = true
}
  
  </script>
  
  <style scoped>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: .75rem;
  }
  .filters {
    margin-bottom: 1rem;
  }
  .muted { color:#666; font-size: 12px; }
  .grid {
    display: grid;
  }
  .gap-2 { gap: .5rem; }
  .flex { display: flex; }
  .items-center { align-items: center; }
  .w-28 { width: 7rem; }
  .md\:grid-cols-2 { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .xl\:grid-cols-3 { grid-template-columns: repeat(3,minmax(0,1fr)); }
  @media (max-width: 768px) {
    .md\:grid-cols-2 { grid-template-columns: 1fr; }
    .xl\:grid-cols-3 { grid-template-columns: 1fr; }
  }
  </style>
  