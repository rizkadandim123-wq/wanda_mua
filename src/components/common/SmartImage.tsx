import { useState } from 'react';
import { Flower2 } from 'lucide-react';

interface SmartImageProps {
  src: string | null | undefined;
  alt: string;
  focusX?: number;
  focusY?: number;
  zoom?: number;
  loading?: 'eager' | 'lazy';
  className?: string;
  fallbackLabel?: string;
}

export function SmartImage({
  src,
  alt,
  focusX = 50,
  focusY = 50,
  zoom = 100,
  loading = 'lazy',
  className = 'w-full h-full object-cover',
  fallbackLabel = 'Foto belum tersedia',
}: SmartImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasError = !src || failedSrc === src;

  if (hasError) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-2 px-4 text-center select-none"
        style={{
          backgroundColor: 'var(--color-blush, #F8E6EB)',
          color: 'var(--color-heading, #8F454B)',
        }}
        role="img"
        aria-label={alt || fallbackLabel}
      >
        <Flower2 className="w-7 h-7 opacity-55 stroke-[1.25]" aria-hidden="true" />
        <span className="text-xs tracking-wide opacity-75">{fallbackLabel}</span>
      </div>
    );
  }

  const safeZoom = Math.min(220, Math.max(100, zoom));

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={loading === 'eager' ? 'high' : 'auto'}
      onError={() => setFailedSrc(src)}
      className={className}
      style={{
        objectPosition: `${focusX}% ${focusY}%`,
        transformOrigin: `${focusX}% ${focusY}%`,
        ...(safeZoom > 100 ? { transform: `scale(${safeZoom / 100})` } : {}),
      }}
    />
  );
}
