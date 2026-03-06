import api from './api'

// Obtener todos los service_personals
export const getAll = () => {
  return api.get('/servicePersonals')
}

// Crear un nuevo service_personal
export const create = (payload) => {
  return api.post('/servicePersonals', payload)
}

// Actualizar un service_personal existente
export const update = async (id, payload) => {
  try {
    return await api.put(`/servicePersonals/${id}`, payload)
  } catch (error) {
    const status = error?.response?.status
    const isNetworkLikeError = !error?.response

    const tryPostMethodOverride = async () => {
      return api.post(`/servicePersonals/${id}`, {
        ...payload,
        _method: 'PUT'
      })
    }

    if (isNetworkLikeError) {
      return tryPostMethodOverride()
    }

    if (status === 404 || status === 405) {
      return tryPostMethodOverride()
    }

    throw error
  }
}

// Eliminar (anular) un service_personal
export const destroy = (id) => {
  return api.delete(`/servicePersonals/${id}`)
}

// Obtener un solo service_personal por ID (opcional)
export const getById = (id) => {
  return api.get(`/servicePersonals/${id}`)
}
