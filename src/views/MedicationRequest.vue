<template>
  <div>
    <el-card>
      <div class="header">
        <h2>Solicitud de Recetas</h2>
        <el-button
          type="primary"
          :icon="Plus"
          @click="nuevaReceta"
        >
          Nueva Receta
        </el-button>
      </div>

      <!-- Filtros -->
      <div class="filters flex items-center justify-between mb-4">
        <el-date-picker
          v-model="filters.rango"
          type="daterange"
          start-placeholder="Desde"
          end-placeholder="Hasta"
          @change="fetchRecetas"
        />

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
        <el-table-column prop="id" label="Nro" width="70" sortable />

        <el-table-column prop="fecha_emision" label="Fecha" width="160"/>              
        <el-table-column prop="paciente.nombre_completo" label="Paciente" />
        <el-table-column prop="medico.nombre_completo" label="Médico" />
        <el-table-column prop="medico.especialidad.especialidad" label="Especialidad" />
        <el-table-column prop="tipo_receta.descripcion" label="Tipo" />             
        <el-table-column prop="institucion.descripcion" label="institucion" />  
        <el-table-column prop="estado.descripcion" label="Estado" />

        <el-table-column label="Acciones" width="240">
          <template #default="{ row }">
            <!-- Ver -->
            <el-tooltip content="Ver" placement="top">
              <el-button :icon="View" size="small" @click="verReceta(row)" />
            </el-tooltip>

            <!-- Editar -->
            <el-tooltip
              v-if="row.estado_id === ESTADOS.PENDIENTE"
              content="Editar"
              placement="top"
            >
              <el-button
                :icon="Edit"
                type="primary"
                size="small"
                @click="editarReceta(row)"
              />
            </el-tooltip>

            <!-- Dispensar -->
            <el-tooltip
              v-if="row.estado_id === ESTADOS.PENDIENTE"
              content="Dispensar"
              placement="top"
            >
              <el-button
                :icon="CircleCheck"
                type="success"
                size="small"
                @click="dispensarReceta(row)"
              />
            </el-tooltip>

            <!-- Anular -->
            <el-tooltip
              v-if="row.estado_id === ESTADOS.PENDIENTE"
              content="Anular"
              placement="top"
            >
              <el-button
                :icon="Delete"
                type="danger"
                size="small"
                @click="anularReceta(row)"
              />
            </el-tooltip>

            <!-- Imprimir -->
            <el-tooltip content="Imprimir" placement="top">
              <el-button
                :icon="Printer"
                type="info"
                size="small"
                @click="imprimirReceta(row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Modal de formulario de receta -->
    <RecetaForm
      v-model="showForm"
      :receta="current"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted,computed } from 'vue'
import dayjs from 'dayjs'
import {
  Plus,
  View,
  Edit,
  Delete,
  Printer,
  CircleCheck,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import { useRecetaStore } from '@/stores/sissu/recetaStore'
import { useDocumentTypeStore } from '@/stores/documentTypeStore'
import { useInstitucionStore } from '@/stores/sissu/institucionStore'
import { useAfiliadoStore } from '@/stores/afiliacion/useAfiliadoStore'
import { useUserStore } from '@/stores/userStore'



import RecetaForm from '@/components/RecetaForm.vue'

/* --- Stores --- */
const recetaStore = useRecetaStore()
const documentTypeStore = useDocumentTypeStore()
const institucionStore = useInstitucionStore()
const afiliadoStore = useAfiliadoStore()
const userStore = useUserStore()

/* --- Refs --- */
const showForm = ref(false)
const current = ref(null)

/* Estados de la receta */
const ESTADOS = {
  PENDIENTE: 1,
  ENTREGADA: 2,
  ANULADA: 18,
}

const entidadId = computed(() => userStore.user?.entity?.id ?? userStore.user?.entity_id ?? null)

/* Filtros */
const filters = ref({
  rango: [],
  tipo_receta_id: null,
  institucion_id: null,
  estado_id: null,
})

const documentTypes = ref([])
const instituciones = ref([])

/* --- Métodos --- */
const fetchRecetas = async () => {
  const [start, end] = filters.value.rango || []
  const params = {
    inicio: start,
    fin: end,
    tipo_receta_id: filters.value.tipo_receta_id,
    institucion_id: filters.value.institucion_id,
    estado_id: filters.value.estado_id,
    entidad_id:entidadId.value,
    
  }
  await recetaStore.fetchRecetasFarmacia (params)
}

const limpiarFiltros = () => {
  filters.value = {
    rango: [],
    tipo_receta_id: null,
    institucion_id: null,
    estado_id: null,
  }
  fetchRecetas()
}

const nuevaReceta = () => {
  current.value = null
  showForm.value = true
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
  // TODO: implementar modal de dispensación parcial
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

const imprimirReceta = (row) => {
  window.open(`/api/recetas/${row.id}/print`, '_blank')
}

const handleSaved = () => {
  showForm.value = false
  fetchRecetas()
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
