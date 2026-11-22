import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Loader2, MailCheck, Send } from 'lucide-react';
import { DEFAULT_SITE_COPY } from '../../lib/defaults';
import type { PublishedSettings } from '../../types/cms';
import { LineRevealTitle, ScrollStage } from '../common/EditorialMotion';
import { FormattedText, stripTextFormatting } from '../common/FormattedTitle';
import { BotanicalDivider } from './FloralOrnaments';
import { BeautySparkleCluster } from './MakeupOrnaments';
import { CornerFlourish } from './DecorOrnaments';
import { SectionBackdrop } from './SectionBackdrop';

interface FeedbackSectionProps {
  settings: PublishedSettings;
}

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

export function FeedbackSection({ settings }: FeedbackSectionProps) {
  const copy = settings.site_copy ?? DEFAULT_SITE_COPY;
  const topics = useMemo(
    () =>
      copy.feedback_topics?.length
        ? copy.feedback_topics
        : DEFAULT_SITE_COPY.feedback_topics,
    [copy.feedback_topics]
  );

  const sectionRef = useRef<HTMLElement>(null);
  const [entered, setEntered] = useState(
    () =>
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const [topic, setTopic] = useState<string>(topics[0] ?? 'Saran & Masukan');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [botcheck, setBotcheck] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!topics.includes(topic)) {
      setTopic(topics[0] ?? 'Saran & Masukan');
    }
  }, [topic, topics]);

  useEffect(() => {
    if (!copy.feedback_visible) return;
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEntered(true);
      return;
    }

    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setEntered(true);
          } else {
            const rect = entry.boundingClientRect;
            const vh = window.innerHeight || 800;
            if (rect.top > vh + 140 || rect.bottom < -140) {
              setEntered(false);
            }
          }
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [copy.feedback_visible]);

  if (copy.feedback_visible === false) {
    return null;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const accessKey = (import.meta.env.VITE_WEB3FORMS_ACCESS_KEY ?? '').trim();
    if (!accessKey) {
      setStatus('error');
      setErrorMessage(
        'Access key Web3Forms (VITE_WEB3FORMS_ACCESS_KEY) belum diisi di file .env. Silakan tambahkan kunci dari web3forms.com terlebih dahulu.'
      );
      return;
    }

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedPhone || !trimmedMessage) {
      setStatus('error');
      setErrorMessage('Mohon lengkapi nama, nomor telepon, dan pesan masukan Anda.');
      return;
    }

    setSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `[${stripTextFormatting(topic)}] Masukan dari ${trimmedName} — ${stripTextFormatting(settings.business_name)}`,
          from_name: `${stripTextFormatting(settings.business_name)} Website`,
          name: trimmedName,
          phone: trimmedPhone,
          topik: stripTextFormatting(topic),
          message: trimmedMessage,
          botcheck,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
      } | null;

      if (!response.ok || !payload?.success) {
        throw new Error(
          payload?.message || 'Gagal mengirim masukan. Silakan coba beberapa saat lagi.'
        );
      }

      setStatus('success');
      setName('');
      setPhone('');
      setMessage('');
      setTopic(topics[0] ?? 'Saran & Masukan');
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Terjadi kendala koneksi saat mengirim masukan. Silakan coba lagi.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="masukan"
      ref={sectionRef}
      className="relative overflow-hidden py-18 sm:py-24 lg:py-26 landing-section-anchor"
    >
      <SectionBackdrop variant="ivory" pattern="dots" />
      <CornerFlourish className="pointer-events-none select-none hidden md:block absolute top-4 left-4 w-24 lg:w-32 opacity-40 text-[var(--color-champagne)]" />
      <CornerFlourish className="pointer-events-none select-none hidden md:block absolute bottom-4 right-4 w-24 lg:w-32 opacity-40 rotate-180 text-[var(--color-champagne)]" />

      <ScrollStage className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Form Masukan */}
        <div className="max-w-xl mx-auto text-center">
          <div className={`feedback-field-in ${entered ? 'is-ready' : ''}`}>
            <BotanicalDivider className="mb-4 text-[var(--color-accent)]" />
            {copy.feedback_eyebrow.trim() && (
              <span
                className="block text-[11px] uppercase tracking-[0.28em] font-medium mb-2"
                style={{ color: 'var(--color-accent)' }}
              >
                <FormattedText text={copy.feedback_eyebrow} />
              </span>
            )}
          </div>

          <h2
            className="landing-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-normal leading-tight"
            style={{ color: 'var(--color-heading)' }}
          >
            <LineRevealTitle
              text={copy.feedback_title.trim() || DEFAULT_SITE_COPY.feedback_title}
              baseDelay={60}
              active={entered}
            />
          </h2>

          {copy.feedback_subtitle.trim() && (
            <p
              className={`feedback-field-in mt-3.5 text-sm sm:text-base leading-relaxed opacity-85 ${
                entered ? 'is-ready' : ''
              }`}
              style={{
                color: 'var(--color-body)',
                transitionDelay: '130ms',
              }}
            >
              <FormattedText text={copy.feedback_subtitle} />
            </p>
          )}
        </div>

        {/* Kartu Lembar Surat Masukan (Web3Forms) */}
        <div
          className={`feedback-sheet-rise relative mt-10 rounded-[2.25rem] border p-6 sm:p-10 shadow-[0_24px_56px_-34px_rgba(143,69,75,0.26)] ${
            entered ? 'is-ready' : ''
          }`}
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-blush) 28%, var(--color-ivory))',
            borderColor: 'color-mix(in srgb, var(--color-accent) 22%, transparent)',
            transitionDelay: '140ms',
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-3 rounded-[1.65rem] border"
            style={{
              borderColor: 'color-mix(in srgb, var(--color-champagne) 30%, transparent)',
            }}
          />

          <BeautySparkleCluster className="pointer-events-none select-none absolute top-5 right-5 w-11 opacity-35 text-[var(--color-accent)] animate-twinkle" />

          <div className="relative z-10">
            {status === 'success' ? (
              <div className="py-8 sm:py-10 text-center space-y-4">
                <div
                  className="mx-auto inline-flex items-center justify-center w-14 h-14 rounded-full border"
                  style={{
                    backgroundColor: 'var(--color-ivory)',
                    borderColor: 'color-mix(in srgb, var(--color-accent) 26%, transparent)',
                    color: 'var(--color-accent)',
                  }}
                >
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3
                  className="landing-serif text-2xl sm:text-3xl font-normal"
                  style={{ color: 'var(--color-heading)' }}
                >
                  <FormattedText
                    text={copy.feedback_success_title.trim() || DEFAULT_SITE_COPY.feedback_success_title}
                  />
                </h3>
                <p
                  className="text-sm sm:text-base max-w-md mx-auto leading-relaxed opacity-85"
                  style={{ color: 'var(--color-body)' }}
                >
                  <FormattedText
                    text={
                      copy.feedback_success_message.trim() ||
                      DEFAULT_SITE_COPY.feedback_success_message
                    }
                  />
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--color-ivory)] cursor-pointer"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-ivory) 78%, transparent)',
                      borderColor: 'color-mix(in srgb, var(--color-accent) 30%, transparent)',
                      color: 'var(--color-heading)',
                    }}
                  >
                    <MailCheck className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                    <span>Kirim Masukan Lain</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <input
                  type="checkbox"
                  name="botcheck"
                  checked={botcheck}
                  onChange={(e) => setBotcheck(e.target.checked)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                {/* Pilihan Topik Masukan */}
                <div
                  className={`feedback-field-in ${entered ? 'is-ready' : ''}`}
                  style={{ transitionDelay: '200ms' }}
                >
                  <span
                    className="block text-[11px] uppercase tracking-[0.22em] font-semibold mb-2.5"
                    style={{ color: 'var(--color-heading)' }}
                  >
                    Kategori Pesan
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((item) => {
                      const active = topic === item;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setTopic(item)}
                          className="rounded-full px-4 py-1.5 text-xs sm:text-[13px] font-medium border transition-colors duration-200 cursor-pointer"
                          style={
                            active
                              ? {
                                  backgroundColor: 'var(--color-accent)',
                                  borderColor: 'var(--color-accent)',
                                  color: '#FFF9F5',
                                }
                              : {
                                  backgroundColor: 'var(--color-ivory)',
                                  borderColor:
                                    'color-mix(in srgb, var(--color-accent) 24%, transparent)',
                                  color: 'var(--color-body)',
                                }
                          }
                        >
                          <FormattedText text={item} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Nama & Nomor Telepon */}
                <div
                  className={`feedback-field-in grid grid-cols-1 sm:grid-cols-2 gap-4 ${
                    entered ? 'is-ready' : ''
                  }`}
                  style={{ transitionDelay: '265ms' }}
                >
                  <div>
                    <label
                      htmlFor="feedback-name"
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: 'var(--color-heading)' }}
                    >
                      Nama Anda <span style={{ color: 'var(--color-accent)' }}>*</span>
                    </label>
                    <input
                      id="feedback-name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Nabila Putri"
                      className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                      style={{
                        backgroundColor: 'var(--color-ivory)',
                        borderColor: 'color-mix(in srgb, var(--color-accent) 24%, transparent)',
                        color: 'var(--color-body)',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="feedback-phone"
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: 'var(--color-heading)' }}
                    >
                      Nomor Telepon / WhatsApp{' '}
                      <span style={{ color: 'var(--color-accent)' }}>*</span>
                    </label>
                    <input
                      id="feedback-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 0812-3456-7890"
                      className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                      style={{
                        backgroundColor: 'var(--color-ivory)',
                        borderColor: 'color-mix(in srgb, var(--color-accent) 24%, transparent)',
                        color: 'var(--color-body)',
                      }}
                    />
                  </div>
                </div>

                {/* Pesan Masukan */}
                <div
                  className={`feedback-field-in ${entered ? 'is-ready' : ''}`}
                  style={{ transitionDelay: '330ms' }}
                >
                  <label
                    htmlFor="feedback-message"
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: 'var(--color-heading)' }}
                  >
                    Pesan / Masukan <span style={{ color: 'var(--color-accent)' }}>*</span>
                  </label>
                  <textarea
                    id="feedback-message"
                    name="message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan saran, ulasan, atau masukan Anda di sini..."
                    className="w-full rounded-2xl border px-4 py-3 text-sm leading-relaxed outline-none resize-y transition-colors focus:border-[var(--color-accent)]"
                    style={{
                      backgroundColor: 'var(--color-ivory)',
                      borderColor: 'color-mix(in srgb, var(--color-accent) 24%, transparent)',
                      color: 'var(--color-body)',
                    }}
                  />
                </div>

                {status === 'error' && errorMessage && (
                  <div
                    role="alert"
                    className="rounded-2xl border px-4 py-3 text-xs sm:text-sm flex items-start gap-2.5"
                    style={{
                      backgroundColor: 'var(--color-ivory)',
                      borderColor: 'color-mix(in srgb, var(--color-accent) 45%, transparent)',
                      color: 'var(--color-heading)',
                    }}
                  >
                    <AlertCircle
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: 'var(--color-accent)' }}
                    />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div
                  className={`feedback-field-in pt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    entered ? 'is-ready' : ''
                  }`}
                  style={{ transitionDelay: '395ms' }}
                >
                  <p className="text-xs opacity-70" style={{ color: 'var(--color-body)' }}>
                    <FormattedText text={copy.feedback_note.trim() || DEFAULT_SITE_COPY.feedback_note} />
                  </p>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-blush-pill inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium disabled:opacity-65 cursor-pointer disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: '#FFF9F5',
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>
                          <FormattedText
                            text={
                              copy.feedback_submit_label.trim() ||
                              DEFAULT_SITE_COPY.feedback_submit_label
                            }
                          />
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </ScrollStage>
    </section>
  );
}
