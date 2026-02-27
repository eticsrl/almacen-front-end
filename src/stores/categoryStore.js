import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as categoryService from '@/services/category'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await categoryService.getAll()
      categories.value = response.data.categories 
      console.log("categoriasStore",categories.value)
    } catch (err) {
      error.value = err
      console.error('Error al cargar categorías:', err)
    } finally {
      loading.value = false
    }
  }

  const createCategory = async (payload) => {
    try {
      const response = await categoryService.create(payload)
      categories.value.push(response.data.category)
      return response.data.category
    } catch (err) {
      console.error('Error al crear categoría:', err)
      throw err
    }
  }

  const updateCategory = async (id, payload) => {
    try {
      const response = await categoryService.update(id, payload)
      const index = categories.value.findIndex(cat => cat.id === id)
      if (index !== -1) {
        categories.value[index] = response.data.category
      }
      return response.data.category
    } catch (err) {
      console.error('Error al actualizar categoría:', err)
      throw err
    }
  }

  const deleteCategory = async (id) => {
    try {
      await categoryService.destroy(id)
      
      await fetchCategories();
    } catch (err) {
      console.error('Error al eliminar categoría:', err)
      throw err
    }
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  }
})

