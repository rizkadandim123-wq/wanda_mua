import { useEffect, useRef, useState, type ReactNode } from 'react';

type RevealVariant = 'fade-up' | 'fade-left' | 'fade-right' | 'scale-soft';

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
}

const VARIANT_CLASS: Record<RevealVariant, string> = {
  'fade-up': 'reveal-fade-up',
  'fade-left': 'reveal-fade-left',
  'fade-right': 'reveal-fade-right',
  'scale-soft': 'reveal-scale-soft',
};

export function Reveal({
  children,
  variant = 'fade-up',
  delay = 0,
  className = '',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === 'undefined'
  );
  const [enteredFromTop, setEnteredFromTop] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
          } else {
            const rect = entry.boundingClientRect;
            const vh = window.innerHeight || 800;
            // Re-arm lembut hanya saat elemen benar-benar sudah jauh di luar viewport
            // agar ketika user scroll kembali, animasi mengikuti arah scroll tanpa loncatan mendadak.
            if (rect.top > vh + 140) {
              setEnteredFromTop(false);
              setVisible(false);
            } else if (rect.bottom < -140) {
              setEnteredFromTop(true);
              setVisible(false);
            }
          }
        }
      },
      {
        threshold: 0.06,
        rootMargin: '0px 0px -24px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const directionClass =
    !visible && enteredFromTop && variant === 'fade-up'
      ? 'reveal-fade-down'
      : VARIANT_CLASS[variant];

  return (
    <div
      ref={ref}
      className={`reveal-base ${directionClass} ${visible ? 'reveal-visible' : ''} ${className}`}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
