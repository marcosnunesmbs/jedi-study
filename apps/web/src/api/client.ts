import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/auth.store';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res.data?.data ?? res.data,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401 && useAuthStore.getState().token) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    } else if (status === 400 || status === 403 || status === 500) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default client;
