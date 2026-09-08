/**
 * Cloudflare Worker: Fullstack Worker with Static Assets & D1 Database
 * Method 2 entrypoint for NK Laser Spares & Optics.
 * Routes /api/* to the Edge API router, runs SSR pre-rendering for SEO bots,
 * and serves compiled Vite static assets from dist/ via env.ASSETS.
 */

import { onRequest as handleApiRequest } from './functions/api/[[route]]';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  DB?: any;
  ADMIN_PASSWORD?: string;
  ADMIN_PASSWORD_HASH?: string;
  SESSION_SECRET?: string;
  DATA_ENCRYPTION_KEY?: string;
  GEMINI_API_KEY?: string;
  [key: string]: any;
}

const BOT_USER_AGENTS = /googlebot|bingbot|yandex|duckduckbot|slurp|baiduspider|facebot|facebookexternalhit|whatsapp|telegrambot|twitterbot|linkedinbot/i;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. Edge API Routes (/api/*)
    if (url.pathname.startsWith('/api')) {
      return handleApiRequest({ request, env, params: {} });
    }

    // 2. Static Assets & SPA Fallback via Cloudflare Assets
    return env.ASSETS.fetch(request);
  }
};
