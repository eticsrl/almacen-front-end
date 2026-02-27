// src/services/medicineEntity.js
import api from '@/services/api.js'

// Obtener la lista de entidades de medicamentos con filtros
export const fetchMedicineEntities = async (params = {}) => {
  const response = await api.get('/medicineEntities', { params })
  return response.data
}

// Crear una nueva entidad de medicamento
export const createMedicineEntity = async (entityData) => {
  const response = await api.post('/medicineEntities', entityData)
  return response.data
}

// Obtener detalles de una entidad de medicamento específica
export const getMedicineEntity = async (id) => {
  const response = await api.get(`/medicineEntities/${id}`)
  return response.data
}

// Actualizar una entidad de medicamento existente
export const updateMedicineEntity = async (id, entityData) => {
  const response = await api.put(`/medicineEntities/${id}`, entityData)
  return response.data
}

// Eliminar una entidad de medicamento
export const deleteMedicineEntity = async (id) => {
  const response = await api.delete(`/medicineEntities/${id}`)
  return response.data
}
// Obtener opciones de formas farmacéuticas
export const fetchPharmaceuticalForms = async () => {
    const response = await api.get('/pharmaceuticalForms')
    return response.data
  }
  
  // Obtener opciones de categorías de medicamentos
  export const fetchCategories = async () => {
    const response = await api.get('/documentTypes')
    return response.data
  }