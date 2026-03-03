// src/stores/userManagementStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import userService from '@/services/userService.js'

export const useUserManagementStore = defineStore('userManagement', () => {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedUser = ref(null)

  const getUsers = computed(() => users.value)

  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await userService.getAll()
      users.value = response.data.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al obtener usuarios'
      console.error('Error fetching users:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchUser = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await userService.getById(id)
      selectedUser.value = response.data.data || response.data
      return selectedUser.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al obtener el usuario'
      console.error('Error fetching user:', err)
    } finally {
      loading.value = false
    }
  }

  const createUser = async (userData) => {
    loading.value = true
    error.value = null
    try {
      const response = await userService.create(userData)
      const newUser = response.data.data || response.data
      users.value.push(newUser)
      return newUser
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear usuario'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id, userData) => {
    loading.value = true
    error.value = null
    try {
      const response = await userService.update(id, userData)
      const updated = response.data.data || response.data
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = updated
      }
      if (selectedUser.value?.id === id) {
        selectedUser.value = updated
      }
      return updated
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar usuario'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id) => {
    loading.value = true
    error.value = null
    try {
      await userService.delete(id)
      users.value = users.value.filter(u => u.id !== id)
      if (selectedUser.value?.id === id) {
        selectedUser.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al eliminar usuario'
      throw err
    } finally {
      loading.value = false
    }
  }

  const assignRoles = async (userId, roleIds) => {
    loading.value = true
    error.value = null
    try {
      const response = await userService.assignRoles(userId, roleIds)
      // Actualizar usuario en la lista
      const index = users.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        users.value[index] = response.data.data || response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al asignar roles'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getUserRoles = async (userId) => {
    try {
      const response = await userService.getUserRoles(userId)
      return response.data.data || response.data
    } catch (err) {
      console.error('Error fetching user roles:', err)
      throw err
    }
  }

  return {
    users,
    loading,
    error,
    selectedUser,
    getUsers,
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    assignRoles,
    getUserRoles
  }
})
