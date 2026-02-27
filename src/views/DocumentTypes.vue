<template>
  <div>
    <el-card>
      <div class="flex justify-between mb-4">
        <h2 class="text-lg font-bold">Tipos de Documentos</h2>
        <el-button type="primary" @click="showModal = true">Nuevo</el-button>
      </div>

      <el-table :data="documentTypes"
         v-loading="loading"
         stripe border
         style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="descripcion" label="Descripción" />
        <el-table-column prop="categoria" label="Categoria" />
        <el-table-column prop="cod_servicio" label="Cod. Servicio" />
        <el-table-column label="Acciones" width="180">
          <template #default="scope">
            <el-button size="small" @click="edit(scope.row)">Editar</el-button>
            <el-button size="small" type="danger" @click="remove(scope.row.id)">Eliminar</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Modal -->
      <el-dialog :title="editando ? 'Editar' : 'Nuevo'" v-model="showModal">
        <el-form :model="form" label-width="120px">
          <el-form-item label="Categoría" prop="categoria_id">
          <el-select
            v-model="form.categoria_id"
            placeholder="Seleccione una categoría"
            filterable
            clearable
          >
            <el-option
              v-for="cat in categoryStore.categories"
              :key="cat.id"
              :label="cat.descripcion"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Descripción">
            <el-input v-model="form.descripcion" />
          </el-form-item>
          <el-form-item label="Cod. Servicio">
            <el-input v-model="form.cod_servicio" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showModal = false">Cancelar</el-button>
          <el-button type="primary" @click="save">Guardar</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDocumentTypeStore } from '@/stores/documentTypeStore'

import { useCategoryStore } from '@/stores/categoryStore'

const store = useDocumentTypeStore()
const categoryStore = useCategoryStore()

const { documentTypes, fetchDocumentTypes, createDocumentType, updateDocumentType, deleteDocumentType, loading } = store

const showModal = ref(false)
const editando = ref(false)
const form = ref({
  descripcion: '',
  cod_servicio: '',
  //categoria_id: ''

  categoria_id: null,
  //usr: '',
  estado_id: 28

})
const editingId = ref(null)

onMounted(() => {
  fetchDocumentTypes()
  categoryStore.fetchCategories()
})

const save = async () => {
  try {
    if (editando.value) {
      await updateDocumentType(editingId.value, form.value)
    } else {
      await createDocumentType(form.value)
    }
    showModal.value = false
    reset()
  } catch (e) {
    console.error(e)
  }
}

const edit = (row) => {
  editingId.value = row.id
  form.value = { ...row }
  editando.value = true
  showModal.value = true
}

const remove = async (id) => {
  await deleteDocumentType(id)
}

const reset = () => {
  form.value = {
    descripcion: '',
    cod_servicio: '',
    categoria_id: ''
  }
  editingId.value = null
  editando.value = false
}
</script>
<style scoped>
.el-card {
  padding: 20px;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}

.page-header {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--el-text-color-primary);
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
  gap: 10px;
}

.el-table th {
  background-color: var(--el-fill-color-light);
  font-weight: 600;
}

.el-table .el-button {
  padding: 4px 10px;
  font-size: 13px;
}

.dialog-footer {
  text-align: right;
  margin-top: 16px;
}

.el-dialog__header {
  font-weight: 600;
  font-size: 1.1rem;
}
</style>


