import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { handleApiRequest } from './server/apiHandler';
import { createLocalFsR2Bucket } from './server/localR2';
import type { ServerEnv } from './server/types';

function readNodeRequestBody(req: IncomingMessage): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer | string) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    });
    req.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))));
    req.on('error', reject);
  });
}

function createApiMiddleware(env: ServerEnv) {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: unknown) => void
  ) => {
    const urlPath = req.url ?? '/';
    if (!urlPath.startsWith('/api/')) {
      next();
      return;
    }

    try {
      const host = req.headers.host || 'localhost:5173';
      const protoHeader = req.headers['x-forwarded-proto'];
      const rawProto = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader;
      const proto =
        typeof rawProto === 'string' && rawProto.split(',')[0].trim() === 'https'
          ? 'https'
          : 'http';
      const fullUrl = `${proto}://${host}${urlPath}`;
      const method = (req.method ?? 'GET').toUpperCase();

      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === 'string') {
          headers.set(key, value);
        } else if (Array.isArray(value)) {
          headers.set(key, value.join(', '));
        }
      }

      const bodyBytes =
        method === 'GET' || method === 'HEAD' ? undefined : await readNodeRequestBody(req);

      const webRequest = new Request(fullUrl, {
        method,
        headers,
        body: bodyBytes ? Buffer.from(bodyBytes) : undefined,
      });

      const webResponse = await handleApiRequest(webRequest, env);
      res.statusCode = webResponse.status;

      const setCookies =
        typeof webResponse.headers.getSetCookie === 'function'
          ? webResponse.headers.getSetCookie()
          : [];
      if (setCookies.length > 0) {
        res.setHeader('Set-Cookie', setCookies);
      }

      webResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') return;
        res.setHeader(key, value);
      });

      const outBuffer = Buffer.from(await webResponse.arrayBuffer());
      res.end(outBuffer);
    } catch (err) {
      next(err);
    }
  };
}

function cloudflareApiDevPlugin(env: ServerEnv): Plugin {
  return {
    name: 'cloudflare-api-dev-bridge',
    configureServer(server) {
      server.middlewares.use(createApiMiddleware(env));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createApiMiddleware(env));
    },
  };
}

export default defineConfig(({ mode }) => {
  const loaded = loadEnv(mode, process.cwd(), '');
  const localR2Bucket = createLocalFsR2Bucket(path.resolve(process.cwd(), '.local-r2'));

  const serverEnv: ServerEnv = {
    SUPABASE_URL: loaded.SUPABASE_URL ?? process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY:
      loaded.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_PUBLISHABLE_KEY:
      loaded.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY,
    SESSION_SECRET: loaded.SESSION_SECRET ?? process.env.SESSION_SECRET,
    R2_PUBLIC_URL: loaded.R2_PUBLIC_URL ?? process.env.R2_PUBLIC_URL,
    MEDIA_BUCKET: localR2Bucket,
  };

  const allowedTunnelHosts = ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.io', '.ngrok.app'];

  return {
    plugins: [react(), tailwindcss(), cloudflareApiDevPlugin(serverEnv)],
    server: {
      allowedHosts: allowedTunnelHosts,
    },
    preview: {
      allowedHosts: allowedTunnelHosts,
    },
  };
});
