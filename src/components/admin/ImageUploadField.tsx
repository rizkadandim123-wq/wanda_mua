import { useEffect, useId, useRef, useState, type PointerEvent } from 'react';
import {
  ImagePlus,
  Move,
  RotateCcw,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { formatBytes, validateImageFile } from '../../lib/validation';

interface ImageUploadFieldProps {
  label: string;
  hint?: string;
  recommendedSize?: string;
  currentUrl: string | null;
  pendingFile: File | null;
  onSelectFile: (file: File | null) => void;
  onClearImage?: () => void;
  hasRemovableImage?: boolean;
  aspectMode?: 'arch' | 'portrait' | 'square' | 'landscape' | 'wide' | 'hero-half' | 'circle' | 'contain';
  showFocusPicker?: boolean;
  focusX?: number;
  focusY?: number;
  onChangeFocus?: (x: number, y: number) => void;
  zoom?: number;
  onChangeZoom?: (zoom: number) => void;
}

const MIN_ZOOM = 100;
const MAX_ZOOM = 220;
const ZOOM_STEP = 5;

function clamp(val: number, min: number, max: number): number {
  return Math.round(Math.min(max, Math.max(min, val)));
}

export function ImageUploadField({
  label,
  hint,
  recommendedSize,
  currentUrl,
  pendingFile,
  onSelectFile,
  onClearImage,
  hasRemovableImage = false,
  aspectMode = 'portrait',
  showFocusPicker = false,
  focusX = 50,
  focusY = 50,
  onChangeFocus,
  zoom = 100,
  onChangeZoom,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startFocusX: number;
    startFocusY: number;
    width: number;
    height: number;
  } | null>(null);

  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [naturalDim, setNaturalDim] = useState<{
    src: string;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!pendingFile) {
      setPendingPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPendingPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const activePreviewUrl = pendingPreviewUrl ?? currentUrl;
  const safeZoom = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
  const displayedDim =
    naturalDim && activePreviewUrl && naturalDim.src === activePreviewUrl
      ? naturalDim
      : null;

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.ok) {
      setErrorMsg(validation.error);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setErrorMsg(null);
    onSelectFile(file);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!showFocusPicker || !onChangeFocus || !activePreviewUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startFocusX: focusX,
      startFocusY: focusY,
      width: rect.width,
      height: rect.height,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !onChangeFocus) return;

    const dx = e.clientX - drag.startClientX;
    const dy = e.clientY - drag.startClientY;
    const zoomScale = Math.max(1, safeZoom / 100);
    const factorX = 100 / (drag.width * zoomScale);
    const factorY = 100 / (drag.height * zoomScale);

    const nextX = clamp(drag.startFocusX - dx * factorX, 0, 100);
    const nextY = clamp(drag.startFocusY - dy * factorY, 0, 100);
    onChangeFocus(nextX, nextY);
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragStateRef.current = null;
    setIsDragging(false);
  };

  const adjustZoom = (delta: number) => {
    if (!onChangeZoom) return;
    onChangeZoom(clamp(safeZoom + delta, MIN_ZOOM, MAX_ZOOM));
  };

  const containerAspect =
    aspectMode === 'arch'
      ? 'aspect-[3/4] w-[220px] sm:w-[240px] rounded-t-[999px] rounded-b-2xl'
      : aspectMode === 'portrait'
        ? 'aspect-[4/5] w-[210px] sm:w-[230px] rounded-2xl'
        : aspectMode === 'square'
          ? 'aspect-square w-[205px] sm:w-[220px] rounded-2xl'
          : aspectMode === 'circle'
            ? 'aspect-square w-[195px] sm:w-[210px] rounded-full'
            : aspectMode === 'wide'
              ? 'aspect-[7/5] w-full max-w-[300px] sm:w-[290px] rounded-2xl'
              : aspectMode === 'hero-half'
                ? 'aspect-[16/10] w-full max-w-[330px] sm:w-[310px] rounded-2xl'
                : aspectMode === 'landscape'
                  ? 'aspect-[1200/630] w-full max-w-[320px] rounded-2xl'
                  : 'h-32 w-full max-w-[260px] rounded-2xl';

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={inputId} className="block text-sm font-medium text-[#8F454B]">
          {label}
        </label>
        {hint && <p className="text-xs text-[#594448]/75 mt-0.5">{hint}</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Area Preview & Interaksi Langsung */}
        <div className="shrink-0 space-y-2">
          {activePreviewUrl ? (
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`relative overflow-hidden border border-[#B96B78]/25 bg-[#F8E6EB]/45 select-none ${containerAspect} ${
                showFocusPicker
                  ? isDragging
                    ? 'cursor-grabbing touch-none'
                    : 'cursor-grab touch-none'
                  : ''
              }`}
              title={
                showFocusPicker
                  ? 'Seret (drag) langsung pada gambar untuk menggeser posisi'
                  : undefined
              }
            >
              <img
                src={activePreviewUrl}
                alt="Preview gambar"
                draggable={false}
                onLoad={(e) => {
                  const w = e.currentTarget.naturalWidth;
                  const h = e.currentTarget.naturalHeight;
                  if (w > 0 && h > 0) {
                    setNaturalDim({ src: activePreviewUrl, width: w, height: h });
                  }
                }}
                className={
                  aspectMode === 'contain'
                    ? 'w-full h-full object-contain p-3 pointer-events-none'
                    : 'w-full h-full object-cover pointer-events-none'
                }
                style={
                  aspectMode === 'contain'
                    ? undefined
                    : {
                        objectPosition: `${focusX}% ${focusY}%`,
                        transformOrigin: `${focusX}% ${focusY}%`,
                        ...(safeZoom > 100 ? { transform: `scale(${safeZoom / 100})` } : {}),
                      }
                }
              />

              {/* Simulasi gradasi leleh Soft Blush di sisi kiri untuk preview Hero Setengah Kanan */}
              {aspectMode === 'hero-half' && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(255,249,245,0.92) 0%, rgba(248,230,235,0.45) 22%, transparent 48%)',
                  }}
                />
              )}

              {/* Cincin dalam halus untuk preview bingkai lingkaran (medallion Hero) */}
              {aspectMode === 'circle' && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-1.5 rounded-full border border-dashed border-[#C9A27E]/75"
                />
              )}

              {/* Kontrol Zoom In / Zoom Out langsung di atas gambar */}
              {showFocusPicker && onChangeZoom && (
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  className={`absolute z-10 inline-flex items-center gap-1 rounded-full bg-[#3a2529]/75 backdrop-blur-xs text-white px-2 py-1 text-[11px] font-medium shadow-sm ${
                    aspectMode === 'circle'
                      ? 'bottom-3 left-1/2 -translate-x-1/2'
                      : 'bottom-2.5 right-2.5'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => adjustZoom(-ZOOM_STEP)}
                    disabled={safeZoom <= MIN_ZOOM}
                    className="p-1 rounded-full hover:bg-white/20 disabled:opacity-40"
                    aria-label="Perkecil zoom gambar"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="min-w-[34px] text-center tabular-nums">{safeZoom}%</span>
                  <button
                    type="button"
                    onClick={() => adjustZoom(ZOOM_STEP)}
                    disabled={safeZoom >= MAX_ZOOM}
                    className="p-1 rounded-full hover:bg-white/20 disabled:opacity-40"
                    aria-label="Perbesar zoom gambar"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`flex flex-col items-center justify-center gap-2 border border-dashed border-[#B96B78]/35 bg-[#F8E6EB]/30 text-[#8F454B]/70 px-4 text-center ${containerAspect}`}
            >
              <ImagePlus className="w-6 h-6 opacity-70" />
              <span className="text-xs">Belum ada gambar dipilih</span>
            </div>
          )}

          {showFocusPicker && activePreviewUrl && (
            <p className="text-[11px] text-[#594448]/75 max-w-[240px] flex items-start gap-1.5">
              <Move className="w-3.5 h-3.5 shrink-0 text-[#B96B78] mt-0.5" />
              <span>Seret langsung pada foto untuk menggeser posisi, atau pakai tombol zoom.</span>
            </p>
          )}
        </div>

        {/* Kontrol Upload, Info Ukuran & Posisi/Zoom */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-[#B96B78]/40 bg-[#FFF9F5] hover:bg-[#F8E6EB]/60 px-4 py-2 text-xs sm:text-sm font-medium text-[#8F454B] transition-colors"
            >
              <ImagePlus className="w-4 h-4 text-[#B96B78]" />
              <span>{activePreviewUrl ? 'Ganti Gambar' : 'Pilih Gambar'}</span>
            </button>

            {pendingFile && (
              <button
                type="button"
                onClick={() => {
                  onSelectFile(null);
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#594448]/20 px-3.5 py-2 text-xs font-medium text-[#594448] hover:bg-[#F8E6EB]/40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Batalkan Pilihan Baru</span>
              </button>
            )}

            {onClearImage && hasRemovableImage && !pendingFile && (
              <button
                type="button"
                onClick={onClearImage}
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 px-3.5 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Lepas Gambar</span>
              </button>
            )}
          </div>

          {/* Informasi Ukuran Gambar Aktual & Rekomendasi */}
          <div className="rounded-xl border border-[#B96B78]/18 bg-[#FAF6F4] px-3.5 py-2.5 text-xs text-[#594448] space-y-1">
            {displayedDim && (
              <p>
                Ukuran gambar saat ini:{' '}
                <strong className="text-[#8F454B]">
                  {displayedDim.width} × {displayedDim.height} px
                </strong>
                {pendingFile ? ` · ${formatBytes(pendingFile.size)}` : ''}
              </p>
            )}
            {recommendedSize && (
              <p>
                Ukuran disarankan: <strong className="text-[#8F454B]">{recommendedSize}</strong>
              </p>
            )}
            <p className="text-[#594448]/75">
              Format: JPG, PNG, atau WebP · Maksimal <strong>5 MB</strong> per file.
            </p>
          </div>

          {pendingFile && (
            <p className="text-xs text-[#8F454B] bg-[#F8E6EB]/65 rounded-xl px-3 py-2">
              Siap diunggah saat disimpan: <strong>{pendingFile.name}</strong> (
              {formatBytes(pendingFile.size)})
            </p>
          )}

          {errorMsg && (
            <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              {errorMsg}
            </p>
          )}

          {/* Panel Atur Posisi & Zoom Foto */}
          {showFocusPicker && onChangeFocus && activePreviewUrl && (
            <div className="rounded-xl border border-[#B96B78]/20 bg-[#FAF6F4] p-3.5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8F454B]">
                  <Move className="w-3.5 h-3.5 text-[#B96B78]" />
                  Atur Posisi &amp; Zoom Foto
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => onChangeFocus(50, 24)}
                    className="rounded-full bg-white border border-[#B96B78]/25 px-2.5 py-0.5 text-[11px] text-[#594448] hover:bg-[#F8E6EB]/60"
                  >
                    Atas (Wajah)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeFocus(50, 50)}
                    className="rounded-full bg-white border border-[#B96B78]/25 px-2.5 py-0.5 text-[11px] text-[#594448] hover:bg-[#F8E6EB]/60"
                  >
                    Tengah
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChangeFocus(50, 50);
                      onChangeZoom?.(100);
                    }}
                    className="rounded-full bg-white border border-[#B96B78]/25 px-2.5 py-0.5 text-[11px] text-[#594448] hover:bg-[#F8E6EB]/60"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="space-y-1">
                  <span className="text-[#594448]/85">Geser Kanan / Kiri ({focusX}%)</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={focusX}
                    onChange={(e) => onChangeFocus(Number(e.target.value), focusY)}
                    className="w-full accent-[#B96B78]"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[#594448]/85">Geser Atas / Bawah ({focusY}%)</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={focusY}
                    onChange={(e) => onChangeFocus(focusX, Number(e.target.value))}
                    className="w-full accent-[#B96B78]"
                  />
                </label>
              </div>

              {onChangeZoom && (
                <div className="pt-1 border-t border-[#B96B78]/15 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#594448]/85">
                      Zoom In / Zoom Out ({safeZoom}%)
                    </span>
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => adjustZoom(-ZOOM_STEP)}
                        disabled={safeZoom <= MIN_ZOOM}
                        className="inline-flex items-center gap-1 rounded-full bg-white border border-[#B96B78]/25 px-2 py-0.5 text-[11px] text-[#8F454B] hover:bg-[#F8E6EB]/60 disabled:opacity-40"
                      >
                        <ZoomOut className="w-3 h-3" />
                        <span>Zoom Out</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustZoom(ZOOM_STEP)}
                        disabled={safeZoom >= MAX_ZOOM}
                        className="inline-flex items-center gap-1 rounded-full bg-white border border-[#B96B78]/25 px-2 py-0.5 text-[11px] text-[#8F454B] hover:bg-[#F8E6EB]/60 disabled:opacity-40"
                      >
                        <ZoomIn className="w-3 h-3" />
                        <span>Zoom In</span>
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={MIN_ZOOM}
                    max={MAX_ZOOM}
                    step={1}
                    value={safeZoom}
                    onChange={(e) => onChangeZoom(Number(e.target.value))}
                    className="w-full accent-[#B96B78]"
                  />
                </div>
              )}

              <p className="text-[11px] text-[#594448]/70 leading-relaxed">
                Tip: Perbesar zoom (di atas 100%) jika ingin menggeser foto yang ukurannya sudah pas
                dengan bingkai.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
