<template>
  <div>
    <el-card shadow="always">
      <div class="header">
        <h2>Personal del Servicio</h2>
        <div class="filter-service">
          <label>Filtrar por Servicio:</label>
          <el-select v-model="filterService" filterable clearable placeholder="Seleccionar servicio"
            style="width: 300px;">
            <el-option v-for="doc in serviceDocumentTypes" :key="doc.id" :label="doc.descripcion" :value="doc.id" />
          </el-select>
        </div>
        <el-button type="primary" @click="openModal()">Nuevo Personal</el-button>
      </div>

      <div class="filter-container">
        <el-input v-model="search" placeholder="Buscar por nombre y apellido" clearable @input="applyFilter" />
      </div>

      <el-table :data="filteredServicePersonals" stripe border style="width: 100%;" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="apellidos_nombres" label="Nombre y Apellido" min-width="250" />
        <el-table-column prop="id_service" label="Servicio" width="150">
          <template #default="{ row }">
            {{ row.document_type?.descripcion || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="estado" label="Estado" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.estado" :active-value="1" :inactive-value="0" disabled />
          </template>
        </el-table-column>
        <el-table-column label="Acciones" width="160">
          <template #default="scope">
            <el-button size="small" @click="openModal(scope.row)">Editar</el-button>
            <!--el-button size="small" type="danger" @click="handleDelete(scope.row.id)">Eliminar</el-button-->
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Modal -->
    <el-dialog :title="isEditing ? 'Editar Personal de Servicio' : 'Nuevo Personal de Servicio'" v-model="showModal"
      width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="150px">
        <el-form-item label="Nombre y Apellido" prop="apellidos_nombres">
          <el-input v-model="form.apellidos_nombres" placeholder="Ingrese nombre y apellido" />
        </el-form-item>
        <el-form-item label="Tipo de Servicio" prop="id_service">
          <el-select v-model="form.id_service" filterable clearable placeholder="Seleccionar servicio">
            <el-option v-for="doc in serviceDocumentTypes" :key="doc.id" :label="doc.descripcion" :value="doc.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Estado" prop="estado">
          <el-switch v-model="form.estado" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showModal = false">Cancelar</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
          {{ isEditing ? 'Actualizar' : 'Guardar' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useServicePersonalStore } from '@/stores/servicePersonalStore'
import { useDocumentTypeStore } from '@/stores/documentTypeStore'

const store = useServicePersonalStore()
const docTypeStore = useDocumentTypeStore()
const { servicePersonals, loading } = storeToRefs(store)
const { documentTypes } = storeToRefs(docTypeStore)
const { fetchServicePersonals, createServicePersonal, updateServicePersonal, deleteServicePersonal } = store

const showModal = ref(false)
const isEditing = ref(false)
const formRef = ref()
const isSubmitting = ref(false)
const form = ref({
  apellidos_nombres: '',
  estado: 1,
  id_service: null
})

const rules = {
  apellidos_nombres: [
    { required: true, message: 'Nombre y apellido es requerido', trigger: 'blur' },
    { min: 1, max: 255, message: 'Máximo 255 caracteres', trigger: 'blur' }
  ],
  id_service: [
    { required: true, message: 'Seleccione un tipo de servicio', trigger: 'change' }
  ]
}

const search = ref('')
const filterService = ref(null)
const serviceDocumentTypes = computed(() => {
  return (documentTypes.value || []).filter((doc) => {
    const categoriaId = doc?.categoria_id ?? doc?.id_categoria ?? doc?.category_id ?? doc?.categoria?.id
    return Number(categoriaId) === 8
  })
})

const filteredServicePersonals = computed(() => {
  let filtered = servicePersonals.value

  // Filtrar por búsqueda de nombre
  if (search.value) {
    filtered = filtered.filter(sp =>
      sp.apellidos_nombres.toLowerCase().includes(search.value.toLowerCase())
    )
  }

  // Filtrar por servicio
  if (filterService.value) {
    filtered = filtered.filter(sp => sp.id_service === filterService.value)
  }

  return filtered
})

onMounted(() => {
  console.log('[ServicePersonals] Vista montada, cargando datos...')
  fetchServicePersonals()
  docTypeStore.fetchDocumentTypes()
})

const openModal = (servicePersonal = null) => {
  if (servicePersonal) {
    isEditing.value = true
    form.value = {
      ...servicePersonal,
      estado: servicePersonal.estado === 0 ? 0 : 1
    }
  } else {
    isEditing.value = false
    form.value = {
      apellidos_nombres: '',
      estado: 1,
      id_service: null
    }
  }
  showModal.value = true
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    isSubmitting.value = true
    try {
      const payload = {
        apellidos_nombres: (form.value.apellidos_nombres || '').trim(),
        estado: form.value.estado === 0 ? 0 : 1,
        id_service: form.value.id_service != null ? Number(form.value.id_service) : null
      }

      if (isEditing.value) {
        await updateServicePersonal(form.value.id, payload)
        ElMessage.success('Actualizado correctamente')
      } else {
        await createServicePersonal(payload)
        ElMessage.success('Registrado correctamente')
      }
      showModal.value = false
    } catch (error) {
      console.error('Error al guardar personal de servicio:', error)
      console.error('Response:', error.response?.data)

      const backendErrors = error.response?.data?.errors
      const firstValidationError = backendErrors
        ? Object.values(backendErrors).flat()[0]
        : null

      const status = error.response?.status
      ElMessage.error(
        firstValidationError ||
        error.response?.data?.message ||
        (status ? `Error al guardar (HTTP ${status})` : 'Error al guardar')
      )
    } finally {
      isSubmitting.value = false
    }
  })
}

const handleDelete = (id) => {
  ElMessageBox.confirm('¿Estás seguro de eliminar este registro?', 'Confirmar', {
    type: 'warning'
  }).then(async () => {
    await deleteServicePersonal(id)
    ElMessage.success('Eliminado correctamente')
  })
}

const applyFilter = () => {
  // computed handles it
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-service {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 300px;
}

.filter-service label {
  font-weight: 500;
  white-space: nowrap;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
</style>
