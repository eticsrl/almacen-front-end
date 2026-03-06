<template>
  <div>
    <el-card>
      <div class="row">
        <div class="col sm-6">
          <el-select v-model="filterCategory" placeholder="Seleccione una categoría" filterable clearable>
            <el-option v-for="cat in categoryStore.categories" :key="cat.id" :label="cat.descripcion" :value="cat.id" />
          </el-select>
        </div>
      </div>
      <div class="flex justify-between mb-4">

        <h2 class="text-lg font-bold">Tipos de Documentos</h2>
        <el-button type="primary" @click="openNewModal">Nuevo</el-button>
      </div>

      <el-table :data="documentTypes" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="descripcion" label="Descripción" />
        <el-table-column prop="categoria" label="Categoria" />
        <el-table-column label="Estado" width="120">
          <template #default="scope">
            <el-switch v-model="scope.row.estado" :active-value="1" :inactive-value="0" disabled />
          </template>
        </el-table-column>
        <el-table-column label="Acciones" width="180">
          <template #default="scope">
            <el-button size="small" @click="edit(scope.row)">Editar</el-button>
            <!--el-button size="small" type="danger" @click="remove(scope.row.id)">Eliminar</el-button-->
          </template>
        </el-table-column>
      </el-table>

      <!-- Modal -->
      <el-dialog :title="editando ? 'Editar' : 'Nuevo'" v-model="showModal" @close="handleCloseModal">
        <el-form :model="form" label-width="120px">
          <el-form-item label="Categoría" prop="categoria_id">
            <el-select v-model="form.categoria_id" placeholder="Seleccione una categoría" filterable clearable>
              <el-option v-for="cat in categoryStore.categories" :key="cat.id" :label="cat.descripcion"
                :value="cat.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="Descripción">
            <el-input v-model="form.descripcion" />
          </el-form-item>
          <el-form-item label="Estado" prop="estado">
            <el-switch v-model="form.estado" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="handleCloseModal">Cancelar</el-button>
          <el-button type="primary" @click="save">Guardar</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useDocumentTypeStore } from '@/stores/documentTypeStore'
import { useUserStore } from '@/stores/userStore'

import { useCategoryStore } from '@/stores/categoryStore'

const store = useDocumentTypeStore()
const categoryStore = useCategoryStore()
const userStore = useUserStore()

const { documentTypes, loading } = storeToRefs(store)
const { fetchDocumentTypes, createDocumentType, updateDocumentType, deleteDocumentType } = store

const showModal = ref(false)
const editando = ref(false)
const form = ref({
  descripcion: '',
  categoria_id: null,
  estado: 1
})
const editingId = ref(null)

// filter selector separate from the form used in the modal
const filterCategory = ref(null)

onMounted(() => {
  console.log('[DocTypes] mounted fetch')
  categoryStore.fetchCategories()
  // initial load, possibly with an existing filter
  fetchDocumentTypes({ categoria_id: filterCategory.value })
})

// whenever the selected category changes reload the list from server
watch(filterCategory, (val) => {
  fetchDocumentTypes({ categoria_id: val })
})

const save = async () => {
  try {
    const localUser = JSON.parse(localStorage.getItem('user') || 'null')
    const currentUserId = userStore.user?.id || localUser?.id || null

    const payload = {
      descripcion: (form.value.descripcion || '').trim(),
      categoria_id: form.value.categoria_id ?? null,
      estado: normalizeEstado(form.value.estado ?? form.value.estado_id),
      usuario_id: currentUserId
    }

    if (!payload.descripcion) {
      ElMessage.warning('La descripción es obligatoria')
      return
    }

    if (!payload.categoria_id) {
      ElMessage.warning('Debe seleccionar una categoría')
      return
    }

    if (!currentUserId) {
      ElMessage.error('No se pudo identificar el usuario actual. Vuelva a iniciar sesión.')
      return
    }

    if (editando.value) {
      await updateDocumentType(editingId.value, payload)
      ElMessage.success('Tipo de documento actualizado')
    } else {
      await createDocumentType(payload)
      ElMessage.success('Tipo de documento creado')
    }
    // refresh list to honour current filter
    await fetchDocumentTypes({ categoria_id: filterCategory.value })
    showModal.value = false
    reset()
  } catch (e) {
    const backendMessage = e?.response?.data?.message
    const validationErrors = e?.response?.data?.errors
    if (validationErrors && typeof validationErrors === 'object') {
      const firstError = Object.values(validationErrors).flat()[0]
      ElMessage.error(firstError || backendMessage || 'No se pudo guardar el tipo de documento')
    } else {
      ElMessage.error(backendMessage || 'No se pudo guardar el tipo de documento')
    }
    console.error('Error save DocumentTypes', {
      apiBase: import.meta.env.VITE_APP_BASE_API,
      payloadSent: {
        descripcion: (form.value.descripcion || '').trim(),
        categoria_id: form.value.categoria_id ?? null,
        estado: normalizeEstado(form.value.estado ?? form.value.estado_id),
        usuario_id: userStore.user?.id || JSON.parse(localStorage.getItem('user') || 'null')?.id || null
      },
      backendResponse: e?.response?.data,
      status: e?.response?.status
    })
  }
}

const edit = (row) => {
  editingId.value = row.id
  form.value = {
    ...row,
    categoria_id: getCategoryIdFromRow(row),
    estado: normalizeEstado(row.estado ?? row.estado_id)
  }
  editando.value = true
  showModal.value = true
}

const getCategoryIdFromRow = (row) => {
  if (row?.categoria_id) return row.categoria_id

  const byName = categoryStore.categories.find(
    c => c.descripcion?.trim()?.toLowerCase() === String(row?.categoria || '').trim().toLowerCase()
  )

  return byName?.id ?? null
}

const normalizeEstado = (value) => {
  if (typeof value === 'number') return value === 0 ? 0 : 1
  if (typeof value === 'boolean') return value ? 1 : 0

  const text = String(value ?? '').trim().toLowerCase()
  if (['0', 'false', 'inactivo', 'inactive', 'no'].includes(text)) return 0
  if (['1', 'true', 'activo', 'active', 'si', 'sí', 'yes'].includes(text)) return 1

  const numeric = Number(text)
  if (!Number.isNaN(numeric)) return numeric === 0 ? 0 : 1

  return 1
}

const openNewModal = () => {
  reset()
  showModal.value = true
}

const handleCloseModal = () => {
  showModal.value = false
  reset()
}

const remove = async (id) => {
  await deleteDocumentType(id)
}

const reset = () => {
  form.value = {
    descripcion: '',
    categoria_id: null,
    estado: 1
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
