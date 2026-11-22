import { handleApiRequest } from '../server/apiHandler';
import type { ServerEnv } from '../server/types';

export default {
  async fetch(request: Request, env: ServerEnv): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Assets binding not configured.', { status: 500 });
  },
};
