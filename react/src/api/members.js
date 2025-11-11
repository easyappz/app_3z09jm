import api from './axios';
import { getPath } from './openapi';

export async function getMe() {
  const path = await getPath('members.me');
  const { data } = await api.get(path);
  return data;
}

export async function updateMe(payload) {
  const path = await getPath('members.me');
  const { data } = await api.put(path, payload);
  return data;
}
