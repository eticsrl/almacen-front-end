import api from './api'

const resource = '/pharmaceuticalForms'

export const getAll = () => {
  return api.get(resource)
}

export const getById = (id) => {
  return api.get(`${resource}/${id}`)
}

export const create = (payload) => {
  return api.post(resource, payload)
}

export const update = (id, payload) => {
  return api.put(`${resource}/${id}`, payload)
}

export const remove = (id) => {
  return api.delete(`${resource}/${id}`)
}
