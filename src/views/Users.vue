<!-- src/views/Users.vue -->
<template>
  <div class="users-container">
    <div class="users-header">
      <h1>Gestión de Usuarios</h1>
      <el-button type="primary" @click="showDialog = true">➕ Nuevo Usuario</el-button>
    </div>

    <!-- Tabla de usuarios -->
    <el-table :data="userStore.users" stripe border :loading="userStore.loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="Nombre" width="200" />
      <el-table-column prop="email" label="Email" width="250" />
      <el-table-column label="Roles" width="200">
        <template #default="{ row }">
          <el-tag v-for="role in row.roles" :key="role.id" style="margin: 2px;">
            {{ role.name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Acciones" width="350" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="editUser(row)">Editar</el-button>
          <el-button type="success" size="small" @click="manageRoles(row)">Asignar Roles</el-button>
          <el-popconfirm
            title="¿Estás seguro de eliminar este usuario?"
            @confirm="deleteUser(row.id)"
          >
            <template #reference>
              <el-button type="danger" size="small">Eliminar</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- Dialog para crear/editar usuarios -->
    <el-dialog 
      v-model="showDialog" 
      :title="isEditing ? 'Editar Usuario' : 'Nuevo Usuario'"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="form" label-width="120px">
        <el-form-item label="Nombre *">
          <el-input v-model="form.name" placeholder="Nombre del usuario" />
        </el-form-item>
        <el-form-item label="Email *">
          <el-input v-model="form.email" type="email" placeholder="tu@email.com" />
        </el-form-item>
        <el-form-item label="Avatar">
          <el-input v-model="form.avatar" placeholder="URL del avatar (opcional)" />
        </el-form-item>
        <el-form-item label="Almacen">
          <el-select v-model="form.entity_id" placeholder="Seleccionar entidad" clearable>
            <el-option
              v-for="ent in entities"
              :key="ent.id"
              :label="ent.descripcion"
              :value="ent.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="isEditing ? 'Contraseña (opcional)' : 'Contraseña *'">
          <el-input v-model="form.password" type="password" placeholder="Contraseña" show-password />
        </el-form-item>
        <el-form-item :label="isEditing ? 'Confirmar (opcional)' : 'Confirmar *'">
          <el-input v-model="form.password_confirmation" type="password" placeholder="Confirmar contraseña" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">Cancelar</el-button>
        <el-button type="primary" @click="saveUser" :loading="userStore.loading">
          {{ isEditing ? 'Actualizar' : 'Crear' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Dialog para asignar roles -->
    <el-dialog 
      v-model="showRolesDialog" 
      title="Asignar Roles"
      width="600px"
    >
      <div class="roles-container">
        <el-checkbox-group v-model="selectedRoles">
          <div class="roles-grid">
            <el-checkbox 
              v-for="role in roleStore.roles"
              :key="role.id"
              :label="role.id"
            >
              <div class="role-item">
                <strong>{{ role.name }}</strong>
                <p style="color: #666; font-size: 12px;">{{ role.description }}</p>
              </div>
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
      <template #footer>
        <el-button @click="showRolesDialog = false">Cancelar</el-button>
        <el-button type="primary" @click="saveRoles" :loading="userStore.loading">
          Guardar Roles
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserManagementStore } from '@/stores/userManagementStore.js'
import { useRoleStore } from '@/stores/roleStore.js'

import entityService from '@/services/entity.js'

const userStore = useUserManagementStore()
const roleStore = useRoleStore()

const showDialog = ref(false)
const showRolesDialog = ref(false)
const isEditing = ref(false)
const selectedUser = ref(null)
const selectedRoles = ref([])

const entities = ref([])
const form = ref({
  name: '',
  email: '',
  avatar: '',
  entity_id: null,
  password: '',
  password_confirmation: ''
})

onMounted(async () => {
  await userStore.fetchUsers()
  await roleStore.fetchRoles()
  try {
    const resp = await entityService.getAll()
    entities.value = resp.data.data || resp.data
  } catch (e) {
    entities.value = []
  }
})

const resetForm = () => {
  form.value = { name: '', email: '', avatar: '', entity_id: null, password: '', password_confirmation: '' }
  isEditing.value = false
  selectedUser.value = null
}

const editUser = async (user) => {
  isEditing.value = true
  selectedUser.value = user
  // Try to fetch full user data (avatar, entity) from API, fallback to provided user
  try {
    const full = await userStore.fetchUser(user.id)
    selectedUser.value = full || user
  } catch (e) {
    selectedUser.value = user
  }

  form.value = {
    name: selectedUser.value.name || '',
    email: selectedUser.value.email || '',
    avatar: selectedUser.value.avatar || '',
    entity_id: selectedUser.value.entity?.id || selectedUser.value.entity_id || null,
    password: '',
    password_confirmation: ''
  }
  showDialog.value = true
}

const saveUser = async () => {
  if (!form.value.name || !form.value.name.trim()) {
    ElMessage.error('Por favor ingresa el nombre')
    return
  }

  if (!form.value.email || !form.value.email.trim()) {
    ElMessage.error('Por favor ingresa el email')
    return
  }

  const userData = {
    name: form.value.name,
    email: form.value.email
  }

  // include optional avatar/entity
  if (form.value.avatar !== undefined && form.value.avatar !== '') userData.avatar = form.value.avatar
  if (form.value.entity_id !== undefined && form.value.entity_id !== null) userData.entity_id = form.value.entity_id

  if (!isEditing.value) {
    if (!form.value.password || !form.value.password.trim()) {
      ElMessage.error('Por favor ingresa una contraseña')
      return
    }
    if (form.value.password !== form.value.password_confirmation) {
      ElMessage.error('Las contraseñas no coinciden')
      return
    }
    userData.password = form.value.password
    userData.password_confirmation = form.value.password_confirmation
  } else {
    // editing: include password only if provided
    if (form.value.password && form.value.password.trim()) {
      if (form.value.password !== form.value.password_confirmation) {
        ElMessage.error('Las contraseñas no coinciden')
        return
      }
      userData.password = form.value.password
      userData.password_confirmation = form.value.password_confirmation
    }
  }

  try {
    if (isEditing.value && selectedUser.value && selectedUser.value.id) {
      await userStore.updateUser(selectedUser.value.id, userData)
      ElMessage.success('Usuario actualizado exitosamente')
    } else {
      await userStore.createUser(userData)
      ElMessage.success('Usuario creado exitosamente')
    }
    showDialog.value = false
    resetForm()
    await userStore.fetchUsers()
  } catch (error) {
    ElMessage.error(userStore.error || 'Error al guardar el usuario')
  }
}

const deleteUser = async (id) => {
  try {
    await userStore.deleteUser(id)
    ElMessage.success('Usuario eliminado exitosamente')
    await userStore.fetchUsers()
  } catch (error) {
    ElMessage.error(userStore.error || 'Error al eliminar el usuario')
  }
}

const manageRoles = async (user) => {
  selectedUser.value = user
  try {
    const roles = await userStore.getUserRoles(user.id)
    selectedRoles.value = roles.map(r => r.id)
  } catch (error) {
    selectedRoles.value = []
  }
  showRolesDialog.value = true
}

const saveRoles = async () => {
  if (!selectedUser.value || !selectedUser.value.id) return
  try {
    await userStore.assignRoles(selectedUser.value.id, selectedRoles.value)
    ElMessage.success('Roles asignados exitosamente')
    showRolesDialog.value = false
    await userStore.fetchUsers() // Recargar lista
  } catch (error) {
    ElMessage.error(userStore.error || 'Error al asignar roles')
  }
}
</script>

<style scoped lang="scss">
.users-container {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    margin: 0;
    color: #333;
  }
}

.roles-container {
  max-height: 400px;
  overflow-y: auto;
}

.roles-grid {
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

.role-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    color: #333;
  }
}
</style>
