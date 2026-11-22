import { useEffect, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, RotateCcw } from 'lucide-react';
import { AdminFormBar } from '../../components/admin/AdminFormBar';
import { useAdminCms } from '../../components/admin/AdminContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../components/common/ToastProvider';
import { updateSiteSettings } from '../../lib/cmsService';
import {
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_VISIBILITY,
  DEFAULT_THEME,
  FONT_PRESETS,
  SECTION_LABELS,
} from '../../lib/defaults';
import { contrastRatio, isValidHexColor } from '../../lib/validation';
import type { FontPresetKey, SectionKey } from '../../types/cms';

export function AppearanceEditorPage() {
  const { bundle, reloadBundle } = useAdminCms();
  const { showToast } = useToast();

  const [themeBlush, setThemeBlush] = useState(DEFAULT_THEME.theme_blush);
  const [themeIvory, setThemeIvory] = useState(DEFAULT_THEME.theme_ivory);
  const [themeAccent, setThemeAccent] = useState(DEFAULT_THEME.theme_accent);
  const [themeHeading, setThemeHeading] = useState(DEFAULT_THEME.theme_heading);
  const [themeBody, setThemeBody] = useState(DEFAULT_THEME.theme_body);
  const [fontPreset, setFontPreset] = useState<FontPresetKey>(DEFAULT_THEME.font_preset);
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(DEFAULT_SECTION_ORDER);
  const [sectionVisibility, setSectionVisibility] =
    useState<Record<SectionKey, boolean>>(DEFAULT_SECTION_VISIBILITY);

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!bundle) return;
    const s = bundle.settings;
    setThemeBlush(s.theme_blush);
    setThemeIvory(s.theme_ivory);
    setThemeAccent(s.theme_accent);
    setThemeHeading(s.theme_heading);
    setThemeBody(s.theme_body);
    setFontPreset(s.font_preset);
    setSectionOrder(s.section_order);
    setSectionVisibility(s.section_visibility);
  }, [bundle]);

  if (!bundle) return null;
  const s = bundle.settings;

  const isDirty =
    themeBlush !== s.theme_blush ||
    themeIvory !== s.theme_ivory ||
    themeAccent !== s.theme_accent ||
    themeHeading !== s.theme_heading ||
    themeBody !== s.theme_body ||
    fontPreset !== s.font_preset ||
    JSON.stringify(sectionOrder) !== JSON.stringify(s.section_order) ||
    JSON.stringify(sectionVisibility) !== JSON.stringify(s.section_visibility);

  const bodyContrast =
    isValidHexColor(themeBody) && isValidHexColor(themeIvory)
      ? contrastRatio(themeBody, themeIvory)
      : null;

  const headingContrast =
    isValidHexColor(themeHeading) && isValidHexColor(themeIvory)
      ? contrastRatio(themeHeading, themeIvory)
      : null;

  const moveSection = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= sectionOrder.length) return;
    const next = [...sectionOrder];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    setSectionOrder(next);
  };

  const applyDefaults = async () => {
    setThemeBlush(DEFAULT_THEME.theme_blush);
    setThemeIvory(DEFAULT_THEME.theme_ivory);
    setThemeAccent(DEFAULT_THEME.theme_accent);
    setThemeHeading(DEFAULT_THEME.theme_heading);
    setThemeBody(DEFAULT_THEME.theme_body);
    setFontPreset(DEFAULT_THEME.font_preset);
    setSectionOrder([...DEFAULT_SECTION_ORDER]);
    setSectionVisibility({ ...DEFAULT_SECTION_VISIBILITY });
    setResetDialogOpen(false);
    setSaveError(null);
    setSaveSuccess(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    const colors = [themeBlush, themeIvory, themeAccent, themeHeading, themeBody];
    if (colors.some((c) => !isValidHexColor(c))) {
      setSaveError('Semua kode warna harus berupa hex 6 digit yang valid (contoh: #B96B78).');
      return;
    }

    setSaving(true);
    try {
      await updateSiteSettings({
        theme_blush: themeBlush.toUpperCase(),
        theme_ivory: themeIvory.toUpperCase(),
        theme_accent: themeAccent.toUpperCase(),
        theme_heading: themeHeading.toUpperCase(),
        theme_body: themeBody.toUpperCase(),
        font_preset: fontPreset,
        section_order: sectionOrder,
        section_visibility: sectionVisibility,
      });
      await reloadBundle();
      setSaveSuccess('Tampilan & susunan berhasil disimpan ke draft.');
      showToast('Tampilan & Susunan tersimpan ke draft.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan tampilan.';
      setSaveError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const colorFields = [
    { label: 'Blush Background', value: themeBlush, setter: setThemeBlush },
    { label: 'Ivory Background', value: themeIvory, setter: setThemeIvory },
    { label: 'Aksen & Tombol (Dusty Rose)', value: themeAccent, setter: setThemeAccent },
    { label: 'Warna Judul (Rose Brown)', value: themeHeading, setter: setThemeHeading },
    { label: 'Warna Teks Isi', value: themeBody, setter: setThemeBody },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#8F454B]">Tampilan &amp; Susunan</h1>
          <p className="text-sm text-[#594448]/80 mt-1">
            Sesuaikan palet warna, tipografi, serta urutan bagian di antara Hero dan Footer.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setResetDialogOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-[#B96B78]/35 bg-[#FFF9F5] hover:bg-[#F8E6EB]/65 px-4 py-2 text-xs sm:text-sm font-medium text-[#8F454B]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Kembalikan ke Default</span>
        </button>
      </div>

      {/* Palet Warna */}
      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-xl text-[#8F454B]">Palet Warna Website</h2>
          {bodyContrast !== null && headingContrast !== null && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                bodyContrast >= 4.5 && headingContrast >= 4.5
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              Kontras teks {bodyContrast.toFixed(1)}:1 · judul {headingContrast.toFixed(1)}:1
              {bodyContrast < 4.5 || headingContrast < 4.5
                ? ' (disarankan minimal 4.5:1)'
                : ' (nyaman dibaca)'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorFields.map((field) => (
            <div
              key={field.label}
              className="rounded-xl border border-[#B96B78]/20 bg-white p-3.5 space-y-2"
            >
              <label className="block text-xs font-medium text-[#8F454B]">{field.label}</label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={isValidHexColor(field.value) ? field.value : '#FFF9F5'}
                  onChange={(e) => field.setter(e.target.value.toUpperCase())}
                  className="w-10 h-9 rounded-lg border border-[#B96B78]/20 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value.toUpperCase())}
                  maxLength={7}
                  className="flex-1 min-w-0 rounded-lg border border-[#B96B78]/25 px-2.5 py-1.5 text-sm font-mono uppercase"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pilihan Font */}
      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-4">
        <h2 className="font-serif text-xl text-[#8F454B]">Pasangan Huruf (Font)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {FONT_PRESETS.map((preset) => {
            const active = fontPreset === preset.key;
            return (
              <label
                key={preset.key}
                className={`rounded-2xl border p-4 cursor-pointer transition-colors block ${
                  active
                    ? 'border-[#B96B78] bg-[#F8E6EB]/55'
                    : 'border-[#B96B78]/20 bg-white hover:bg-[#FAF6F4]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="font-preset"
                    value={preset.key}
                    checked={active}
                    onChange={() => setFontPreset(preset.key)}
                    className="mt-1 accent-[#B96B78]"
                  />
                  <div>
                    <p
                      className="text-xl text-[#8F454B]"
                      style={{ fontFamily: preset.serifFont }}
                    >
                      Cantik <em className="italic">natural</em> di hari istimewa
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#594448]">{preset.label}</p>
                    <p className="mt-0.5 text-xs text-[#594448]/75">{preset.description}</p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Urutan & Visibilitas Bagian */}
      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-4">
        <div>
          <h2 className="font-serif text-xl text-[#8F454B]">Susunan Bagian Halaman</h2>
          <p className="text-xs text-[#594448]/75 mt-0.5">
            Header, Hero, dan Footer tetap berada pada posisi yang konsisten. Bagian di antaranya
            dapat diurutkan atau disembunyikan.
          </p>
        </div>

        <div className="space-y-2.5">
          <div className="rounded-xl border border-dashed border-[#B96B78]/25 bg-[#FAF6F4] px-4 py-2.5 text-xs text-[#594448]/75">
            Atas (Tetap): Header &amp; Hero
          </div>

          {sectionOrder.map((key, idx) => {
            const isVisible = sectionVisibility[key] !== false;
            return (
              <div
                key={key}
                className="rounded-xl border border-[#B96B78]/20 bg-white px-4 py-3 flex items-center justify-between gap-3"
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) =>
                      setSectionVisibility({
                        ...sectionVisibility,
                        [key]: e.target.checked,
                      })
                    }
                    className="accent-[#B96B78] w-4 h-4"
                  />
                  <span className="text-sm font-medium text-[#8F454B]">
                    {SECTION_LABELS[key]}
                  </span>
                  {!isVisible && (
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600">
                      Disembunyikan
                    </span>
                  )}
                </label>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg border border-[#B96B78]/20 disabled:opacity-35"
                    aria-label={`Naikkan ${SECTION_LABELS[key]}`}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(idx, 1)}
                    disabled={idx === sectionOrder.length - 1}
                    className="p-1.5 rounded-lg border border-[#B96B78]/20 disabled:opacity-35"
                    aria-label={`Turunkan ${SECTION_LABELS[key]}`}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="rounded-xl border border-dashed border-[#B96B78]/25 bg-[#FAF6F4] px-4 py-2.5 text-xs text-[#594448]/75">
            Bawah (Tetap): Footer
          </div>
        </div>
      </div>

      <AdminFormBar
        isDirty={isDirty}
        saving={saving}
        saveError={saveError}
        saveSuccess={saveSuccess}
      />

      <ConfirmDialog
        open={resetDialogOpen}
        title="Kembalikan Pengaturan Tampilan ke Default?"
        description="Warna Soft Blush, pasangan font Cormorant Garamond + Plus Jakarta Sans, serta urutan dan status tampil standar akan dipulihkan pada form ini. Klik Simpan Draft sesudahnya untuk menyimpan."
        confirmLabel="Ya, Kembalikan Default"
        onConfirm={() => void applyDefaults()}
        onCancel={() => setResetDialogOpen(false)}
      />
    </form>
  );
}
