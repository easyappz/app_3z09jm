import instance from './axios';
import { ensureOpenAPI } from './openapi';

export async function register(payload) {
  await ensureOpenAPI();
  const res = await instance.post('/api/auth/register', {
    email: payload.email,
    username: payload.username,
    password: payload.password,
  });
  return res.data;
}

export async function login(payload) {
  await ensureOpenAPI();
  const res = await instance.post('/api/auth/login', {
    email: payload.email,
    password: payload.password,
  });
  return res.data;
}
