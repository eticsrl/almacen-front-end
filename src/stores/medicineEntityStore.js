// src/stores/medicineEntityStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  fetchMedicineEntities,
  createMedicineEntity,
  getMedicineEntity,
  updateMedicineEntity,
  deleteMedicineEntity,
} from '@/api/medicineEntity.js'
import { ElMessage } from 'element-plus'



export const useMedicineEntityStore = defineStore('medicineEntity', () => {
  const medicineEntities = ref([])
  const totalEntities = ref(0)
  const selectedEntity = ref(null)
  const pharmaceuticalForms = ref([])
  const categories = ref([])
  const loading = ref(false)


  const loadMedicineEntities = async (filters = {}) => {
    loading.value = true
    try {
      const data = await fetchMedicineEntities(filters)
      medicineEntities.value = data.medicineEntities || []
      totalEntities.value = data.total || 0
    } catch (error) {
      console.error('Error al cargar entidades de medicamentos:', error)
      ElMessage.error('Error al cargar las entidades de medicamentos')
    } finally {
      loading.value = false
    }
  }

  
  const createMedicineEntityAction = async (entityData) => {
    try {
      await createMedicineEntity(entityData)
      ElMessage.success('Entidad de medicamento creada exitosamente')
      await loadMedicineEntities() // Recargar lista después de añadir
    } catch (error) {
      console.error('Error al crear la entidad de medicamento:', error)
      ElMessage.error('Error al crear la entidad de medicamento')
    }
  }

  
  const loadMedicineEntityDetails = async (id) => {
    try {
      const data = await getMedicineEntity(id)
      selectedEntity.value = data.medicineEntity
    } catch (error) {
      console.error('Error al cargar detalles de la entidad:', error)
      ElMessage.error('Error al cargar los detalles de la entidad')
    }
  }


  const updateMedicineEntityAction = async (id, entityData) => {
    try {
      await updateMedicineEntity(id, entityData)
      ElMessage.success('Entidad de medicamento actualizada exitosamente')
      await loadMedicineEntities() // Recargar lista después de actualizar
    } catch (error) {
      console.error('Error al actualizar la entidad de medicamento:', error)
      ElMessage.error('Error al actualizar la entidad de medicamento')
    }
  }

  
  const deleteMedicineEntityAction = async (id) => {
    try {
      await deleteMedicineEntity(id)
      ElMessage.success('Entidad de medicamento eliminada exitosamente')
      medicineEntities.value = medicineEntities.value.filter((entity) => entity.id !== id)
    } catch (error) {
      console.error('Error al eliminar la entidad de medicamento:', error)
      ElMessage.error('Error al eliminar la entidad de medicamento')
    }
  }

  return {
    medicineEntities,
    totalEntities,
    loading,
    selectedEntity,
    loadMedicineEntities,
    //loadSelectOptions,
    createMedicineEntityAction,
    loadMedicineEntityDetails,
    updateMedicineEntityAction,
    deleteMedicineEntityAction,
  }
})
