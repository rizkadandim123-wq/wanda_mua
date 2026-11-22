import { apiJson } from './api';
import { validateImageFile } from './validation';
import type { MediaAsset } from '../types/cms';

export async function uploadDraftImage(
  file: File,
  folder: string,
  altText = ''
): Promise<MediaAsset> {
  const validation = validateImageFile(file);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);
  form.append('alt_text', altText.trim());

  const res = await apiJson<{ asset: MediaAsset; url: string }>(
    '/api/admin/media',
    {
      method: 'POST',
      body: form,
    }
  );

  return res.asset;
}
