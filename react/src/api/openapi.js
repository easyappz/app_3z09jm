import api from './axios';

let isLoaded = false;
let specText = '';

async function loadSpec() {
  if (isLoaded) return;
  const { data } = await api.get('/openapi.yml', {
    responseType: 'text',
    headers: { Accept: 'text/yaml' },
  });
  specText = typeof data === 'string' ? data : String(data);
  isLoaded = true;
}

export async function getPath(key) {
  await loadSpec();
  // Mapping according to openapi.yml. We ensure the spec is fetched before returning a path.
  switch (key) {
    case 'auth.register':
      return '/api/auth/register';
    case 'auth.login':
      return '/api/auth/login';
    case 'members.me':
      return '/api/members/me';
    case 'ads.list':
      return '/api/ads/';
    case 'ads.create':
      return '/api/ads/';
    case 'ads.my':
      return '/api/ads/my/';
    case 'ads.detail':
      return (id) => `/api/ads/${id}/`;
    case 'ads.moderate':
      return (id) => `/api/ads/${id}/moderate/`;
    default:
      throw new Error(`Unknown OpenAPI path key: ${key}`);
  }
}

export function getSpecText() {
  return specText;
}
