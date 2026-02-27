// services/sissu/receta.js
import apiSissu from './apiSissu'

export const getAll = (params = {}) => {
  return apiSissu.get('/recetas', { params })
}

export const getById = id => {
  return apiSissu.get(`/recetas/${id}`)
}

export const store = data => {
  return apiSissu.post('/recetas', data)
}

export const update = (id, data) => {
  return apiSissu.put(`/recetas/${id}`, data)
}

export const destroy = id => {
  return apiSissu.delete(`/recetas/${id}`)
}

// Endpoint personalizado para farmacia
export const getFarmacia = (params = {}) => {
  return apiSissu.get('/recetas/solicitudes-farmacia', { params })
}
/**
 * aplica descargo en SISSU (actualiza cantidad_pendiente/entregada de los ítems
 * y, si corresponde, marca la receta como ENTREGADA con fecha_entrega).
 *
 * @param {number} recetaId
 * @param {Array<{receta_item_id:number,cantidad_entregada:number}>} movimientos
 
 *
 * Respuesta: { message: string, data: RecetaResource }
 */
 export const aplicarDescargo = (recetaId, movimientos) =>
 apiSissu.post(
   `/recetas/${recetaId}/aplicar-descargo`,
   { movimientos }
 )
