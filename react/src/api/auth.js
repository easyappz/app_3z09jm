import api from './axios';
import { getPath } from './openapi';

export async function register(payload) {
  const path = await getPath('auth.register');
  const { data } = await api.post(path, payload);
  return data;
}

export async function login(payload) {
  const path = await getPath('auth.login');
  const { data } = await api.post(path, payload);
  return data; // { access }
}
