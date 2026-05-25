import axios from 'axios';
import { authStorage } from './auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = res.data.data.accessToken;
        authStorage.setToken(newToken);
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api(error.config);
      } catch {
        authStorage.clearToken();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
