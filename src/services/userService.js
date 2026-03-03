// src/services/userService.js
import api from './api'

export default {
  // Obtener todos los usuarios
  getAll() {
    return api.get('/users')
  },

  // Obtener un usuario por ID
  getById(id) {
    return api.get(`/users/${id}`)
  },

  // Crear nuevo usuario
  create(userData) {
    return api.post('/users', userData)
  },

  // Actualizar usuario
  update(id, userData) {
    return api.put(`/users/${id}`, userData)
  },

  // Eliminar usuario
  delete(id) {
    return api.delete(`/users/${id}`)
  },

  // Asignar roles a usuario
  assignRoles(userId, roleIds) {
    return api.post(`/users/${userId}/roles`, { role_ids: roleIds })
  },

  // Obtener roles de usuario
  getUserRoles(userId) {
    return api.get(`/users/${userId}/roles`)
  }
}
