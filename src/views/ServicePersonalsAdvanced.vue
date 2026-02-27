<template>
  <div>
    <el-card class="box-card">
      <div class="flex justify-between items-center mb-4">
        <h2>Servicios del Personal</h2>
        <el-button type="primary" @click="openModal()">Nuevo Servicio</el-button>
      </div>

      <!-- Barra de búsqueda -->
      <div class="search-bar mb-4">
        <el-input
          v-model="store.searchQuery"
          placeholder="Buscar por descripción o ID de personal"
          clearable
        />
      </div>

      <ServicePersonalDetailTable 
        :data="store.filteredServicePersonals"
        @edit="openModal"
        @delete="handleDelete"
      />
    </el-card>

    <!-- Modal -->
    <el-dialog 
      :title="editingServicePersonal ? 'Editar Servicio del Personal' : 'Nuevo Servicio del Personal'" 
      v-model="modalVisible"
      width="500px"
    >
      <ServicePersonalForm 
        ref="formRef"
        v-model="form"
      />

      <template #footer>
        <el-button @click="modalVisible = false">Cancelar</el-button>
        <el-button type="primary" @click="submitForm" :loading="isSubmitting">Guardar</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useServicePersonalStoreAdvanced } from '@/stores/servicePersonalStoreAdvanced'
import { ElMessageBox, ElMessage } from 'element-plus'
import ServicePersonalForm from '@/components/ServicePersonalForm.vue'
import ServicePersonalDetailTable from '@/components/ServicePersonalDetailTable.vue'

const store = useServicePersonalStoreAdvanced()
const formRef = ref(null)
const modalVisible = ref(false)
const editingServicePersonal = ref(null)
const isSubmitting = ref(false)

const form = reactive({
  personal_id: '',
  descripcion: '',
  fecha_inicio: null,
  fecha_fin: null
})

const resetForm = () => {
  Object.assign(form, {
    personal_id: '',
    descripcion: '',
    fecha_inicio: null,
    fecha_fin: null
  })
  editingServicePersonal.value = null
}

const openModal = (servicePersonal = null) => {
  resetForm()
  if (servicePersonal) {
    Object.assign(form, { ...servicePersonal })
    editingServicePersonal.value = servicePersonal.id
  }
  modalVisible.value = true
}

const submitForm = async () => {
  isSubmitting.value = true
  try {
    const isValid = await formRef.value.submitForm()
    if (!isValid) {
      ElMessage.error('Por favor complete el formulario correctamente')
      return
    }

    if (editingServicePersonal.value) {
      await store.updateServicePersonal(editingServicePersonal.value, form)
      ElMessage.success('Servicio del personal actualizado')
    } else {
      await store.createServicePersonal(form)
      ElMessage.success('Servicio del personal creado')
    }
    modalVisible.value = false
  } catch (err) {
    ElMessage.error('Error al guardar servicio del personal')
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = (id) => {
  ElMessageBox.confirm('¿Estás seguro de eliminar este servicio del personal?', 'Confirmar', {
    confirmButtonText: 'Sí',
    cancelButtonText: 'Cancelar',
    type: 'warning'
  }).then(async () => {
    try {
      await store.deleteServicePersonal(id)
      ElMessage.success('Servicio del personal eliminado')
    } catch (err) {
      ElMessage.error('Error al eliminar servicio del personal')
    }
  })
}

onMounted(() => {
  store.fetchServicePersonals()
})
</script>

<style scoped>
.box-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-bar {
  display: flex;
  gap: 10px;
}
</style>
