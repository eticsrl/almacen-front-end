<template>
  <el-dialog v-model="visible" :title="isEdit ? 'Editar ingreso' : 'Nuevo ingreso'" width="78%"
    :close-on-click-modal="false" @closed="resetForm">

    <el-form :model="form" :rules="rules" ref="entryFormRef" label-width="140px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Entidad" prop="entity_id">
            <el-select v-model="form.entity_id" placeholder="Seleccione" disabled>
              <el-option v-for="item in entities" :key="item.id" :label="item.descripcion" :value="Number(item.id)" />
            </el-select>
          </el-form-item>

          <el-form-item label="Tipo documento" prop="tipo_documento_id">
            <el-select v-model="form.tipo_documento_id" placeholder="Seleccione" :disabled="props.readonly">
              <el-option v-for="item in documentTypes" :key="item.id" :label="item.descripcion"
                :value="Number(item.id)" />
            </el-select>
          </el-form-item>
          <el-form-item label="Fecha ingreso" prop="fecha_ingreso">
            <el-date-picker v-model="form.fecha_ingreso" :disabled="props.readonly" type="date"
              placeholder="Fecha de ingreso"  style="width: 100%" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Proveedor" prop="proveedor_id">
            <el-select v-model="form.proveedor_id" placeholder="Seleccione" :disabled="props.readonly">
              <el-option v-for="item in suppliers" :key="item.id" :label="item.nombre" :value="Number(item.id)" />
            </el-select>
          </el-form-item>

          <el-form-item label="Nro. factura" prop="num_factura">
            <el-input-number v-model="form.num_factura" :readonly="props.readonly" controls-position="right"
              style="width: 100%" />
          </el-form-item>

          <el-form-item label="Observaciones" prop="observaciones">
            <el-input type="textarea" v-model="form.observaciones" :readonly="props.readonly" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider>
        ººº Items del ingreso

        <template v-if="isEdit && form.estado_id === 27">
          <el-button type="success" :icon="Unlock" size="small" @click="activateEntry" style="margin-left: 16px">
            Activar Ingreso
          </el-button>
        </template>

        <template v-else-if="isEdit && form.estado_id === 28">
          <el-button type="info" :icon="Lock" size="small" disabled style="margin-left: 16px">
            Activado
          </el-button>
        </template>
      </el-divider>

      <entry-detail-table v-model:details="form.entry_details" :medicines="medicines" :readonly="props.readonly"
        :reentry-details="detailsForReentry" :is-reingreso="isReingreso" />
    </el-form>

    <template #footer>

      <el-button @click="emit('update:modelValue', false)">Cancelar</el-button>
      <el-button v-if="!props.readonly" type="primary" @click="submitForm">Guardar</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Lock, Unlock } from '@element-plus/icons-vue'
import EntryDetailTable from './EntryDetailTable.vue'
import Swal from 'sweetalert2'
import { useEntryStore } from '@/stores/entryStore'
import { useEntityStore } from '@/stores/entityStore'
import { useSupplierStore } from '@/stores/supplierStore'
import { useDocumentTypeStore } from '@/stores/documentTypeStore'
import { useMedicineStore } from '@/stores/medicineStore'

import { useUserStore } from '@/stores/userStore'

const entityStore = useEntityStore()
const supplierStore = useSupplierStore()
const documentTypeStore = useDocumentTypeStore()
const medicineStore = useMedicineStore()
const entryStore = useEntryStore()
const userStore = useUserStore()

const entities = ref([])
const suppliers = ref([])
const documentTypes = ref([])
const medicines = ref([])
const detailsForReentry = ref([])


const entityId = computed(() => userStore.user?.entity?.id ?? userStore.user?.entity_id)

const props = defineProps({
  modelValue: Boolean,
  entry: Object,
  readonly: {
    type: Boolean,
    default: false,
  },
  stockDetails: Array,
})

const emit = defineEmits(['update:modelValue', 'saved'])

const visible = ref(props.modelValue)
//debugger
watch(() => props.modelValue, val => (visible.value = val))
watch(visible, val => emit('update:modelValue', val))

watch([visible, entityId], ([vis, ent]) => {
  if (vis && !isEdit.value && ent && (form.value.entity_id == null || form.value.entity_id === '')) {
    form.value.entity_id = Number(ent)
  }
}, { immediate: true })

const isEdit = ref(false)

const form = ref({
  entity_id: null,
  tipo_documento_id: null,
  fecha_ingreso: null,
  proveedor_id: null,
  num_factura: null,
  observaciones: '',
  entry_details: [],
})

watch(
  () => props.entry,
  val => {
    if (val) {
      isEdit.value = true
      form.value = {
        ...val,
        entity_id: Number(val.entity_id),
        tipo_documento_id: Number(val.tipo_documento_id),
        proveedor_id: Number(val.proveedor_id),
        fecha_ingreso: val.fecha_ingreso ? new Date(val.fecha_ingreso) : null,

        entry_details: val.details.map(d => ({ 
          ...d,
          id: d.id })),
      }

    }
  },
  { immediate: true }

)

const entryFormRef = ref()

const rules = {
  entity_id: [{ required: true, message: 'Seleccione entidad', trigger: 'change' }],
  tipo_documento_id: [{ required: true, message: 'Seleccione tipo documento', trigger: 'change' }],
  fecha_ingreso: [{ required: true, message: 'Seleccione fecha', trigger: 'change' }],
  proveedor_id: [{ required: true, message: 'Seleccione proveedor', trigger: 'change' }],
  entry_details: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (!value.length) callback(new Error('Debe agregar al menos un detalle'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
}





const loadData = async () => {
  await entityStore.fetchEntities()
  entities.value = entityStore.entities
  await supplierStore.fetchSuppliers()
  suppliers.value = supplierStore.suppliers
  await documentTypeStore.fetchDocumentTypes({ categoria_id: 1 }) // donde categoria_id = 1
  documentTypes.value = documentTypeStore.documentTypes
  await medicineStore.fetchMedicines()
  medicines.value = medicineStore.medicines
  await entryStore.fetchDetailsForReentry()
  detailsForReentry.value = entryStore.reentryDetails

}
loadData()

const resetForm = () => {
  form.value = {
    entity_id: Number(entityId.value ?? 0) || null,
    tipo_documento_id: null,
    fecha_ingreso: null,
    proveedor_id: null,
    num_factura: null,
    observaciones: '',
    entry_details: [],
  }
  isEdit.value = false
}

const isReingreso = computed(() => {
  return (
    form.value.tipo_documento_id &&
    documentTypes.value.find(d => d.id === form.value.tipo_documento_id)?.descripcion
      ?.toUpperCase()
      .includes('REINGRESO')
  )
})

const submitForm = () => {

  entryFormRef.value.validate(async valid => {
    if (!valid) return
      // DEBUG: Ver estructura real de los detalles
    console.log('Estructura de entry_details:');
    form.value.entry_details.forEach((detail, index) => {
      console.log(`Detalle ${index}:`, {
        hasId: !!detail.id,
        id: detail.id,
        keys: Object.keys(detail),
        isReentry: !!detail.item_id // para reingresos
      });
    });
    
    try {
      if (isEdit.value) {
        await entryStore.update(form.value.id, form.value)
        //ElMessage.success('Ingreso actualizado correctamente')
        Swal.fire('Actualizado!', 'Ingreso actualizado correctamente', 'success')
      } else {

        await entryStore.create(form.value)
        //ElMessage.success('Ingreso creado correctamente')
        Swal.fire('Creado!', 'Ingreso creado correctamente', 'success')
      }

      emit('saved')
      visible.value = false
    } catch (err) {
      console.error('Error al guardar ingreso inicial:', err)
      //ElMessage.error(err.response?.data?.message || 'Error al guardar')
      Swal.fire('Error', err.response?.data?.message || 'Error al guardar', 'error')  
      console.log("datos para guardar", form.value)
    }
  })
}
const activateEntry = async () => {
  try {
    const { id } = form.value

     const result = await Swal.fire({
      title: 'Confirmar activación',
      text: '¿Está seguro que desea activar este ingreso?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, activar', // Cambié el texto para ser más específico
      cancelButtonText: 'Cancelar',
      reverseButtons: true, // Para que el botón de confirmación esté a la derecha
      
    })

    if (!result.isConfirmed) return // Si el usuario cancela, salimos

    const updated = await entryStore.activate(id)

    form.value = {
      ...updated,
      entry_details: updated.details.map(d => ({ ...d })),
    }

    //ElMessage.success('Ingreso activado correctamente')
    // Uso de SweetAlert2 para el mensaje de éxito
   // Éxito
        Swal.fire('Activado!', 'Ingreso activado correctamente', 'success')

  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error al activar ingreso:', error)
      Swal.fire('Error', error.response?.data?.message || 'No se pudo activar el ingreso', 'error')
    }
  }
}

</script>
<style>
/* ⚠️ IMPORTANTE: Este bloque NO debe llevar 'scoped' */

/* Asegura que el contenedor principal de SweetAlert2 (que contiene el popup y el overlay) 
   tenga un z-index más alto que el El-Dialog de Element Plus.
   Los diálogos de Element Plus suelen tener z-index alrededor de 2000-3000. */
.swal2-container {
    z-index: 9999 !important; 
}
</style>