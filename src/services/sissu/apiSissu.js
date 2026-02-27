import axios from 'axios';

const apiSissu = axios.create({
  baseURL: import.meta.env.VITE_SISSU_SL_URL,
});

export default apiSissu;