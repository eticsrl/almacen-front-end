<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="150px">
    <el-form-item label="Personal ID" prop="personal_id">
      <el-input v-model.number="form.personal_id" type="number" placeholder="Ingrese el ID del personal" />
    </el-form-item>
    
    <el-form-item label="Descripción" prop="descripcion">
      <el-input 
        v-model="form.descripcion" 
        type="textarea" 
        rows="3"
        placeholder="Ingrese la descripción del servicio"
      />
    </el-form-item>
    
    <el-form-item label="Fecha Inicio" prop="fecha_inicio">
      <el-date-picker 
        v-model="form.fecha_inicio" 
        type="date" 
        placeholder="Seleccionar fecha de inicio"
      />
    </el-form-item>
    
    <el-form-item label="Fecha Fin" prop="fecha_fin">
      <el-date-picker 
        v-model="form.fecha_fin" 
        type="date" 
        placeholder="Seleccionar fecha de fin"
      />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      personal_id: '',
      descripcion: '',
      fecha_inicio: null,
      fecha_fin: null
    })
  }
})

const emit = defineEmits(['update:modelValue'])

const formRef = ref(null)

const form = reactive({ ...props.modelValue })

const rules = {
  personal_id: [
    { required: true, message: 'Personal ID es requerido', trigger: 'blur' }
  ],
  descripcion: [
    { required: true, message: 'Descripción es requerida', trigger: 'blur' }
  ],
  fecha_inicio: [
    { required: true, message: 'Fecha de inicio es requerida', trigger: 'change' }
  ]
}

const submitForm = async () => {
  try {
    await formRef.value.validate()
    return form
  } catch (error) {
    return null
  }
}

defineExpose({
  submitForm,
  formRef,
  form
})
</script>

<style scoped>
</style>
