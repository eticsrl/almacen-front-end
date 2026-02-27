<template>
  <div>
    <el-button 
      v-if="!props.readonly"
      type="primary" 
      icon="el-icon-plus" 
      @click="addRow" class="mb-2">
      Agregar Item
    </el-button>
  
    <el-table :data="details" border style="width: 100%" :row-class-name="rowClassName">
      <!-- Medicamento -->
      <el-table-column label="Medicamento" prop="medicamento_id" width="130">
        <template #default="{ row }">
          <el-select
            v-model="row.medicamento_id" :disabled="props.readonly"
            filterable
            size="small"
            placeholder="Seleccione"
            @change="val => updateMedicine(row, val)"
          >
            <el-option
              v-for="item in medicines"
              :key="item.id"pue
              :label="item.liname"
              :value="item.id"
              :disabled="isSelectedInOtherRows(row, item.id)"
            />
          </el-select>
        </template>
      </el-table-column>
  
      <!-- Nombre genérico -->
      <el-table-column label="Nombre" prop="medicamento" width="150">
        <template #default="{ row }">
          <el-input v-model="row.medicamento" size="small" readonly :disabled="props.readonly" />
        </template>
      </el-table-column>
  
      <!-- Presentación -->
      <el-table-column label="Presentación" prop="formafarmaceutica" width="150">
        <template #default="{ row }">
          <el-input v-model="row.formafarmaceutica" size="small" readonly :disabled="props.readonly" />
        </template>
      </el-table-column>
  
      <!-- Lote -->
      <el-table-column label="Lote" prop="lote" width="150">
        <template #default="{ row }">
          <el-input v-model="row.lote" size="small"  :disabled="props.readonly"/>
        </template>
      </el-table-column>
  
      <!-- Fecha vencimiento -->
      <el-table-column label="Fecha Vencimiento" prop="fecha_vencimiento" width="150">
        <template #default="{ row }">
          <el-date-picker 
          v-model="row.fecha_vencimiento"  :disabled="props.readonly"
          size="small" 
          type="date" 
          placeholder="Pick a Date"
          format="MM/DD/YYYY"
          value-format="YYYY-MM-DD"
          />
        </template>
      </el-table-column>
  
      <!-- Cantidad -->
      <el-table-column label="Cantidad" prop="cantidad" width="120">
        <template #default="{ row }">
          <el-input-number
          v-model="row.cantidad" :disabled="props.readonly"
            :min="1"
            size="small"
            controls-position="right"
            @change="recalculate(row)"
          />
        </template>
      </el-table-column>
  
      <!-- Precio unitario -->
      <el-table-column label="Precio Unitario" prop="costo_unitario" width="120">
        <template #default="{ row }">
          <el-input-number
            v-model="row.costo_unitario" :disabled="props.readonly"
            :min="0"
            size="small"
            controls-position="right"
            @change="recalculate(row)"
          />
        </template>
      </el-table-column>
  
      <!-- Precio total -->
      <el-table-column label="Precio Total" prop="costo_total" width="120">
        <template #default="{ row }">
          <el-input-number
            v-model="row.costo_total" :disabled="props.readonly"
            :min="0"
            size="small"
            controls-position="right"
            @change="recalculateFromTotal(row)"
          />
        </template>
      </el-table-column>
  
      <!-- Observaciones -->
      <el-table-column label="Observaciones" prop="observaciones" width="150">
        <template #default="{ row }">
          <el-input v-model="row.observaciones" size="small" :disabled="props.readonly" />
        </template>
      </el-table-column>
  
      <!-- Acciones -->
      <el-table-column label="Acciones" width="100" v-if="!props.readonly">
        <template #default="{ $index, row }">
          <el-button
            :icon="Delete"
            type="danger"
            size="small"
            @click="removeRow($index,row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="Estado" prop="estado" width="120">
      <template #default="{ row }">
          <el-tag
              :type="getEstadoTagType(row.estado_id) || undefined"
              effect="dark"
              disable-transitions
            >
          {{ row.estado }}
        </el-tag>
      </template>
  </el-table-column>
    </el-table>
    <el-dialog v-model="selectDialogVisible" title="Seleccionar ítem para reingreso" border style="width: 75%">
      <el-input
          v-model="search"
          placeholder="Buscar por LINAME o nombre"
          clearable
          style="margin-bottom: 10px; width: 300px"
        />
      <el-table :data="filteredReentryDetails" style="width: 100%" @row-click="selectReentryItem">
        <el-table-column prop="liname" label="Liname" />
        <el-table-column prop="medicamento" label="Medicamento" />
        <el-table-column prop="cantidad" label="Cantidad ingresada" />
        <el-table-column prop="stock_actual" label="Cantidad Actual" />
        <el-table-column prop="lote" label="Lote" />
        <el-table-column prop="fecha_vencimiento" label="Vencimiento" />
        <el-table-column prop="costo_unitario" label="Costo Unit." />
        <el-table-column prop="numero_ingreso" label="Nº Ingreso" />
        <el-table-column prop="fecha_ingreso" label="Fecha Ingreso" />
        <el-table-column prop="tipo_ingreso" label="Tipo Ingreso" />
       
        <el-table-column prop="observaciones" label="observaciones" />
      </el-table>
    </el-dialog>
  
  </div>
  </template>
  
  <script setup>
  import { ElMessage } from 'element-plus'
  import { ElMessageBox } from 'element-plus'
  import { Edit, View, Delete, Plus,Printer } from '@element-plus/icons-vue'
  import { ref, computed } from 'vue'
  const search = ref('')
  const props = defineProps({
  details: {
    type: Array,
    required: true,
  },
  medicines: {
    type: Array,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  reentryDetails: {
    type: Array,
    default: () => []
  },
  isReingreso: {
    type: Boolean,
    default: false
  }
  
  } )
  //console.log('reentryDetailss:', props.reentryDetails)
  const rowClassName = ({ row, rowIndex }) => {
  // ejemplo: marcar en rojo si cantidad es negativa
  if (row.cantidad < 0) {
    return 'row-error'
  }
  return ''
  }
  
  const addRow = () => {
  if (props.isReingreso) {
    openSelectReentryItem() // 👈 abrir modal si es reingreso
  } else {
    props.details.push({
      medicamento_id: null,
      medicamento: '',
      formafarmaceutica: '',
      lote: '',
      fecha_vencimiento: '',
      cantidad: 0,
      costo_unitario: 0,
      costo_total: 0,
      observaciones: '',
    })
  }
  }
  
  const removeRow = async (index, row) => {
    // ☝️ 1. ¡IMPORTANTE! La función debe ser 'async' para poder usar 'await'
    try {
        // 2. ElMessageBox.confirm devuelve una Promise. 
        // Se espera (await) a que el usuario confirme. 
        // Si confirma, el código continúa. Si cancela, salta al 'catch'.
        await ElMessageBox.confirm(
            `¿Está seguro de que desea eliminar el medicamento: ${row.medicamento}? Esta acción no se puede deshacer.`,
            'Confirmar eliminación',
            {
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                type: 'warning',
            }
        ) // El paréntesis de cierre de la función va aquí, después de las opciones.

        // 3. Si el await anterior tiene éxito (el usuario confirmó), 
        // ahora ejecutamos la lógica de eliminación:
        props.details.splice(index, 1) 
        
        // Opcional: Mostrar un mensaje de éxito
        ElMessage.success('Elemento eliminado correctamente.')


    } catch (error) {
        // El error es 'cancel' si el usuario cerró o canceló la ventana.
        if (error !== 'cancel') {
            console.error('Error al anular ingreso:', error)
            ElMessage.error('Error al eliminar elemento.')
        } else {
            // Opcional: El usuario canceló la eliminación
            ElMessage.info('Eliminación cancelada.')
        }
    }
} 
  
  const updateMedicine = (row, medicineId) => {
  const alreadyUsed = props.details.some(
    item => item !== row && item.medicamento_id === medicineId
  )
  
  if (alreadyUsed) {
    ElMessage.warning('Este medicamento ya ha sido seleccionado en otro detalle.')
    row.medicamento_id = null
    row.medicamento = ''
    row.formafarmaceutica = ''
    return
  }
  
  const selected = props.medicines.find(med => med.id === medicineId)
  if (selected) {
    row.medicamento = selected.nombre_generico
    row.formafarmaceutica = selected.formafarmaceutica
  }
  }
  
  const isSelectedInOtherRows = (currentRow, medicineId) => {
  return props.details.some(row => row !== currentRow && row.medicamento_id === medicineId)
  }
  
  const recalculate = (row) => {
  if (row.cantidad > 0 && row.costo_unitario > 0) {
    row.costo_total = parseFloat((row.cantidad * row.costo_unitario).toFixed(2))
  }
  }
  
  const recalculateFromTotal = (row) => {
  if (row.cantidad > 0 && row.costo_total > 0) {
    row.costo_unitario = parseFloat((row.costo_total / row.cantidad).toFixed(2))
  }
  
  }
  
  const selectDialogVisible = ref(false)
  
  const openSelectReentryItem = () => {
  console.log("Detalles disponibles para reingreso:", props.reentryDetails)
  selectDialogVisible.value = true
  }
  
  const selectReentryItem = (item) => {
  props.details.push({
    medicamento_id: item.medicamento_id,
    medicamento: item.medicamento,
    formafarmaceutica: item.formafarmaceutica,
    lote: item.lote,
    fecha_vencimiento: item.fecha_vencimiento,
    cantidad: 0,
    costo_unitario: item.costo_unitario,
    costo_total: 0,
    observaciones: '',
    item_id: item.id, // <--- Esto enlaza con el detalle original
  })
  
  selectDialogVisible.value = false
  }
  const filteredReentryDetails = computed(() => {
  const term = search.value.trim().toLowerCase()
  return props.reentryDetails.filter(item =>
    item.liname?.toLowerCase().includes(term) ||
    item.medicamento?.toLowerCase().includes(term)
  )
  })
  const getEstadoTagType = (estadoId) => {
  switch (estadoId) {
    case 27: return 'primary'     // Pendiente
    case 28: return 'success'  // Activo
    case 29: return 'danger'   // Anulado
    default: return null        // Sin color
  }
  }
  
  </script>
  
  <style scoped>
  .mb-2 {
  margin-bottom: 1rem;
  }
  .row-error {
  background-color: #ffe6e6;
  }
  </style>
  
  
  
  



