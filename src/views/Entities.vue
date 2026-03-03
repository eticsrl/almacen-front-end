<template>
  <div class="entities-page">
    <el-card shadow="always">
      <div class="header">
        <h2>Entidades de Almacén</h2>
        <el-button type="primary" @click="openModal()">+ Nueva entidad</el-button>
      </div>

      <div class="filter-container">
        <el-input
          v-model="search"
          placeholder="Buscar por descripción"
          clearable
          class="search-input"
          @input="applyFilter"
        />
      </div>

      <el-table
        :data="filteredEntities"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="descripcion" label="Descripción" />
        <el-table-column label="Acciones" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="openModal(scope.row)">Editar</el-button>
            <el-button type="danger" size="small" @click="confirmDelete(scope.row.id)">Eliminar</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="total > 0"
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="10"
        :current-page.sync="page"
        @current-change="fetchData"
      />
    </el-card>

    <el-dialog :title="form.id ? 'Editar Entidad' : 'Nueva Entidad'" v-model="modalVisible">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="Descripción" prop="descripcion">
          <el-input v-model="form.descripcion" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="modalVisible = false">Cancelar</el-button>
        <el-button type="primary" @click="handleSubmit">Guardar</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useEntityStore } from '@/stores/entityStore'

const store = useEntityStore()
const { entities, fetchEntities, createEntity, updateEntity, deleteEntity, loading, total } = store

const search = ref('')
const page = ref(1)

const filteredEntities = computed(() => {
  if (!search.value) return entities
  return entities.filter(e => e.descripcion.toLowerCase().includes(search.value.toLowerCase()))
})

const modalVisible = ref(false)
const form = ref({ id: null, descripcion: '' })
const formRef = ref()

const rules = {
  descripcion: [{ required: true, message: 'Descripción requerida', trigger: 'blur' }]
}

const openModal = (entity = null) => {
  if (entity) {
    form.value = { ...entity }
  } else {
    form.value = { id: null, descripcion: '' }
  }
  modalVisible.value = true
}

const handleSubmit = () => {
  formRef.value.validate(async valid => {
    if (!valid) return
    try {
      if (form.value.id) {
        await updateEntity(form.value.id, form.value)
        ElMessage.success('Entidad actualizada')
      } else {
        await createEntity(form.value)
        ElMessage.success('Entidad creada')
      }
      modalVisible.value = false
      fetchData()
    } catch (error) {
      ElMessage.error('Ocurrió un error')
      console.error(error)
    }
  })
}

const confirmDelete = (id) => {
  ElMessageBox.confirm(
    '¿Está seguro que desea eliminar esta entidad?',
    'Confirmar',
    {
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteEntity(id)
      ElMessage.success('Entidad eliminada')
      fetchData()
    } catch (error) {
      ElMessage.error('No se pudo eliminar')
    }
  })
}

const fetchData = async () => {
  await fetchEntities({ page: page.value, search: search.value })
}

const applyFilter = () => {
  page.value = 1
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.entities-page {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-container {
  margin-bottom: 16px;
}

.search-input {
  width: 300px;
}
</style>
