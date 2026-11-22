import { handleApiRequest } from '../../server/apiHandler';
import type { ServerEnv } from '../../server/types';

interface PagesContext {
  request: Request;
  env: ServerEnv;
}

export async function onRequest(context: PagesContext): Promise<Response> {
  return handleApiRequest(context.request, context.env);
}
