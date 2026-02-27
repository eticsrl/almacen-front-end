// src/services/afiliacion/apiAfiliacion.js
import axios from 'axios';

const apiAfiliacion = axios.create({
  baseURL: import.meta.env.VITE_APIAFILIACION_URL,
});

export default apiAfiliacion;