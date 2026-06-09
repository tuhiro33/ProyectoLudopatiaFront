import axios from 'axios';

const api = axios.create({
  baseURL: 'https:proyectoludopatiaback-production.up.railway.app', 
  withCredentials: true,
});

// Interceptor para adjuntar el JWT automáticamente en rutas protegidas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // NOTA DE SEGURIDAD: No fuerces 'Content-Type': 'application/json' globalmente aquí,
    // de lo contrario, cuando envíes un FormData (imágenes), Axios no podrá calcular 
    // el 'boundary' dinámico y Firebase/Go te rebotarán el archivo.
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;