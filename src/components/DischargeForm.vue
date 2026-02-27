<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? 'Editar Egreso' : 'Nuevo Egreso'"
    width="78%"
    :close-on-click-modal="false"
    @closed="resetForm"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="140px">
      <!-- Campos principales del egreso -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Fecha" prop="fecha_egreso">
            <el-date-picker v-model="form.fecha_egreso" style="width: 100%" type="date" />
          </el-form-item>
          <el-form-item label="Tipo Documento" prop="tipo_documento_id">
            <el-select v-model="form.tipo_documento_id" placeholder="Seleccione">
              <el-option v-for="item in documentTypes" :key="item.id" :label="item.descripcion" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="Proveedor" prop="proveedor_id">
            <el-select v-model="form.proveedor_id" placeholder="Seleccione">
              <el-option v-for="item in suppliers" :key="item.id" :label="item.nombre" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Servicio" prop="servicio_id">
            <el-select v-model="form.servicio_id" placeholder="Seleccione">
              <el-option v-for="item in services" :key="item.id" :label="item.descripcion" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="Personal" prop="personal_id">
            <el-select v-model="form.personal_id" placeholder="Seleccione">
              <el-option v-for="item in personal" :key="item.id" :label="item.nombre" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="Observaciones" prop="observaciones">
            <el-input type="textarea" v-model="form.observaciones" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider>Detalles del egreso</el-divider>
      <DischargeDetailTable 
      v-model="form.discharge_details" 
      :stock-details="stockDetails"
      :readonly="props.readonly"
      />

    </el-form>

    <template #footer>
      <el-button @click="visible = false">Cancelar</el-button>
      <el-button type="primary" @click="submit">Guardar</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import DischargeDetailTable from './DischargeDetailTable.vue'
import { useDischargeStore } from '@/stores/dischargeStore'

import { useSupplierStore } from '@/stores/supplierStore'
import { useDocumentTypeStore } from '@/stores/documentTypeStore'
import { useMedicineStore } from '@/stores/medicineStore'
import { usePersonalStore } from '@/stores/personalStore'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  discharge: Object,
  readonly: {
    type: Boolean,
    default: false,
  },
  stockDetails: Array,
})

const emit = defineEmits(['update:modelValue', 'saved'])

const visible = ref(props.modelValue)

watch(() => props.modelValue, val => visible.value = val)
watch(visible, val => emit('update:modelValue', val))

const formRef = ref()
const isEdit = ref(false)

const form = ref({
  fecha_egreso: null,
  tipo_documento_id: null,
  proveedor_id: null,
  servicio_id: null,
  personal_id: null,
  observaciones: '',
  discharge_details: [],
})

watch(() => props.discharge, val => {
  if (val) {
    isEdit.value = true
    form.value = { ...val, discharge_details: val.discharge_details}
  }
}, { immediate: true })

const rules = {
  fecha_egreso: [{ required: true, message: 'Seleccione la fecha', trigger: 'change' }],
  tipo_documento_id: [{ required: true, message: 'Seleccione tipo documento', trigger: 'change' }],
  /*proveedor_id: [{ required: true, message: 'Seleccione proveedor', trigger: 'change' }],*/
}

const dischargeStore = useDischargeStore()
const supplierStore = useSupplierStore()
const documentTypeStore = useDocumentTypeStore()
const medicineStore = useMedicineStore()
const personalStore = usePersonalStore()

const suppliers = ref([])
const documentTypes = ref([])
const services = ref([])
const medicines = ref([])
const personal = ref([])

const loadData = async () => {
  await supplierStore.fetchSuppliers()
  suppliers.value = supplierStore.suppliers
  await documentTypeStore.fetchDocumentTypes({ categoria_id: 2 })
  documentTypes.value = documentTypeStore.documentTypes
  await documentTypeStore.fetchDocumentTypes({ categoria_id: 8 })
  services.value = documentTypeStore.documentTypes // categoria_id = 8
  await medicineStore.fetchMedicines()
    medicines.value = medicineStore.medicines
  await personalStore.fetchPersonal()
    personal.value = personalStore.personal

}
loadData()

const resetForm = () => {
  form.value = {
    fecha_egreso: null,
    tipo_documento_id: null,
    receta_id: 0,
    proveedor_id: null,
    servicio_id: null,
    personal_id: null,
    observaciones: '',
    discharge_details: [],
  }
  isEdit.value = false
}

const submit = () => {
  formRef.value.validate(async valid => {
    if (!valid) return
    try{

    
    if (isEdit.value) {
      await dischargeStore.updateDischarge(form.value)
      ElMessage.success('Registro actualizado correctamente')
    } else {
      if (form.tipo_documento_id !== 10) {
         form.receta_id = 0
        }
      await dischargeStore.createDischarge(form.value)
      ElMessage.success('Registro creado correctamente')
    }

    emit('saved')
    visible.value = false
  } catch (error) {
      
      const msg = error.response?.data?.message || 'Ocurrió un error inesperado'
      ElMessage.error(msg)
    }
    })
}


</script>
