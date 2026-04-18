import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const user = import.meta.env.VITE_API_BASIC_USER ?? 'operadora';
const password = import.meta.env.VITE_API_BASIC_PASSWORD ?? 'operadora123';

const authHeader = `Basic ${btoa(`${user}:${password}`)}`;

export const api = axios.create({
  baseURL,
  timeout: 10_000,
});

api.defaults.headers.common.Authorization = authHeader;
