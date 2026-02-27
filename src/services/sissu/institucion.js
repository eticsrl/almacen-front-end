import apiSissu from './apiSissu'

export const getAll = (params = {}) => {
    return apiSissu.get('/institucion', { params })
    
  }
