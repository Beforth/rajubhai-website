// Client for the POS "shop" API: public, no login. Every response is the envelope
// { success, message, data, errors }; get/post return `data` or throw ShopApiError.
const BASE = (import.meta.env.PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');
const PREFIX = '/api/v1/shop';

export class ShopApiError extends Error {
  constructor(status, message, errors = null) {
    super(message || 'Something went wrong');
    this.name = 'ShopApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function request(method, path, body) {
  const url = `${BASE}${PREFIX}/${String(path).replace(/^\/+/, '')}`;
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ShopApiError(0, 'Could not reach the restaurant. Check your connection and try again.');
  }
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }
  if (!res.ok || !payload || payload.success === false) {
    throw new ShopApiError(res.status, payload?.message || `Request failed (${res.status})`, payload?.errors ?? null);
  }
  return payload.data;
}

export const shopApi = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body ?? {}),
  getOutlets: () => request('GET', 'outlets/'),
  getInfo: (outletId) => request('GET', `${outletId}/info/`),
  getMenu: (outletId) => request('GET', `${outletId}/menu/`),
};
