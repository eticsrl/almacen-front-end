
import apiAfiliacion from './apiAfiliacion'

/**
 * trae lista de medcos segun la entidad.
 * @param {number|string} entidadId
 * @returns {Promise<Array>}  
 */
export const fetchMedicos = async (entidadId) => {
  const { data } = await apiAfiliacion.get(`/medico/listamedicos/${entidadId}`)
  // El backend envía { medicos: [...] }
  return data.medicos
}
