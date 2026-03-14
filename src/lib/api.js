import axios from 'axios';
import { toast } from 'vue-sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data ||
      error?.message ||
      'Ocorreu um erro inesperado.';

    const silent = error?.config?.silent === true;
    const skipAuthRedirect = error?.config?.skipAuthRedirect === true;

    if (!silent) {
      if (status === 401) {
        toast.error(typeof message === 'string' ? message : 'Sessão expirada.');
      } else if (status === 403) {
        toast.error(typeof message === 'string' ? message : 'Acesso negado.');
      } else if (status >= 500) {
        toast.error('Erro interno do servidor.');
      } else {
        toast.error(typeof message === 'string' ? message : 'Não foi possível concluir a ação.');
      }
    }

    if (status === 401 && !skipAuthRedirect) {
      localStorage.removeItem('token');
      localStorage.removeItem('userNome');
      localStorage.removeItem('userRole');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;