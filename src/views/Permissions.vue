<!-- src/views/Permissions.vue -->
<template>
  <div class="permissions-container">
    <div class="permissions-header">
      <h1>Gestión de Permisos</h1>
      <el-button type="primary" @click="showDialog = true">➕ Nuevo Permiso</el-button>
    </div>

    <!-- Tabla de permisos -->
    <el-table :data="permissionStore.permissions" stripe border :loading="permissionStore.loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="Nombre" width="200" />
      <el-table-column prop="description" label="Descripción" />
      <el-table-column label="Acciones" width="200" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="editPermission(row)">Editar</el-button>
          <el-popconfirm
            title="¿Estás seguro de eliminar este permiso?"
            @confirm="deletePermission(row.id)"
          >
            <template #reference>
              <el-button type="danger" size="small">Eliminar</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- Dialog para crear/editar permisos -->
    <el-dialog 
      v-model="showDialog" 
      :title="isEditing ? 'Editar Permiso' : 'Nuevo Permiso'"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="form" label-width="120px">
        <el-form-item label="Nombre *">
          <el-input v-model="form.name" placeholder="Nombre del permiso (ej: view_users)" />
        </el-form-item>
        <el-form-item label="Descripción">
          <el-input v-model="form.description" type="textarea" placeholder="Descripción del permiso" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">Cancelar</el-button>
        <el-button type="primary" @click="savePermission" :loading="permissionStore.loading">
          {{ isEditing ? 'Actualizar' : 'Crear' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { usePermissionStore } from '@/stores/permissionStore.js'

const permissionStore = usePermissionStore()

const showDialog = ref(false)
const isEditing = ref(false)
const selectedPermission = ref(null)

const form = ref({
  name: '',
  description: ''
})

onMounted(async () => {
  await permissionStore.fetchPermissions()
})

const resetForm = () => {
  form.value = { name: '', description: '' }
  isEditing.value = false
  selectedPermission.value = null
}

const editPermission = (permission) => {
  isEditing.value = true
  selectedPermission.value = permission
  form.value = { ...permission }
  showDialog.value = true
}

const savePermission = async () => {
  if (!form.value.name.trim()) {
    ElMessage.error('Por favor ingresa el nombre del permiso')
    return
  }

  try {
    if (isEditing.value) {
      await permissionStore.updatePermission(selectedPermission.value.id, form.value)
      ElMessage.success('Permiso actualizado exitosamente')
    } else {
      await permissionStore.createPermission(form.value)
      ElMessage.success('Permiso creado exitosamente')
    }
    showDialog.value = false
    resetForm()
  } catch (error) {
    ElMessage.error(permissionStore.error || 'Error al guardar el permiso')
  }
}

const deletePermission = async (id) => {
  try {
    await permissionStore.deletePermission(id)
    ElMessage.success('Permiso eliminado exitosamente')
  } catch (error) {
    ElMessage.error(permissionStore.error || 'Error al eliminar el permiso')
  }
}
</script>

<style scoped lang="scss">
.permissions-container {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.permissions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    margin: 0;
    color: #333;
  }
}
</style>
