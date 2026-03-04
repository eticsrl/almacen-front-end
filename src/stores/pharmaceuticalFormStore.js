import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as pharmaceuticalFormService from '@/services/pharmaceuticalForm.js'

export const usePharmaceuticalFormStore = defineStore('pharmaceuticalForm', () => {
  const forms = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchPharmaceuticalForms = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await pharmaceuticalFormService.getAll()
      console.log('[pharmFormStore] API response', response.data)
      // try several paths if structure differs
      if (response.data.data) {
        forms.value = response.data.data
      } else if (response.data.pharmaceuticalForms) {
        forms.value = response.data.pharmaceuticalForms
      } else {
        // fallback to entire body
        forms.value = response.data
      }
      console.log('[pharmFormStore] assigned forms', forms.value)
    } catch (err) {
      error.value = err
      console.error('Error al cargar formas farmacéuticas:', err)
    } finally {
      loading.value = false
    }
  }
  const createForm = async (payload) => {
    try {
      const response = await pharmaceuticalFormService.create(payload)
      forms.value.push(response.data.data)
      return response.data.data
    } catch (err) {
      console.error('Error al crear forma farmacéutica:', err)
      throw err
    }
  }

  const updateForm = async (id, payload) => {
    try {
      const response = await pharmaceuticalFormService.update(id, payload)
      const index = forms.value.findIndex(f => f.id === id)
      if (index !== -1) {
        forms.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      console.error('Error al actualizar forma farmacéutica:', err)
      throw err
    }
  }

  const deleteForm = async (id) => {
    try {
      await pharmaceuticalFormService.remove(id)
      forms.value = forms.value.filter(f => f.id !== id)
    } catch (err) {
      console.error('Error al eliminar forma farmacéutica:', err)
      throw err
    }
  }

  return {
    forms,
    loading,
    error,
    fetchPharmaceuticalForms,
    createForm,
    updateForm,
    deleteForm
  }
})

