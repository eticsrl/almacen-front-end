// src/services/role.js
import api from './api'

export default {
  // Obtener todos los roles
  getAll() {
    return api.get('/roles')
  },

  // Obtener un rol por ID
  getById(id) {
    return api.get(`/roles/${id}`)
  },

  // Crear un nuevo rol
  create(roleData) {
    return api.post('/roles', roleData)
  },

  // Actualizar un rol
  update(id, roleData) {
    return api.put(`/roles/${id}`, roleData)
  },

  // Eliminar un rol
  delete(id) {
    return api.delete(`/roles/${id}`)
  },

  // Asignar permisos a un rol
  assignPermissions(roleId, permissionIds) {
    return api.post(`/roles/${roleId}/permissions`, { permission_ids: permissionIds })
  },

  // Obtener permisos de un rol
  getPermissions(roleId) {
    return api.get(`/roles/${roleId}/permissions`)
  }
}
