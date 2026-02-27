import api from './api'

export default {
  getAll(params) {
    return api.get('/entities', { params })
  },
  getById(id) {
    return api.get(`/entities/${id}`)
  },
  create(data) {
    return api.post('/entities', data)
  },
  update(id, data) {
    return api.put(`/entities/${id}`, data)
  },
  remove(id) {
    return api.delete(`/entities/${id}`)
  }
}