import { useEffect } from 'react';
import type { PublishedSettings } from '../types/cms';

function upsertMeta(attrName: 'name' | 'property', key: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[${attrName}="${key}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attrName, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

export function useSeoHead(settings: PublishedSettings, isPreview = false) {
  useEffect(() => {
    const baseTitle = settings.seo_title?.trim() || `${settings.business_name} — ${settings.business_subtext}`;
    document.title = isPreview ? `[Preview Draft] ${baseTitle}` : baseTitle;

    if (settings.seo_description?.trim()) {
      upsertMeta('name', 'description', settings.seo_description.trim());
      upsertMeta('property', 'og:description', settings.seo_description.trim());
    }

    upsertMeta('property', 'og:title', baseTitle);

    if (settings.seo_og_image_url) {
      upsertMeta('property', 'og:image', settings.seo_og_image_url);
      if (settings.seo_og_alt?.trim()) {
        upsertMeta('property', 'og:image:alt', settings.seo_og_alt.trim());
      }
    }

    const faviconHref = settings.favicon_url || '/favicon.svg';
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconHref;
  }, [
    isPreview,
    settings.business_name,
    settings.business_subtext,
    settings.favicon_url,
    settings.seo_description,
    settings.seo_og_alt,
    settings.seo_og_image_url,
    settings.seo_title,
  ]);
}
