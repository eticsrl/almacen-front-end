import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as supplierService from '@/services/supplier'

export const useSupplierStore = defineStore('supplier', () => {
  const suppliers = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchSuppliers = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await supplierService.getAll()
      suppliers.value = response.data.suppliers
    } catch (err) {
      error.value = err
      console.error('Error al cargar proveedores:', err)
    } finally {
      loading.value = false
    }
  }

  const createSupplier = async (payload) => {
    const response = await supplierService.create(payload)
    suppliers.value.push(response.data.data)
    return response.data.data
  }

  const updateSupplier = async (id, payload) => {
    const response = await supplierService.update(id, payload)
    const index = suppliers.value.findIndex(s => s.id === id)
    if (index !== -1) suppliers.value[index] = response.data.data
    return response.data.data
  }

  const deleteSupplier = async (id) => {
    await supplierService.remove(id)
    suppliers.value = suppliers.value.filter(s => s.id !== id)
  }

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
  }
})
