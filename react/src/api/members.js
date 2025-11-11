import instance from './axios';
import { ensureOpenAPI } from './openapi';

export async function getMe() {
  await ensureOpenAPI();
  const res = await instance.get('/api/members/me');
  return res.data;
}

export async function updateMe(payload) {
  await ensureOpenAPI();
  const res = await instance.put('/api/members/me', payload);
  return res.data;
}
