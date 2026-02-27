import api from './api'

export const getAll = (params) => api.get('/entries', { params })
export const getById = (id) => api.get(`/entries/${id}`)
export const createEntry = (payload) => api.post('/entries', payload)
export const updateEntry = (id, payload) => api.put(`/entries/${id}`, payload)
export const deleteEntry = (id) => api.delete(`/entries/${id}`)
//export const activateEntry = (id) => api.post('/entries/${id}/activate')
export const activateEntry = (id) => api.post(`/entries/${id}/activate`)
export const getDetailsWithStock = () => api.get('/entries/with-stock')
export const getEntryDetailsForReentry = () =>api.get('/entries/reentry')
export const getLotsByMedicine = (medicineId) =>
  api.get('/entries/lots', { params: { medicine_id: Number(medicineId) } })

export const createReturn = (payload) => api.post('/entries/returns', payload)

