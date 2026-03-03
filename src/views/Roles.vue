<!-- src/views/Roles.vue -->
<template>
  <div class="roles-container">
    <div class="roles-header">
      <h1>Gestión de Roles</h1>
      <el-button type="primary" @click="showDialog = true">➕ Nuevo Rol</el-button>
    </div>

    <!-- Tabla de roles -->
    <el-table :data="roleStore.roles" stripe border loading={roleStore.loading} style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="Nombre" width="200" />
      <el-table-column prop="description" label="Descripción" />
      <el-table-column label="Acciones" width="280" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="editRole(row)">Editar</el-button>
          <el-button type="success" size="small" @click="managePermissions(row)">Permisos</el-button>
          <el-popconfirm
            title="¿Estás seguro de eliminar este rol?"
            @confirm="deleteRole(row.id)"
          >
            <template #reference>
              <el-button type="danger" size="small">Eliminar</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- Dialog para crear/editar roles -->
    <el-dialog 
      v-model="showDialog" 
      :title="isEditing ? 'Editar Rol' : 'Nuevo Rol'"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="form" label-width="120px">
        <el-form-item label="Nombre *">
          <el-input v-model="form.name" placeholder="Nombre del rol" />
        </el-form-item>
        <el-form-item label="Descripción">
          <el-input v-model="form.description" type="textarea" placeholder="Descripción del rol" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">Cancelar</el-button>
        <el-button type="primary" @click="saveRole" :loading="roleStore.loading">
          {{ isEditing ? 'Actualizar' : 'Crear' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Dialog para asignar permisos -->
    <el-dialog 
      v-model="showPermissionsDialog" 
      title="Asignar Permisos"
      width="600px"
    >
      <div class="permissions-container">
        <el-checkbox-group v-model="selectedPermissions">
          <div class="permissions-grid">
            <el-checkbox 
              v-for="permission in permissionStore.permissions"
              :key="permission.id"
              :label="permission.id"
            >
              <div class="permission-item">
                <strong>{{ permission.name }}</strong>
                <p style="color: #666; font-size: 12px;">{{ permission.description }}</p>
              </div>
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
      <template #footer>
        <el-button @click="showPermissionsDialog = false">Cancelar</el-button>
        <el-button type="primary" @click="savePermissions" :loading="roleStore.loading">
          Guardar Permisos
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoleStore } from '@/stores/roleStore.js'
import { usePermissionStore } from '@/stores/permissionStore.js'

const roleStore = useRoleStore()
const permissionStore = usePermissionStore()

const showDialog = ref(false)
const showPermissionsDialog = ref(false)
const isEditing = ref(false)
const selectedRole = ref(null)
const selectedPermissions = ref([])

const form = ref({
  name: '',
  description: ''
})

onMounted(async () => {
  await roleStore.fetchRoles()
  await permissionStore.fetchPermissions()
})

const resetForm = () => {
  form.value = { name: '', description: '' }
  isEditing.value = false
  selectedRole.value = null
}

const editRole = (role) => {
  isEditing.value = true
  selectedRole.value = role
  form.value = { ...role }
  showDialog.value = true
}

const saveRole = async () => {
  if (!form.value.name.trim()) {
    ElMessage.error('Por favor ingresa el nombre del rol')
    return
  }

  try {
    if (isEditing.value) {
      await roleStore.updateRole(selectedRole.value.id, form.value)
      ElMessage.success('Rol actualizado exitosamente')
    } else {
      await roleStore.createRole(form.value)
      ElMessage.success('Rol creado exitosamente')
    }
    showDialog.value = false
    resetForm()
  } catch (error) {
    ElMessage.error(roleStore.error || 'Error al guardar el rol')
  }
}

const deleteRole = async (id) => {
  try {
    await roleStore.deleteRole(id)
    ElMessage.success('Rol eliminado exitosamente')
  } catch (error) {
    ElMessage.error(roleStore.error || 'Error al eliminar el rol')
  }
}

const managePermissions = async (role) => {
  selectedRole.value = role
  try {
    const permissions = await roleStore.getRolePermissions(role.id)
    selectedPermissions.value = permissions.map(p => p.id)
  } catch (error) {
    selectedPermissions.value = []
  }
  showPermissionsDialog.value = true
}

const savePermissions = async () => {
  try {
    await roleStore.assignPermissions(selectedRole.value.id, selectedPermissions.value)
    ElMessage.success('Permisos asignados exitosamente')
    showPermissionsDialog.value = false
  } catch (error) {
    ElMessage.error(roleStore.error || 'Error al asignar permisos')
  }
}
</script>

<style scoped lang="scss">
.roles-container {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.roles-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    margin: 0;
    color: #333;
  }
}

.permissions-container {
  max-height: 400px;
  overflow-y: auto;
}

.permissions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  .el-checkbox {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      background-color: #f9f9f9;
      border-color: #509EFC;
    }
  }
}

.permission-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    color: #333;
  }
}
</style>
