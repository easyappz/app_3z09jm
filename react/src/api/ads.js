import instance from './axios';
import { ensureOpenAPI } from './openapi';

export async function listAds(params) {
  await ensureOpenAPI();
  const res = await instance.get('/api/ads/', { params });
  return res.data;
}

export async function createAd(payload) {
  await ensureOpenAPI();
  const res = await instance.post('/api/ads/', payload);
  return res.data;
}

export async function myAds(params) {
  await ensureOpenAPI();
  const res = await instance.get('/api/ads/my/', { params });
  return res.data;
}

export async function getAd(id) {
  await ensureOpenAPI();
  const res = await instance.get(`/api/ads/${id}/`);
  return res.data;
}

export async function updateAd(id, payload) {
  await ensureOpenAPI();
  const res = await instance.put(`/api/ads/${id}/`, payload);
  return res.data;
}

export async function deleteAd(id) {
  await ensureOpenAPI();
  const res = await instance.delete(`/api/ads/${id}/`);
  return res.data;
}

export async function moderateAd(id, status) {
  await ensureOpenAPI();
  const res = await instance.post(`/api/ads/${id}/moderate/`, { status });
  return res.data;
}
