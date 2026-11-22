import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { R2BucketLike, R2ObjectBodyLike } from './types';

function inferContentType(key: string): string {
  const lower = key.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function resolveSafeKeyPath(rootDir: string, key: string): string {
  const cleanKey = key.replace(/^\/+/, '');
  if (!cleanKey || cleanKey.includes('..') || cleanKey.includes('\\')) {
    throw new Error('Kunci objek R2 lokal tidak valid.');
  }
  const root = path.resolve(rootDir);
  const full = path.resolve(root, cleanKey);
  if (!full.startsWith(root + path.sep)) {
    throw new Error('Akses path di luar direktori penyimpanan lokal ditolak.');
  }
  return full;
}

/**
 * Adaptor lokal untuk R2Bucket saat menjalankan `npm run dev` / `vite preview`,
 * menyimpan objek di folder disk lokal (`.local-r2/`) agar upload lokal tidak masuk ke R2 produksi.
 */
export function createLocalFsR2Bucket(rootDir: string): R2BucketLike {
  return {
    async get(key: string): Promise<R2ObjectBodyLike | null> {
      const filePath = resolveSafeKeyPath(rootDir, key);
      try {
        const bytes = await readFile(filePath);
        let contentType = inferContentType(key);
        try {
          const metaRaw = await readFile(`${filePath}.meta.json`, 'utf8');
          const meta = JSON.parse(metaRaw) as { contentType?: string };
          if (meta.contentType) contentType = meta.contentType;
        } catch {
          // Gunakan tebakan ekstensi bila metadata belum ada
        }
        const arrayBuf = bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength
        ) as ArrayBuffer;
        return {
          size: bytes.byteLength,
          httpMetadata: { contentType },
          async arrayBuffer() {
            return arrayBuf;
          },
        };
      } catch {
        return null;
      }
    },

    async put(key, value, options) {
      const filePath = resolveSafeKeyPath(rootDir, key);
      await mkdir(path.dirname(filePath), { recursive: true });

      let data: Uint8Array;
      if (typeof value === 'string') {
        data = new TextEncoder().encode(value);
      } else if (value instanceof ArrayBuffer) {
        data = new Uint8Array(value);
      } else {
        data = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
      }

      await writeFile(filePath, data);
      if (options?.httpMetadata?.contentType) {
        await writeFile(
          `${filePath}.meta.json`,
          JSON.stringify({ contentType: options.httpMetadata.contentType }),
          'utf8'
        );
      }
    },

    async delete(key: string) {
      const filePath = resolveSafeKeyPath(rootDir, key);
      await rm(filePath, { force: true });
      await rm(`${filePath}.meta.json`, { force: true });
    },
  };
}
