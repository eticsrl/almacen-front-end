// stores/documentTypeStore.js

import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as documentTypeService from '@/services/documentType'

export const useDocumentTypeStore = defineStore('documentType', () => {
  const documentTypes = ref([])
  const loading = ref(false)
  const error = ref(null)

  const getListFromResponse = (response) => {
    const body = response?.data
    if (Array.isArray(body?.data)) return body.data
    if (Array.isArray(body?.documentTypes)) return body.documentTypes
    if (Array.isArray(body?.documentType)) return body.documentType
    if (Array.isArray(body)) return body
    return []
  }

  const getRecordFromResponse = (response) => {
    const body = response?.data
    return body?.data || body?.documentType || body?.document_type || body || null
  }

  const fetchDocumentTypes = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await documentTypeService.getAll(params)
      documentTypes.value = getListFromResponse(response)
    } catch (err) {
      error.value = err
      console.error('Error al obtener tipos de documentos:', err)
    } finally {
      loading.value = false
    }
  }

  const createDocumentType = async (payload) => {
    try {
      const response = await documentTypeService.create(payload)
      const created = getRecordFromResponse(response)
      if (created) {
        documentTypes.value.push(created)
      }
      return created
    } catch (err) {
      console.error('Error al crear tipo de documento:', err)
      throw err
    }
  }

  const updateDocumentType = async (id, payload) => {
    try {
      const response = await documentTypeService.update(id, payload)
      const updated = getRecordFromResponse(response)
      const index = documentTypes.value.findIndex(dt => dt.id === id)
      if (index !== -1 && updated) {
        documentTypes.value[index] = updated
      }
      return updated
    } catch (err) {
      console.error('Error al actualizar tipo de documento:', err)
      throw err
    }
  }

  const deleteDocumentType = async (id) => {
    try {
      await documentTypeService.remove(id)
      documentTypes.value = documentTypes.value.filter(dt => dt.id !== id)
    } catch (err) {
      console.error('Error al eliminar tipo de documento:', err)
      throw err
    }
  }

  return {
    documentTypes,
    loading,
    error,
    fetchDocumentTypes,
    createDocumentType,
    updateDocumentType,
    deleteDocumentType
  }
})







/*import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as documentTypeService from '@/services/documentType.js'
import { ElMessage } from 'element-plus'

export const useDocumentTypeStore = defineStore('documentType', () => {
  const documentTypes = ref([])
  const loading = ref(false)
  const current = ref(null)

  const fetchDocumentTypes = async (params = {}) => {
    loading.value = true
    try {
      const response = await documentTypeService.getAll(params)
      documentTypes.value = response.data.data // Ajustado a estructura del backend
    } catch (error) {
      console.error('Error al obtener tipos de documento:', error)
      ElMessage.error('Error al cargar datos')
    } finally {
      loading.value = false
    }
  }

  const fetchDocumentType = async (id) => {
    try {
      const response = await documentTypeService.getById(id)
      current.value = response.data.data
    } catch (error) {
      console.error('Error al obtener el tipo de documento:', error)
      ElMessage.error('No se pudo cargar el registro')
    }
  }

  const create = async (payload) => {
    try {
      const response = await documentTypeService.create(payload)
      ElMessage.success('Tipo de documento creado exitosamente')
      await fetchDocumentTypes()
      return response.data
    } catch (error) {
      console.error('Error al crear tipo de documento:', error)
      throw error
    }
  }

  const update = async (id, payload) => {
    try {
      const response = await documentTypeService.update(id, payload)
      ElMessage.success('Tipo de documento actualizado exitosamente')
      await fetchDocumentTypes()
      return response.data
    } catch (error) {
      console.error('Error al actualizar tipo de documento:', error)
      throw error
    }
  }

  const destroy = async (id) => {
    try {
      await documentTypeService.destroy(id)
      ElMessage.success('Tipo de documento eliminado exitosamente')
      await fetchDocumentTypes()
    } catch (error) {
      console.error('Error al eliminar tipo de documento:', error)
      ElMessage.error('No se pudo eliminar el registro')
    }
  }

  return {
    documentTypes,
    loading,
    current,
    fetchDocumentTypes,
    fetchDocumentType,
    create,
    update,
    destroy,
  }
})



/*import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as documentType from '@/services/documentType.js'

export const useDocumentTypeStore = defineStore('documentType', () => {
  const documentTypes = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchDocumentTypes = async (categoriaId = null) => {
    loading.value = true
    error.value = null
    try {
      const response = await documentType.getAll(categoriaId)
      documentTypes.value = response.data.documentType //|| [] // por el uso de Resource + paginate
      console.log("documentypeStore",documentTypes.value)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  const addDocumentType = async (payload) => {
    try {
      await documentType.create(payload)
      await fetchDocumentTypes() // Recargar lista
    } catch (err) {
      throw err
    }
  }

  const updateDocumentType = async (id, payload) => {
    try {
      await documentType.update(id, payload)
      await fetchDocumentTypes()
    } catch (err) {
      throw err
    }
  }

  const deleteDocumentType = async (id) => {
    try {
      await documentType.destroy(id)
      await fetchDocumentTypes()
    } catch (err) {
      throw err
    }
  }

  const getDocumentType = async (id) => {
    try {
      const response = await getById(id)
      return response.data
    } catch (err) {
      throw err
    }
  }

  return {
    documentTypes,
    loading,
    error,
    fetchDocumentTypes,
    addDocumentType,
    updateDocumentType,
    deleteDocumentType,
    getDocumentType
  }
})*/
