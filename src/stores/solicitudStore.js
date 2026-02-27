import { defineStore } from 'pinia'
import axios from 'axios'

export const useSolicitudStore = defineStore('solicitud', {
  state: () => ({
    solicitudes: [],
  }),
  actions: {
    async guardarSolicitud(solicitud) {
      try {
        const response = await axios.post('/api/solicitudes', solicitud)
        return response.data
      } catch (error) {
        throw error
      }
    },
    async cargarSolicitudes() {
      try {
        const response = await axios.get('/api/solicitudes')
        this.solicitudes = response.data
      } catch (error) {
        console.error('Error al cargar solicitudes', error)
      }
    },
  },
})
