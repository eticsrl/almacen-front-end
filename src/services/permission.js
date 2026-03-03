// src/services/permission.js
import api from './api'

export default {
  // Obtener todos los permisos
  getAll() {
    return api.get('/permissions')
  },

  // Obtener un permiso por ID
  getById(id) {
    return api.get(`/permissions/${id}`)
  },

  // Crear un nuevo permiso
  create(permissionData) {
    return api.post('/permissions', permissionData)
  },

  // Actualizar un permiso
  update(id, permissionData) {
    return api.put(`/permissions/${id}`, permissionData)
  },

  // Eliminar un permiso
  delete(id) {
    return api.delete(`/permissions/${id}`)
  }
}
