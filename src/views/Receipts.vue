<template>
    <div>
      <el-card>
        <div class="header">
          <h2>Dispensación de Recetas</h2>
          
        </div>
        <!-- Conmutador de origen (solo visible si el usuario es de entidad 1 - SSU) -->
          <el-radio-group
            v-if="canSeeSSUE"
            v-model="listaOrigen"
            size="small"
            @change="fetchRecetas"
          >
            <el-radio-button label="propias">SSU</el-radio-button>
            <el-radio-button label="ssue">SSUE</el-radio-button>
          </el-radio-group>

          <!-- Indicador de “solo lectura” cuando estás viendo SSUE -->
          <el-tag
            v-if="modoSSUE"
            type="info"
            effect="dark"
            style="margin-left: 10px"
          >
            Solo lectura (SSUE)
          </el-tag>
        <!-- Filtros -->
        <div class="filters flex items-center justify-between mb-4">
          <el-date-picker
            v-model="filters.rango"
            type="daterange"
            start-placeholder="Desde"
            end-placeholder="Hasta"
            @change="fetchRecetas"
          />
          <el-input
            v-model="filters.paciente"
            placeholder="Paciente"
            clearable
            :prefix-icon="Search"
            style="width: 260px; margin-left: 10px"
            @input="onPacienteInput"   
            @clear="fetchRecetas"
            />
            <el-select
            v-model="filters.estado_id"
            placeholder="Estado"
            clearable
            style="width: 160px; margin-left: 10px"
            @change="fetchRecetas"
          >
            <el-option label="PENDIENTE" :value="ESTADOS.PENDIENTE" />
            <el-option label="ENTREGADA" :value="ESTADOS.ENTREGADA" />
            <el-option label="ANULADA" :value="ESTADOS.ANULADA" />
          </el-select>

          <el-select
            v-model="filters.tipo_receta_id"
            placeholder="Tipo de receta"
            clearable
            filterable
            style="width: 220px; margin-left: 10px"
            @change="fetchRecetas"
          >
            <el-option
              v-for="t in documentTypes"
              :key="t.id"
              :label="t.descripcion"
              :value="t.id"
            />
          </el-select>
  
          <el-select
            v-model="filters.institucion_id"
            placeholder="Institución"
            clearable
            filterable
            style="width: 220px; margin-left: 10px"
            @change="fetchRecetas"
          >
            <el-option
              v-for="i in instituciones"
              :key="i.id"
              :label="i.descripcion"
              :value="i.id"
            />
          </el-select>
  
        
  
          <el-button @click="limpiarFiltros" style="margin-left: 10px">
            Limpiar Filtros
          </el-button>
        </div>
  
        <!-- Tabla principal -->
        <el-table
          :data="recetaStore.recetas"
          style="width: 100%"
          :default-sort="{ prop: 'id', order: 'descending' }"
        >
          <!--<el-table-column prop="id" label="Nro" width="70" sortable />-->
  
                     
          <el-table-column prop="estado.descripcion" label="Estado" />
          <el-table-column prop="paciente.nombre_completo" label="Paciente" />
          <el-table-column prop="medico.nombre_completo" label="Médico" />
          <el-table-column prop="medico.especialidad.especialidad" label="Especialidad" />
          <el-table-column prop="fecha_emision" label="Fecha de emisión" width="160"/>  
          <el-table-column prop="fecha_entrega" label="Fecha de entrega" width="160"/>   
          <el-table-column prop="tipo_receta.descripcion" label="Tipo" />             
          <el-table-column prop="institucion.descripcion" label="institucion" />  
          
  
          <el-table-column label="Acciones" width="240">
            <template #default="{ row }">
            <!-- Ver -->
            <el-tooltip content="Ver" placement="top">
              <el-button :icon="View" size="small" @click="verReceta(row)" />
            </el-tooltip>

            
            <!-- Dispensar (solo cuando no es SSUE y está PENDIENTE) -->
            <el-tooltip v-if="allowDispense(row)" content="Dispensar" placement="top">
              <el-button :icon="CircleCheck" type="success" size="small" @click="dispensarReceta(row)" />
            </el-tooltip>

            <!-- Anular (solo cuando no es SSUE y está PENDIENTE) -->
            <el-tooltip v-if="allowCancel(row)" content="Anular" placement="top">
              <el-button :icon="Delete" type="danger" size="small" @click="anularReceta(row)" />
            </el-tooltip>

            <!-- Imprimir (siempre) -->
            <el-tooltip content="Imprimir" placement="top">
              <el-button :icon="Printer" type="info" size="small" @click="imprimirReceta(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
         
          
        </el-table>
      </el-card>
        <!-- Modal de impresión -->
        <RecetaPrintDialog
            v-model="showPrint"
            :receta="currentPrint"
          />
  
      <!-- Modal de formulario de receta -->
      <RecetaForm
        v-model="showForm"
        :receta="current"
        @saved="handleSaved"
      />
    </div>

    <DescargoReceta
    v-model="showDescargo"
    :receta="current"
    @saved="handleDescargoSaved"
    />
  </template>
  
  <script setup>
  import { ref, onMounted,computed,onActivated } from 'vue'
  import dayjs from 'dayjs'
  import {
    Plus,
    View,
    Edit,
    Delete,
    Printer,
    CircleCheck,
    Search,
  } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  
  import { useRecetaStore } from '@/stores/sissu/recetaStore'
  import { useDocumentTypeStore } from '@/stores/documentTypeStore'
  import { useInstitucionStore } from '@/stores/sissu/institucionStore'
  import { useAfiliadoStore } from '@/stores/afiliacion/useAfiliadoStore'
  import { useUserStore } from '@/stores/userStore'
  
  
  import RecetaForm from '@/components/RecetaForm.vue'
  import DescargoReceta from '@/components/DescargoReceta.vue'
  import RecetaPrintDialog from '@/components/report/RecetaPrintDialog.vue'
  
  /* --- Stores --- */
  const recetaStore = useRecetaStore()
  const documentTypeStore = useDocumentTypeStore()
  const institucionStore = useInstitucionStore()
  const afiliadoStore = useAfiliadoStore()
  const userStore = useUserStore()

  const myEntityId  = computed(() => userStore.user?.entity?.id ?? userStore.user?.entity_id ?? null)
  const isPendiente = (row) => Number(row?.estado?.id ?? row?.estado_id ?? 0) === ESTADOS.PENDIENTE
  
  /* --- Refs --- */
  const showForm = ref(false)
  const current = ref(null)
  const showDescargo = ref(false)

  const showPrint    = ref(false)
const currentPrint = ref(null)
  
// ¿El usuario es SSU (entidad 1)? → puede ver SSUE
const canSeeSSUE  = computed(() => Number(myEntityId.value) === 1)

// Conmutador: 'propias' (SSU) | 'ssue' (SSUE)
const listaOrigen = ref('propias')

// Modo solo lectura (cuando estamos viendo SSUE)
const modoSSUE = computed(() => canSeeSSUE.value && listaOrigen.value === 'ssue')

// Helpers de permisos por fila
const allowEdit      = (row) => !modoSSUE.value && Number(row?.estado?.id ?? row?.estado_id ?? 0) === ESTADOS.PENDIENTE
const allowDispense  = (row) => !modoSSUE.value && Number(row?.estado?.id ?? row?.estado_id ?? 0) === ESTADOS.PENDIENTE
const allowCancel    = (row) => !modoSSUE.value && Number(row?.estado?.id ?? row?.estado_id ?? 0) === ESTADOS.PENDIENTE


  /* Estados de la receta */
  const ESTADOS = {
    PENDIENTE: 1,
    ENTREGADA: 2,
    ANULADA: 18,
  }
  
  /* Filtros */
  const filters = ref({
    rango: [],
    tipo_receta_id: null,
    institucion_id: null,
    estado_id: null,
    paciente: '',  
  })
  
  const documentTypes = ref([])
  const instituciones = ref([])
  
  let pacienteTimer = null
const onPacienteInput = () => {
  clearTimeout(pacienteTimer)
  pacienteTimer = setTimeout(fetchRecetas, 400)
}
  /* --- Métodos --- */
  const fetchRecetas = async () => {
    const [start, end] = filters.value.rango || []

      // Entidad a consultar:
      // - Si soy SSU y estoy en “SSUE”: 2
      // - Si soy SSU y estoy en “SSU”: 1
      // - En cualquier otro caso (no SSU): mi propia entidad
      const entidadFiltro = canSeeSSUE.value
        ? (listaOrigen.value === 'ssue' ? 2 : 1)
        : (myEntityId.value || undefined)

    const params = {
      inicio: start,
      fin: end,
      tipo_receta_id: filters.value.tipo_receta_id,
      institucion_id: filters.value.institucion_id,
      estado_id: filters.value.estado_id,
      paciente: filters.value.paciente?.trim() || undefined,
      entidad_id: entidadFiltro,
    }
    await recetaStore.fetchRecetas(params)
  }
  
  const limpiarFiltros = () => {
    filters.value = {
      rango: [],
      tipo_receta_id: null,
      institucion_id: null,
      estado_id: null,
      paciente: '',    
    }
    fetchRecetas()
  }
  
   
  const editarReceta = (row) => {
    current.value = row
    showForm.value = true
  }
  
  const verReceta = async (row) => {
    try {
      await afiliadoStore.obtenerInfoAfiliado(row.paciente.id)  
      current.value = { ...row, readonly: true }
      showForm.value = true
    } catch (e) {
      console.error('Error cargando paciente', e)
      ElMessage.error('No se pudo cargar la información del paciente')
    }
  }
  
  const dispensarReceta = (row) => {
  current.value = row
  showDescargo.value = true
  
}
  const anularReceta = async (row) => {
    try {
      await ElMessageBox.confirm(
        '¿Seguro que deseas anular la receta?',
        'Confirmar',
        {
          type: 'warning',
        },
      )
      await recetaStore.updateReceta(row.id, { estado_id: ESTADOS.ANULADA })
      ElMessage.success('Receta anulada')
      fetchRecetas()
    } catch (_) {
      /* Cancelado */
    }
  }
  
  async function imprimirReceta(row) {

  if (!row.items || !row.items.length) {
    try {
      const full = await recetaStore.fetchReceta(row.id) 
     
      currentPrint.value = full
    } catch (e) {
      console.error(e)
     
      currentPrint.value = row
    }
  } else {
    currentPrint.value = row
    console.log("para imprimir",currentPrint.value)
  }
  showPrint.value = true
}
  
  const handleSaved = () => {
    showForm.value = false
    fetchRecetas()
  }

  const handleDescargoSaved = async () => {
  showDescargo.value = false
  await fetchRecetas()              
}
  /* --- Montaje inicial --- */
  onMounted(async () => {
    await documentTypeStore.fetchDocumentTypes({ categoria_id: 6 })
    documentTypes.value = documentTypeStore.documentTypes
  
    await institucionStore.fetchInstituciones()
    instituciones.value = institucionStore.instituciones
    console.log ('Inst. del select',instituciones.value)
   
  fetchRecetas()
  
  })
  onMounted(fetchRecetas)
    onActivated(() => {
      
      if (!showDescargo.value && !showForm.value) fetchRecetas()
    })
  </script>
  
  <style scoped>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .filters {
    margin-bottom: 1rem;
  }
  </style>
  