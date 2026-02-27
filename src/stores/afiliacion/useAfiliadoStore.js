import { defineStore } from 'pinia'
import { ref } from 'vue'
import { buscarAfiliado, getInfoAfiliado } from '@/services/afiliacion/buscarAfiliado'

export const useAfiliadoStore = defineStore('afiliado', () => {
  const afiliados = ref([])
  const afiliadoSeleccionado = ref(null)
  const infoAfiliado = ref(null)
  const loading = ref(false)

  /**
   * Buscar afiliados según código o nombre
   * @param {Object} params
   */
  const buscar = async (params) => {
    loading.value = true
    try {
      const response = await buscarAfiliado(params)
      afiliados.value = response.data.afiliados || []
    } catch (error) {
      console.error('Error al buscar afiliado:', error)
      afiliados.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener información detallada del afiliado
   * @param {number} pae_id
   */
  const obtenerInfoAfiliado = async (pae_id) => {
    loading.value = true
    try {
      const response = await getInfoAfiliado(pae_id)
      infoAfiliado.value = response.data
    } catch (error) {
      console.error('Error al obtener info del afiliado:', error)
      infoAfiliado.value = null
    } finally {
      loading.value = false
    }
  }

  const seleccionarAfiliado = (afiliado) => {
    afiliadoSeleccionado.value = afiliado
  }

  return {
    afiliados,
    afiliadoSeleccionado,
    infoAfiliado,
    loading,
    buscar,
    obtenerInfoAfiliado,
    seleccionarAfiliado
  }
})


