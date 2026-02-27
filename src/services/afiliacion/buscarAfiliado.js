import apiAfiliacion from './apiAfiliacion'

/**
 * Buscar afiliados según referencia o nombre
 * @param {Object} params
 * @param {string|null} params.codigo_referencia - Código de referencia del afiliado (opcional)
 * @param {string|null} params.nombre - Nombre del afiliado (opcional)
 * @param {number} params.opcion - Tipo de búsqueda (obligatorio)
 * @param {number|null} params.entidad_id - ID de la entidad (opcional)
 */
export function buscarAfiliado({ codigo_referencia = null, nombre = null, opcion = 0, entidad_id = null }) {
  const payload = {
    codigo_referencia,
    nombre,
    opcion,
  }

  if (entidad_id !== null) {
    payload.entidad_id = entidad_id
  }

  return apiAfiliacion.post('/afiliado/buscar', payload)
}

/**
 * Obtener información detallada de un afiliado por PAE_ID
 * @param {number} pae_id - ID de persona_afiliado_entidad
 */
export function getInfoAfiliado(pae_id) {
  return apiAfiliacion.post('/afiliado/infoafiliado', {
    pae_id
  })
}



