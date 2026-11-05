// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Dev only: `/order/*` paths that have no static page (e.g. /order/order-status/:id)
// are served the app shell so React Router can handle them. Production uses public/_redirects.
const orderFallback = {
  name: 'order-app-dev-fallback',
  hooks: {
    'astro:server:setup': ({ server }) => {
      const staticSlugs = new Set(['menu', 'cart', 'checkout', 'login', 'orders', 'profile']);
      server.middlewares.use((req, _res, next) => {
        const path = (req.url ?? '').split('?')[0];
        const m = path.match(/^\/order\/(.+?)\/?$/);
        if (m && !m[1].includes('.') && !staticSlugs.has(m[1])) req.url = '/order/';
        next();
      });
    },
  },
};

// https://astro.build/config
// Dev only: the order app calls /api/v1/shop/* and the backend builds image URLs from the request
// host (/media/...), so both are forwarded to the POS backend. Override with API_PROXY_TARGET.
const apiTarget = process.env.API_PROXY_TARGET || 'http://127.0.0.1:8000';

export default defineConfig({
  integrations: [react(), orderFallback],
  vite: {
    server: {
      proxy: {
        '/api': { target: apiTarget, changeOrigin: false },
        '/media': { target: apiTarget, changeOrigin: false },
      },
    },
  },
});
