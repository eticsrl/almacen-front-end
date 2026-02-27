<template>
  <el-dialog
    v-model="visibleLocal"
    title="Nuevo Ingreso"
    width="60%"
    @close="emit('update:visible', false)"
  >
    <el-form :model="form" label-width="140px">
      <el-form-item label="Fecha de ingreso">
        <el-date-picker
          v-model="form.fecha_ingreso"
          type="date"
          placeholder="Seleccione fecha"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="Tipo de documento">
        <el-select v-model="form.tipo_documento_id" placeholder="Seleccione tipo">
          <el-option label="Compra" :value="1" />
          <el-option label="Donación" :value="2" />
        </el-select>
      </el-form-item>

      <el-form-item label="Proveedor">
        <el-input v-model="form.proveedor" placeholder="Nombre del proveedor" />
      </el-form-item>

      <!-- Aquí puedes agregar más campos como detalles de stock, etc. -->

    </el-form>

    <template #footer>
      <el-button @click="emit('update:visible', false)">Cancelar</el-button>
      <el-button type="primary" @click="guardar">Guardar</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  visible: Boolean,
  entry: Object,
  stockDetails: Array
})

const emit = defineEmits(['save', 'update:visible'])

const visibleLocal = ref(props.visible)

watch(() => props.visible, val => {
  visibleLocal.value = val
})

watch(visibleLocal, val => {
  emit('update:visible', val)
})

// Formulario reactivo
const form = ref({
  fecha_ingreso: '',
  tipo_documento_id: null,
  proveedor: '',
})

// Si estás editando un ingreso, prellenar los datos
watch(() => props.entry, (newEntry) => {
  if (newEntry) {
    form.value = {
      fecha_ingreso: newEntry.fecha_ingreso || '',
      tipo_documento_id: newEntry.tipo_documento_id || null,
      proveedor: newEntry.proveedor || '',
    }
  } else {
    // Limpia el formulario si es nuevo
    form.value = {
      fecha_ingreso: '',
      tipo_documento_id: null,
      proveedor: '',
    }
  }
}, { immediate: true })

const guardar = () => {
  // Aquí podrías hacer validaciones antes de emitir
  emit('save', { ...form.value })
  emit('update:visible', false)
}
</script>
