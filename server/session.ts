import type { AdminProfileSession, ServerEnv, SessionPayload } from './types';

export const SESSION_COOKIE_NAME = 'niwa_admin_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string): Uint8Array | null {
  try {
    const padded = input.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (padded.length % 4)) % 4;
    const base64 = padded + '='.repeat(padLen);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function getHmacKey(env: ServerEnv): Promise<CryptoKey> {
  const secretSource =
    env.SESSION_SECRET?.trim() ||
    `niwayuliana-session::${env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? 'fallback'}`;

  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secretSource),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export async function createSessionToken(
  profile: AdminProfileSession,
  env: ServerEnv
): Promise<string> {
  const payload: SessionPayload = {
    ...profile,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const payloadBytes = encoder.encode(JSON.stringify(payload));
  const payloadB64 = toBase64Url(payloadBytes);

  const key = await getHmacKey(env);
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  const sigB64 = toBase64Url(new Uint8Array(sigBuffer));

  return `${payloadB64}.${sigB64}`;
}

export async function verifySessionToken(
  token: string,
  env: ServerEnv
): Promise<SessionPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;

  const sigBytes = fromBase64Url(sigB64);
  if (!sigBytes) return null;

  const key = await getHmacKey(env);
  const expectedSigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  const expectedSigBytes = new Uint8Array(expectedSigBuffer);

  if (!constantTimeEqual(sigBytes, expectedSigBytes)) {
    return null;
  }

  const payloadBytes = fromBase64Url(payloadB64);
  if (!payloadBytes) return null;

  try {
    const parsed = JSON.parse(decoder.decode(payloadBytes)) as SessionPayload;
    if (!parsed.id || !parsed.username || typeof parsed.exp !== 'number') {
      return null;
    }
    if (Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function readCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const eqIndex = pair.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = pair.slice(0, eqIndex).trim();
    if (key === name) {
      return decodeURIComponent(pair.slice(eqIndex + 1).trim());
    }
  }
  return null;
}

export function buildSessionCookie(token: string, isHttps: boolean): string {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  const secureFlag = isHttps ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secureFlag}`;
}

export function buildClearSessionCookie(isHttps: boolean): string {
  const secureFlag = isHttps ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag}`;
}
