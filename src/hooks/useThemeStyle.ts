import { useMemo, type CSSProperties } from 'react';
import { getFontPreset } from '../lib/defaults';
import type { PublishedSettings } from '../types/cms';

export function useThemeStyle(settings: PublishedSettings): CSSProperties {
  return useMemo(() => {
    const preset = getFontPreset(settings.font_preset);
    return {
      '--color-blush': settings.theme_blush || '#F8E6EB',
      '--color-ivory': settings.theme_ivory || '#FFF9F5',
      '--color-accent': settings.theme_accent || '#B96B78',
      '--color-heading': settings.theme_heading || '#8F454B',
      '--color-body': settings.theme_body || '#594448',
      '--font-serif': preset.serifFont,
      '--font-sans': preset.sansFont,
    } as CSSProperties;
  }, [
    settings.font_preset,
    settings.theme_accent,
    settings.theme_blush,
    settings.theme_body,
    settings.theme_heading,
    settings.theme_ivory,
  ]);
}
