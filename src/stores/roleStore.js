// src/stores/roleStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import roleService from '@/services/role.js'

export const useRoleStore = defineStore('role', () => {
  const roles = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedRole = ref(null)

  const getRoles = computed(() => roles.value)

  const fetchRoles = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await roleService.getAll()
      roles.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al obtener roles'
      console.error('Error fetching roles:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchRole = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await roleService.getById(id)
      selectedRole.value = response.data.data || response.data
      return selectedRole.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al obtener el rol'
      console.error('Error fetching role:', err)
    } finally {
      loading.value = false
    }
  }

  const createRole = async (roleData) => {
    loading.value = true
    error.value = null
    try {
      const response = await roleService.create(roleData)
      const newRole = response.data.data || response.data
      roles.value.push(newRole)
      return newRole
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear rol'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateRole = async (id, roleData) => {
    loading.value = true
    error.value = null
    try {
      const response = await roleService.update(id, roleData)
      const updated = response.data.data || response.data
      const index = roles.value.findIndex(r => r.id === id)
      if (index !== -1) {
        roles.value[index] = updated
      }
      if (selectedRole.value?.id === id) {
        selectedRole.value = updated
      }
      return updated
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar rol'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteRole = async (id) => {
    loading.value = true
    error.value = null
    try {
      await roleService.delete(id)
      roles.value = roles.value.filter(r => r.id !== id)
      if (selectedRole.value?.id === id) {
        selectedRole.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al eliminar rol'
      throw err
    } finally {
      loading.value = false
    }
  }

  const assignPermissions = async (roleId, permissionIds) => {
    loading.value = true
    error.value = null
    try {
      const response = await roleService.assignPermissions(roleId, permissionIds)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al asignar permisos'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getRolePermissions = async (roleId) => {
    try {
      const response = await roleService.getPermissions(roleId)
      return response.data.data || response.data
    } catch (err) {
      console.error('Error fetching role permissions:', err)
      throw err
    }
  }

  return {
    roles,
    loading,
    error,
    selectedRole,
    getRoles,
    fetchRoles,
    fetchRole,
    createRole,
    updateRole,
    deleteRole,
    assignPermissions,
    getRolePermissions
  }
})
