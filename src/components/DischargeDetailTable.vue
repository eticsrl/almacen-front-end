<template>
  <div>
    <el-button type="primary" @click="agregarDetalle">Agregar detalle </el-button>
    
    <el-table :data="localDetails" style="width: 100%; margin-top: 15px">
      <el-table-column prop="liname" label="Liname" width="90"/>
      <el-table-column prop="medicamento" label="Nombre" />
      <el-table-column prop="formafarmaceutica" label="Presentación" />
      <el-table-column prop="lote" label="Lote" width="90" />
      <el-table-column prop="fecha_vencimiento" label="Vencimiento" width="120" />
      <el-table-column prop="stock_actual" label="Cantidad Actual" width="100"/>
    
      <el-table-column prop="costo_unitario" label="Costo Unitario" width="100"/>

      <el-table-column prop="cantidad_solicitada" label="Solicitado" width="95">
        <template #default="{ row }">
          <el-input 
          v-model="row.cantidad_solicitada" 
          :min="0" 
          :max="row.cantidad_solicitada"
          size="small" />
        </template>
      </el-table-column>
     
      <el-table-column prop="cantidad_entregada" label="Entregado" width="95">
        <template #default="{ row }">
          <el-input-number
            v-model="row.cantidad_entregada"
            :min="0"
            :max="Math.min(row.cantidad_solicitada, row.stock_actual)"
            size="small"
                       
            @input="recalculate(row)"
            @change="recalculate(row)"
            controls-position="right"
          />
          
        </template>
      </el-table-column>
      
      <el-table-column label="Precio Total" prop="costo_total" width="100"/>

      <el-table-column prop="observaciones" label="Observaciones" width="130">
        <template #default="{ row }">
          <el-input 
          v-model="row.observaciones" 
          size="small" 
        
          />
        </template>
      </el-table-column>
       
     <el-table-column label="Acciones" width="120">
        <template #default="{ $index }">
          <el-button type="danger" size="small" @click="eliminarDetalle($index)">Eliminar</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Modal para seleccionar detalle de ingreso -->
    <el-dialog v-model="showSelectModal" title="Seleccionar medicamento" width="80%">
      <el-input
          v-model="search"
          placeholder="Buscar por LINAME o nombre"
          clearable
          style="margin-bottom: 10px; width: 300px"
        />
      <el-table
        :data="filteredDetails"
        @row-click="seleccionarDetalle"
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column prop="liname" label="Liname" />
        <el-table-column prop="medicamento" label="Medicamento" />
        <el-table-column prop="formafarmaceutica" label="Presentación" />
        <el-table-column prop="lote" label="Lote" />
        <el-table-column prop="fecha_vencimiento" label="Vencimiento">
          <template #default="{ row }">
            {{ dayjs(row.fecha_vencimiento).format('DD-MM-YYYY') }}
          </template>
          </el-table-column>
        <el-table-column prop="cantidad" label="Cantidad Ingresada" width="100" />
        <el-table-column prop="stock_actual" label="Stock" width="100" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useEntryStore } from '@/stores/entryStore'
import { ElMessageBox, ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  stockDetails: {
    type: Array,
    default: () => []
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const localDetails = ref([])
const detailsWithStock = ref([])
const search = ref('')
const entryStore = useEntryStore()  

watch(() => props.stockDetails, val => {
  detailsWithStock.value = [...val]
}, { immediate: true })

const showSelectModal = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    if (JSON.stringify(localDetails.value) !== JSON.stringify(val)) {
      localDetails.value = [...val ?? []]
    }
  },
  { immediate: true, deep: true }
)

watch(
  localDetails,
  (val) => {
    if (JSON.stringify(val) !== JSON.stringify(props.modelValue)) {
      emit('update:modelValue', [...val])
    }
  },
  { deep: true }
)

const agregarDetalle = async () => {                  
 
  await entryStore.fetchStockDetails()
  detailsWithStock.value = [...entryStore.detailsWithStock]

  showSelectModal.value = true
}

const seleccionarDetalle = (detalle) => {
  if (localDetails.value.some(d => d.ingreso_detalle_id === detalle.id)) {
    showSelectModal.value = false
    return
  }

  localDetails.value.push({
    ingreso_detalle_id: detalle.id,
    liname: detalle.liname,
    medicamento: detalle.medicamento,
    formafarmaceutica: detalle.formafarmaceutica,
    lote: detalle.lote,
    fecha_vencimiento: detalle.fecha_vencimiento,
    cantidad_solicitada: 0,
    cantidad_entregada: 0,
    costo_unitario: detalle.costo_unitario,
    costo_total:0,
    observaciones: '',
    stock_actual: detalle.stock_actual
  })

  showSelectModal.value = false
}
const filteredDetails = computed(() => {
  const term = search.value.toLowerCase()
  return detailsWithStock.value.filter(item =>
    item.liname?.toLowerCase().includes(term) ||
    item.medicamento?.toLowerCase().includes(term)
  )
})
const eliminarDetalle = (index) => {
  localDetails.value.splice(index, 1)
}

const recalculate = (row) => {
  const maxPermitido = Math.min(row.cantidad_solicitada, row.stock_actual)

  if (row.cantidad_entregada > row.cantidad_solicitada) {
    ElMessage.warning('La cantidad entregada no puede ser mayor a la solicitada')
    row.cantidad_entregada = maxPermitido
  } else if (row.cantidad_entregada > row.stock_actual) {
    ElMessage.warning('La cantidad entregada no puede ser mayor al stock actual')
    row.cantidad_entregada = maxPermitido
  }

  if (row.cantidad_entregada > 0 && row.costo_unitario > 0) {
    row.costo_total = parseFloat((row.cantidad_entregada * row.costo_unitario).toFixed(4))
  }
}
</script>




