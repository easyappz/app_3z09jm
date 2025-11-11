import yaml from 'js-yaml';

let cachedSpec = null;

export async function loadOpenApiSpec() {
  if (cachedSpec) return cachedSpec;
  const res = await fetch('/openapi.yml');
  const text = await res.text();
  cachedSpec = yaml.load(text);
  return cachedSpec;
}

export async function getPath(pathKey) {
  // pathKey examples: 'auth.register', 'auth.login', 'members.me', 'ads.list', 'ads.create', 'ads.detail', 'ads.moderate', 'ads.my'
  const map = {
    'auth.register': '/api/auth/register',
    'auth.login': '/api/auth/login',
    'members.me': '/api/members/me',
    'ads.list': '/api/ads/',
    'ads.create': '/api/ads/',
    'ads.my': '/api/ads/my/',
    'ads.detail': (id) => `/api/ads/${id}/`,
    'ads.moderate': (id) => `/api/ads/${id}/moderate/`,
  };
  await loadOpenApiSpec(); // ensure spec loaded
  return map[pathKey];
}
