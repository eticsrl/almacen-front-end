// src/stores/permissionStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import permissionService from '@/services/permission.js'

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedPermission = ref(null)

  const getPermissions = computed(() => permissions.value)

  const fetchPermissions = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await permissionService.getAll()
      permissions.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al obtener permisos'
      console.error('Error fetching permissions:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchPermission = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await permissionService.getById(id)
      selectedPermission.value = response.data.data || response.data
      return selectedPermission.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al obtener el permiso'
      console.error('Error fetching permission:', err)
    } finally {
      loading.value = false
    }
  }

  const createPermission = async (permissionData) => {
    loading.value = true
    error.value = null
    try {
      const response = await permissionService.create(permissionData)
      const newPermission = response.data.data || response.data
      permissions.value.push(newPermission)
      return newPermission
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear permiso'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePermission = async (id, permissionData) => {
    loading.value = true
    error.value = null
    try {
      const response = await permissionService.update(id, permissionData)
      const updated = response.data.data || response.data
      const index = permissions.value.findIndex(p => p.id === id)
      if (index !== -1) {
        permissions.value[index] = updated
      }
      if (selectedPermission.value?.id === id) {
        selectedPermission.value = updated
      }
      return updated
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar permiso'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePermission = async (id) => {
    loading.value = true
    error.value = null
    try {
      await permissionService.delete(id)
      permissions.value = permissions.value.filter(p => p.id !== id)
      if (selectedPermission.value?.id === id) {
        selectedPermission.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al eliminar permiso'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    permissions,
    loading,
    error,
    selectedPermission,
    getPermissions,
    fetchPermissions,
    fetchPermission,
    createPermission,
    updatePermission,
    deletePermission
  }
})
