<template>
  <div>
    <el-card>
      <div class="header">
        <h2>Recetas dispensadas</h2>
      </div>
      
      <!-- Filtros -->
      <div class="filters flex items-center mb-4">
        <el-date-picker
          v-model="filters.rango"
          type="daterange"
          start-placeholder="Desde"
          end-placeholder="Hasta"
          @change="fetchData"
        />

        <el-input
          v-model="filters.paciente"
          placeholder="Paciente"
          clearable
          :prefix-icon="Search"
          style="width: 220px"
          @input="debouncedFetch"
          @clear="fetchData"
        />

        <el-select
          v-model="filters.tipo_receta_id"
          placeholder="Tipo de receta"
          clearable
          filterable
          style="width: 220px"
          @change="fetchData"
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
          style="width: 220px"
          @change="fetchData"
        >
          <el-option
            v-for="i in instituciones"
            :key="i.id"
            :label="i.descripcion"
            :value="i.id"
          />
        </el-select>

        <el-button @click="resetFilters">Limpiar</el-button>
      </div>

      <!-- Tabla -->
      <el-table
        :data="rows"
        v-loading="loadingFromStore"
        style="width: 100%"
        :default-sort="{ prop: 'receta_id', order: 'descending' }"
      >
        <el-table-column prop="receta_id" label="Nro" width="90" sortable />
        <el-table-column prop="paciente" label="Paciente" />
        <el-table-column prop="medico" label="Médico" />
        <el-table-column prop="especialidad" label="Especialidad" width="160" />
        <el-table-column prop="tipo_receta" label="Tipo" width="160" />
        <el-table-column prop="institucion" label="Institución" />
        <el-table-column prop="fecha_emision" label="Fecha emision" width="160"> 
        <template #default="{ row }">
            {{ dayjs(row.fecha_emision).format('DD-MM-YYYY HH:mm') }}
          </template>
        </el-table-column>

        <el-table-column prop="fecha_entrega" label="Fecha entrega" width="160">
          <template #default="{ row }">
            {{ dayjs(row.fecha_entrega).format('DD-MM-YYYY HH:mm') }}
          </template>
        </el-table-column>
        <el-table-column label="Egresos" width="110">
          <template #default="{ row }">{{ row.egresos?.length || 0 }}</template>
        </el-table-column>
        <el-table-column label="Acciones" width="150">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :icon="RefreshLeft"
              @click="abrirReingreso(row)"
            >
              Reingreso
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>

  <!-- Modal de reingreso -->
  <ReingresoReceta
    v-model="showReingreso"
    :receta="current"
    :key="current?.receta_id || current?.id || 'none'"
    @saved="onSaved"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { Search, RefreshLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { useDischargeStore } from '@/stores/dischargeStore'
import { useDocumentTypeStore } from '@/stores/documentTypeStore'
import { useInstitucionStore } from '@/stores/sissu/institucionStore'
import ReingresoReceta from '@/components/ReingresoReceta.vue'
import { useUserStore } from '@/stores/userStore'

/* Stores */
const dischargeStore    = useDischargeStore()
const documentTypeStore = useDocumentTypeStore()
const institucionStore  = useInstitucionStore()
const userStore = useUserStore()

/* State local */
const showReingreso = ref(false)
const current       = ref(null)

const EntityId  = computed(() => userStore.user?.entity?.id ?? userStore.user?.entity_id ?? null)
const filters = ref({
  rango: [],
  paciente: '',
  tipo_receta_id: null,
  institucion_id: null,
})

/* Catálogos */
const documentTypes = ref([])
const instituciones = ref([])

/* Derivados */

const rows = computed(() => dischargeStore.recetasDispensadas || [])
const loadingFromStore = computed(() => dischargeStore.loadingRecetas)

/* Debounce búsqueda por paciente */
let debounceTimer = null
const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchData, 400)
}

async function fetchData() {
  try {
    const [ini, fin] = filters.value.rango || []
    const params = {
      inicio: ini ? dayjs(ini).format('YYYY-MM-DD') : undefined,   
      fin:    fin ? dayjs(fin).format('YYYY-MM-DD') : undefined,   
      paciente: filters.value.paciente?.trim() || undefined,
      tipo_receta_id: filters.value.tipo_receta_id || undefined,
      institucion_id: filters.value.institucion_id || undefined,
      entity_id: EntityId.value,                                    
    }
    await dischargeStore.fetchRecetasDispensadas(params)
  } catch (e) {
    console.error(e)
    ElMessage.error('No se pudo cargar la lista.')
  }
}

function resetFilters() {
  filters.value = {
    rango: [],
    paciente: '',
    tipo_receta_id: null,
    institucion_id: null,
  }
  fetchData()
}

async function abrirReingreso(receta) {
   
  current.value = receta
  showReingreso.value = true
}

function onSaved() {
  showReingreso.value = false
  fetchData()
}

onMounted(async () => {
  await documentTypeStore.fetchDocumentTypes({ categoria_id: 6 })
  documentTypes.value = documentTypeStore.documentTypes

  await institucionStore.fetchInstituciones()
  instituciones.value = institucionStore.instituciones

  fetchData()
})
</script>

<style scoped>
.header { display: flex; align-items: center; justify-content: space-between; }

.filters {
    margin-bottom: 1rem;
  }
</style>
