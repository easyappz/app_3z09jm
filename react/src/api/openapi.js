import YAML from 'js-yaml';
import instance from './axios';

let specPromise = null;

export async function getOpenAPISpec() {
  if (!specPromise) {
    specPromise = instance
      .get('/openapi.yml', { headers: { Accept: 'text/yaml' } })
      .then((res) => {
        try {
          if (typeof res.data === 'string') {
            return YAML.load(res.data) || {};
          }
          return res.data || {};
        } catch (e) {
          return {};
        }
      })
      .catch(() => ({}));
  }
  return specPromise;
}

export async function ensureOpenAPI() {
  await getOpenAPISpec();
}
