<template>
    <div>
      <el-button
        type="primary"
        @click="agregarItem"
        v-if="!readonly"
      >
        Agregar medicamento
      </el-button>
  
      <el-table :data="localItems" style="width: 100%; margin-top: 15px">
        <!-- Medicamento LINAME/código -->
        <el-table-column label="Medicamento" width="120">
          <template #default="{ row }">
            <el-select
              v-model="row.medicamento_id"
              placeholder="Seleccione"
              filterable
              :disabled="readonly"
              style="width: 100%"
              @change="syncMedicamento(row)"
            >
              <el-option
                v-for="m in medicines"
                :key="m.id"
                :label="m.liname"
                :value="m.id"
              />
            </el-select>
          </template>
        </el-table-column>
  
        <el-table-column label="Nombre">
          <template #default="{ row }">
            {{ row.nombre_generico || row.medicamento?.nombre || '—' }}
          </template>
        </el-table-column>

        <el-table-column label="Presentación">
          <template #default="{ row }">
            {{ row.formafarmaceutica || row.medicamento?.forma_farmaceutica || '—' }}
          </template>
        </el-table-column>
       
        <el-table-column label="Cantidad" width="95">
          <template #default="{ row }">
            <el-input-number
              v-model="row.cantidad"
              :min="1"
              :disabled="readonly"
              size="small"
            />
          </template>
        </el-table-column>
  
        <!-- Días -->
        <el-table-column label="Días" width="80">
          <template #default="{ row }">
            <el-input-number
              v-model="row.dias"
              :min="1"
              :disabled="readonly"
              size="small"
            />
          </template>
        </el-table-column>
    
        <!-- Indicacion -->
        <el-table-column label="Indicaciones" prop="indicacion" width="160">
          <template #default="{ row }">
            <el-input
              v-model="row.indicacion"
              size="small"
              :disabled="readonly"
            />
          </template>
        </el-table-column>
  
        <!-- Justificación -->
        <el-table-column label="Justificación" prop="justificacion" width="160">
          <template #default="{ row }">
            <el-input
              v-model="row.justificacion"
              size="small"
              :disabled="readonly"
            />
          </template>
        </el-table-column>
  
        <!-- Acciones -->
        <el-table-column label="Acciones" width="100" v-if="!readonly">
          <template #default="{ $index }">
            <el-button
              type="danger"
              size="small"
              @click="eliminarItem($index)"
            >
              Eliminar
            </el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <!-- Modal seleccionar medicamento (buscador) -->
      <el-dialog v-model="showSelectModal" title="Seleccionar medicamento" width="70%">
        <el-input
          v-model="medicineSearch"
          placeholder="Buscar LINAME o nombre"
          clearable
          style="width: 300px; margin-bottom: 10px"
        />
        <el-table
          :data="filteredMedicines"
          highlight-current-row
          @row-dblclick="seleccionarMedicamento"
        >
          <el-table-column prop="liname" label="LINAME" width="120" />
          <el-table-column prop="nombre_generico" label="Nombre" />
          <el-table-column prop="formafarmaceutica" label="Presentación" />
        </el-table>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, computed } from 'vue'
  
  /* --- Props / Emits --- */
  const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    medicines: { type: Array, default: () => [] },
    vias: { type: Array, default: () => [] },
    readonly: { type: Boolean, default: false },
  })
  const emit = defineEmits(['update:modelValue'])
  
  /* --- Local state --- */
  const localItems = ref([])
  const showSelectModal = ref(false)
  const medicineSearch = ref('')
  
  /* --- Sync with v-model --- */
  watch(
    () => props.modelValue,
    (val) => {
      if (JSON.stringify(val) !== JSON.stringify(localItems.value)) localItems.value = [...val]
    },
    { immediate: true, deep: true },
  )
  watch(
    localItems,
    (val) => {
      if (JSON.stringify(val) !== JSON.stringify(props.modelValue)) emit('update:modelValue', [...val])
    },
    { deep: true },
  )
  
  /* --- Computed filtered list --- */
  const filteredMedicines = computed(() => {
    const t = medicineSearch.value.toLowerCase()
    return props.medicines.filter(
      (m) => m.liname?.toLowerCase().includes(t) || m.nombre?.toLowerCase().includes(t),
    )
  })
  
  /* --- Methods --- */
  const agregarItem = () => {
    showSelectModal.value = true
  }
  
  const seleccionarMedicamento = (med) => {
    if (localItems.value.some((i) => i.medicamento_id === med.id)) {
      showSelectModal.value = false
      return
    }
    localItems.value.push({
      medicamento_id: med.id,
      nombre_generico: med.nombre_generico,
      formafarmaceutica: med.formafarmaceutica,
      cantidad: 1,
      dias: 1,
      via_id: null,
      indicacion: '',
      justificacion: '',
     
    })
    showSelectModal.value = false
  }
  
  const eliminarItem = (idx) => {
    localItems.value.splice(idx, 1)
  }
  
  const syncMedicamento = (row) => {
    const med = props.medicines.find((m) => m.id === row.medicamento_id)
    if (med) {
      row.nombre_generico = med.nombre_generico
      row.formafarmaceutica= med.formafarmaceutica
    }
  }
  </script>
  
  <style scoped></style>
  