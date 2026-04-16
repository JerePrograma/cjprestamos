import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';
const user = import.meta.env.VITE_API_BASIC_USER;
const password = import.meta.env.VITE_API_BASIC_PASSWORD;

const authHeader =
  user && password ? `Basic ${btoa(`${user}:${password}`)}` : null;

export const api = axios.create({
  baseURL,
  timeout: 10_000,
});

if (authHeader) {
  api.defaults.headers.common.Authorization = authHeader;
}
