<template>
  <el-dialog v-model="visible" :title="isEdit ? 'Editar Solicitud' : 'Nueva Solicitud'" width="78%"
    :close-on-click-modal="false" @closed="resetForm">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="140px">
      <!-- Campos principales del egreso -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Fecha" prop="fecha_egreso">
            <el-date-picker 
              v-model="form.fecha_egreso" 
              style="width: 100%" 
              type="date" 
              :disabled="true" />
          </el-form-item>
          <el-form-item label="Tipo Documento" prop="tipo_documento_id">
            <el-select 
              v-model="form.tipo_documento_id" 
              placeholder="Seleccione" 
              :disabled="true">
              <el-option 
                v-for="item in documentTypes" 
                :key="item.id" 
                :label="item.descripcion" 
                :value="item.id" />
            </el-select>
          </el-form-item>
          <!--el-form-item label="Proveedor" prop="proveedor_id">
            <el-select v-model="form.proveedor_id" placeholder="Seleccione">
              <el-option v-for="item in suppliers" :key="item.id" :label="item.nombre" :value="item.id" />
            </el-select>
          </el-form-item-->
        </el-col>
        <el-col :span="12">
          <!-- SERVICIO - Primer select -->
          <el-form-item label="Servicio / Unidad" prop="servicio_id">
            <el-select 
              v-model="form.servicio_id" 
              placeholder="Seleccione servicio"
              @change="onServiceChange">
              <el-option 
                v-for="item in services" 
                :key="item.id" 
                :label="item.descripcion" 
                :value="item.id" />
            </el-select>
          </el-form-item>
          
          <!-- PERSONAL - Segundo select (depende de servicio) -->
          <el-form-item label="Personal" prop="personal_id">
            <el-select 
              v-model="form.personal_id" 
              placeholder="Seleccione personal"
              :disabled="!form.servicio_id">
              <el-option 
                v-for="item in filteredPersonal" 
                :key="item.id" 
                :label="item.descripcion" 
                :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="Observaciones" prop="observaciones">
            <el-input type="textarea" v-model="form.observaciones" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider>Detalles del egreso</el-divider>
      <SolicitudDetailTable v-model="form.discharge_details" :stock-details="stockDetails" :readonly="props.readonly" />

    </el-form>

    <template #footer>
      <el-button @click="visible = false">Cancelar</el-button>
      <el-button type="primary" @click="submit">Guardar</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import SolicitudDetailTable from './SolicitudDetailTable.vue'
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
  fecha_egreso: new Date(),
  tipo_documento_id: 53,
  receta_id: 0,
  proveedor_id: null,
  servicio_id: null,
  personal_id: null,
  observaciones: '',
  discharge_details: [],
})

// ← AGREGAR: Computed para filtrar personal según servicio
const filteredPersonal = computed(() => {
  // Mostrar todos los personal o filtrar por servicio si está disponible
  if (!form.value.servicio_id) return []
  
  // Intentar filtrar por servicio_id si existe el campo
  const filtered = personal.value.filter(p => {
    // Si el personal tiene servicio_id, filtrar por él
    if (p.servicio_id !== undefined && p.servicio_id !== null) {
      return p.servicio_id === form.value.servicio_id
    }
    // Si no tiene servicio_id, mostrar todos los personal
    return true
  })
  
  return filtered.length > 0 ? filtered : personal.value
})


watch(() => props.discharge, val => {
  if (val) {
    isEdit.value = true
    form.value = {
      id: val.id,
      fecha_egreso: val.fecha_egreso,
      tipo_documento_id: val.tipo_documento_id,
      receta_id: val.receta_id || 0,
      proveedor_id: val.proveedor_id,
      servicio_id: val.servicio_id,
      personal_id: val.personal_id, // Asegurar que se carga
      observaciones: val.observaciones,
      discharge_details: val.discharge_details || [],
    }
  }
}, { immediate: true })

const rules = {
  //fecha_egreso: [{ required: true, message: 'Seleccione la fecha', trigger: 'change' }],
  //tipo_documento_id: [{ required: true, message: 'Seleccione tipo documento', trigger: 'change' }],
  servicio_id: [{ required: true, message: 'Seleccione servicio', trigger: 'change' }],
  personal_id: [{ required: true, message: 'Seleccione personal', trigger: 'change' }],
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
const personal = ref([]) // ← AGREGAR lista completa de personal

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
// ← AGREGAR: Función para limpiar personal al cambiar servicio
const onServiceChange = () => {
  console.log('Servicio cambió a:', form.value.servicio_id)
  // Solo limpiar si es nuevo registro, no si estamos editando
  if (!isEdit.value) {
    form.value.personal_id = null
  }
}

const resetForm = () => {
  form.value = {
    fecha_egreso: new Date(),
    tipo_documento_id: 53,
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
    try {
      // Validar que personal_id esté presente
      if (!form.value.personal_id) {
        ElMessage.error('Debe seleccionar un personal')
        return
      }

      // Crear un objeto limpio para enviar
      const payload = {
        ...form.value,
        personal_id: form.value.personal_id // Asegurar que se incluya
      }

      console.log('Enviando payload:', payload)

      if (isEdit.value) {
        await dischargeStore.updateDischarge(form.value.id, payload)
        ElMessage.success('Registro actualizado correctamente')
      } else {
        if (form.value.tipo_documento_id !== 10) {
          payload.receta_id = 0
        }
        const result = await dischargeStore.createDischarge(payload)
        console.log('Resultado guardado:', result)
        ElMessage.success('Registro creado correctamente')
      }

      emit('saved')
      visible.value = false
    } catch (error) {
      console.error('Error al guardar:', error)
      const msg = error.response?.data?.message || 'Ocurrió un error inesperado'
      ElMessage.error(msg)
    }
  })
}


</script>
