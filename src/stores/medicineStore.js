import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getAll,
  getById,
  create,
  update,
  destroy
} from '@/services/medicine'

export const useMedicineStore = defineStore('medicine', () => {
  const medicines = ref([])
  const loading = ref(false)
  const currentMedicine = ref(null)
  const errors = ref(null)

  const fetchMedicines = async () => {
    loading.value = true
    try {
      const response = await getAll()
      medicines.value = response.data.data
    } catch (error) {
      console.error('Error al obtener medicamentos:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchMedicine = async (id) => {
    loading.value = true
    try {
      const response = await getById(id)
      currentMedicine.value = response.data.data
    } catch (error) {
      console.error('Error al obtener medicamento:', error)
    } finally {
      loading.value = false
    }
  }

  const createMedicine = async (payload) => {
    errors.value = null
    try {
      const response = await create(payload)
      medicines.value.push(response.data.data)
      return response
    } catch (error) {
      if (error.response && error.response.status === 422) {
        errors.value = error.response.data.errors
      }
      throw error
    }
  }

  const updateMedicine = async (id, payload) => {
    errors.value = null
    try {
      const response = await update(id, payload)
      const index = medicines.value.findIndex(m => m.id === id)
      if (index !== -1) {
        medicines.value[index] = response.data.data
      }
      return response
    } catch (error) {
      if (error.response && error.response.status === 422) {
        errors.value = error.response.data.errors
      }
      throw error
    }
  }

  const deleteMedicine = async (id) => {
    try {
      await destroy(id)
      medicines.value = medicines.value.filter(m => m.id !== id)
    } catch (error) {
      console.error('Error al eliminar medicamento:', error)
      throw error
    }
  }

  return {
    medicines,
    loading,
    currentMedicine,
    errors,
    fetchMedicines,
    fetchMedicine,
    createMedicine,
    updateMedicine,
    deleteMedicine
  }
})
