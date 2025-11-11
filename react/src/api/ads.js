import api from './axios';
import { getPath } from './openapi';

export async function listAds(params) {
  const path = await getPath('ads.list');
  const { data } = await api.get(path, { params });
  return data;
}

export async function myAds(params) {
  const path = await getPath('ads.my');
  const { data } = await api.get(path, { params });
  return data;
}

export async function getAd(id) {
  const pathFn = await getPath('ads.detail');
  const { data } = await api.get(pathFn(id));
  return data;
}

export async function createAd(payload) {
  const path = await getPath('ads.create');
  const { data } = await api.post(path, payload);
  return data;
}

export async function updateAd(id, payload) {
  const pathFn = await getPath('ads.detail');
  const { data } = await api.put(pathFn(id), payload);
  return data;
}

export async function deleteAd(id) {
  const pathFn = await getPath('ads.detail');
  await api.delete(pathFn(id));
}

export async function moderateAd(id, status) {
  const pathFn = await getPath('ads.moderate');
  const { data } = await api.post(pathFn(id), { status });
  return data;
}
