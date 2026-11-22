import { useEffect, useState, type FormEvent } from 'react';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { AdminFormBar } from '../../components/admin/AdminFormBar';
import { TextFormatHint } from '../../components/admin/TextFormatHint';
import { useAdminCms } from '../../components/admin/AdminContext';
import { useToast } from '../../components/common/ToastProvider';
import { updateSiteSettings } from '../../lib/cmsService';
import { DEFAULT_SITE_COPY } from '../../lib/defaults';
import {
  buildWhatsAppUrl,
  formatWhatsAppDigits,
  isValidEmail,
  sanitizeExternalUrl,
} from '../../lib/validation';
import type { ExtraSocialLink, WhatsAppQuickPreset } from '../../types/cms';

export function ContactEditorPage() {
  const { bundle, reloadBundle } = useAdminCms();
  const { showToast } = useToast();

  const [contactEyebrow, setContactEyebrow] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [contactDescription, setContactDescription] = useState('');
  const [contactCtaLabel, setContactCtaLabel] = useState('');
  const [contactNote, setContactNote] = useState('');
  const [contactCardEyebrow, setContactCardEyebrow] = useState('');
  const [contactCardTitle, setContactCardTitle] = useState('');

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [email, setEmail] = useState('');
  const [addressOrArea, setAddressOrArea] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [extraSocials, setExtraSocials] = useState<ExtraSocialLink[]>([]);

  // Pengaturan Popup WhatsApp Mengambang
  const [waWidgetSubtitle, setWaWidgetSubtitle] = useState('');
  const [waWidgetGreeting, setWaWidgetGreeting] = useState('');
  const [waWidgetButtonLabel, setWaWidgetButtonLabel] = useState('');
  const [waWidgetPresets, setWaWidgetPresets] = useState<WhatsAppQuickPreset[]>([]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!bundle) return;
    const s = bundle.settings;
    const copy = s.site_copy ?? DEFAULT_SITE_COPY;
    setContactEyebrow(copy.contact_eyebrow);
    setContactTitle(s.contact_title);
    setContactDescription(s.contact_description);
    setContactCtaLabel(copy.contact_cta_label);
    setContactNote(copy.contact_note);
    setContactCardEyebrow(copy.contact_card_eyebrow);
    setContactCardTitle(copy.contact_card_title);

    setWhatsappNumber(s.whatsapp_number);
    setWhatsappMessage(s.whatsapp_default_message);
    setInstagramHandle(s.instagram_handle);
    setInstagramUrl(s.instagram_url);
    setEmail(s.email);
    setAddressOrArea(s.address_or_area);
    setOperatingHours(s.operating_hours);
    setExtraSocials(s.extra_social_links ?? []);

    setWaWidgetSubtitle(copy.wa_widget_subtitle);
    setWaWidgetGreeting(copy.wa_widget_greeting);
    setWaWidgetButtonLabel(copy.wa_widget_button_label);
    setWaWidgetPresets((copy.wa_widget_presets ?? []).map((p) => ({ ...p })));
  }, [bundle]);

  if (!bundle) return null;
  const s = bundle.settings;
  const copy = s.site_copy ?? DEFAULT_SITE_COPY;

  const isDirty =
    contactEyebrow !== copy.contact_eyebrow ||
    contactTitle !== s.contact_title ||
    contactDescription !== s.contact_description ||
    contactCtaLabel !== copy.contact_cta_label ||
    contactNote !== copy.contact_note ||
    contactCardEyebrow !== copy.contact_card_eyebrow ||
    contactCardTitle !== copy.contact_card_title ||
    whatsappNumber !== s.whatsapp_number ||
    whatsappMessage !== s.whatsapp_default_message ||
    instagramHandle !== s.instagram_handle ||
    instagramUrl !== s.instagram_url ||
    email !== s.email ||
    addressOrArea !== s.address_or_area ||
    operatingHours !== s.operating_hours ||
    JSON.stringify(extraSocials) !== JSON.stringify(s.extra_social_links ?? []) ||
    waWidgetSubtitle !== copy.wa_widget_subtitle ||
    waWidgetGreeting !== copy.wa_widget_greeting ||
    waWidgetButtonLabel !== copy.wa_widget_button_label ||
    JSON.stringify(waWidgetPresets) !== JSON.stringify(copy.wa_widget_presets ?? []);

  const previewWaUrl = buildWhatsAppUrl(whatsappNumber, whatsappMessage);

  const handleAddSocial = () => {
    setExtraSocials((prev) => [
      ...prev,
      { id: `social-${Date.now()}`, label: '', url: '' },
    ]);
  };

  const handleAddPreset = () => {
    setWaWidgetPresets((prev) => [...prev, { label: '', text: '' }]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    if (whatsappNumber.trim() && !formatWhatsAppDigits(whatsappNumber)) {
      setSaveError(
        'Format nomor WhatsApp tidak valid. Gunakan nomor aktif seperti 081234567890 atau 6281234567890.'
      );
      return;
    }

    if (instagramUrl.trim() && !sanitizeExternalUrl(instagramUrl)) {
      setSaveError('Link Instagram tidak valid. Gunakan URL http:// atau https:// yang benar.');
      return;
    }

    if (email.trim() && !isValidEmail(email)) {
      setSaveError('Format alamat email tidak valid.');
      return;
    }

    const cleanedSocials: ExtraSocialLink[] = [];
    for (const item of extraSocials) {
      if (!item.label.trim() && !item.url.trim()) continue;
      if (!item.label.trim()) {
        setSaveError('Nama platform pada tautan media sosial tambahan wajib diisi.');
        return;
      }
      const safe = sanitizeExternalUrl(item.url);
      if (!safe) {
        setSaveError(
          `URL untuk "${item.label.trim()}" tidak valid. Pastikan diawali https:// yang benar.`
        );
        return;
      }
      cleanedSocials.push({
        id: item.id,
        label: item.label.trim(),
        url: safe,
      });
    }

    const cleanedPresets: WhatsAppQuickPreset[] = waWidgetPresets
      .map((item) => ({
        label: item.label.trim(),
        text: item.text.trim(),
      }))
      .filter((item) => Boolean(item.label && item.text));

    setSaving(true);
    try {
      await updateSiteSettings({
        contact_title: contactTitle.trim() || 'Jadwalkan *Konsultasi* Anda',
        contact_description: contactDescription.trim(),
        whatsapp_number: whatsappNumber.trim(),
        whatsapp_default_message: whatsappMessage.trim(),
        instagram_handle: instagramHandle.trim(),
        instagram_url: instagramUrl.trim() ? (sanitizeExternalUrl(instagramUrl) ?? '') : '',
        email: email.trim(),
        address_or_area: addressOrArea.trim(),
        operating_hours: operatingHours.trim(),
        extra_social_links: cleanedSocials,
        site_copy: {
          contact_eyebrow: contactEyebrow.trim() || 'Reservation & Inquiry',
          contact_cta_label: contactCtaLabel.trim() || 'Konsultasi via WhatsApp',
          contact_note: contactNote.trim(),
          contact_card_eyebrow: contactCardEyebrow.trim() || 'Atelier Concierge',
          contact_card_title: contactCardTitle.trim() || 'Informasi & Jadwal Layanan',
          wa_widget_subtitle: waWidgetSubtitle.trim() || 'Konsultasi via WhatsApp',
          wa_widget_greeting: waWidgetGreeting.trim(),
          wa_widget_button_label: waWidgetButtonLabel.trim() || 'Kirim ke WhatsApp',
          wa_widget_presets: cleanedPresets,
        },
      });
      await reloadBundle();
      setSaveSuccess('Informasi kontak, teks bagian Kontak, dan popup WhatsApp disimpan ke draft.');
      showToast('Kontak & Media Sosial tersimpan ke draft.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan kontak.';
      setSaveError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-[#8F454B]">Kontak &amp; Media Sosial</h1>
        <p className="text-sm text-[#594448]/80 mt-1">
          Atur seluruh teks bagian Kontak, saluran resmi, serta isi popup ikon WhatsApp mengambang.
        </p>
      </div>

      {/* Teks Bagian Kontak */}
      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-5">
        <TextFormatHint />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="contact-eyebrow" className="block text-sm font-medium text-[#8F454B]">
              Label Kecil Atas (Kiri)
            </label>
            <input
              id="contact-eyebrow"
              type="text"
              value={contactEyebrow}
              onChange={(e) => setContactEyebrow(e.target.value)}
              placeholder="Reservation & Inquiry"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-title" className="block text-sm font-medium text-[#8F454B]">
              Judul Ajakan Konsultasi
            </label>
            <input
              id="contact-title"
              type="text"
              required
              value={contactTitle}
              onChange={(e) => setContactTitle(e.target.value)}
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-desc" className="block text-sm font-medium text-[#8F454B]">
            Deskripsi Kontak
          </label>
          <textarea
            id="contact-desc"
            rows={3}
            value={contactDescription}
            onChange={(e) => setContactDescription(e.target.value)}
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="contact-cta-lbl" className="block text-sm font-medium text-[#8F454B]">
              Teks Tombol WhatsApp
            </label>
            <input
              id="contact-cta-lbl"
              type="text"
              value={contactCtaLabel}
              onChange={(e) => setContactCtaLabel(e.target.value)}
              placeholder="Konsultasi via WhatsApp"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-note" className="block text-sm font-medium text-[#8F454B]">
              Catatan Kecil Bawah Tombol
            </label>
            <input
              id="contact-note"
              type="text"
              value={contactNote}
              onChange={(e) => setContactNote(e.target.value)}
              placeholder="Private Appointment"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-[#B96B78]/15">
          <div className="space-y-1.5">
            <label htmlFor="contact-card-eyebrow" className="block text-sm font-medium text-[#8F454B]">
              Label Atas Kartu Informasi (Kanan)
            </label>
            <input
              id="contact-card-eyebrow"
              type="text"
              value={contactCardEyebrow}
              onChange={(e) => setContactCardEyebrow(e.target.value)}
              placeholder="Atelier Concierge"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-card-title" className="block text-sm font-medium text-[#8F454B]">
              Judul Kartu Informasi (Kanan)
            </label>
            <input
              id="contact-card-title"
              type="text"
              value={contactCardTitle}
              onChange={(e) => setContactCardTitle(e.target.value)}
              placeholder="Informasi & Jadwal Layanan"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-[#B96B78]/15">
          <div className="space-y-1.5">
            <label htmlFor="wa-num" className="block text-sm font-medium text-[#8F454B]">
              Nomor WhatsApp Bisnis
            </label>
            <input
              id="wa-num"
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="Contoh: 081234567890 atau 6281234567890"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
            {previewWaUrl ? (
              <a
                href={previewWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#8F454B] hover:underline"
              >
                <span>Uji tautan: {previewWaUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              whatsappNumber.trim() && (
                <p className="text-xs text-rose-700">Format nomor belum valid.</p>
              )
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="wa-msg" className="block text-sm font-medium text-[#8F454B]">
              Pesan Pembuka WhatsApp (Default)
            </label>
            <input
              id="wa-msg"
              type="text"
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
              placeholder="Halo Niwayuliana Makeup Artist, saya ingin berkonsultasi..."
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-[#B96B78]/15">
          <div className="space-y-1.5">
            <label htmlFor="ig-handle" className="block text-sm font-medium text-[#8F454B]">
              Username Instagram
            </label>
            <input
              id="ig-handle"
              type="text"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              placeholder="@niwayuliana.mua"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ig-url" className="block text-sm font-medium text-[#8F454B]">
              Link Profil Instagram (Opsional)
            </label>
            <input
              id="ig-url"
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
            <p className="text-xs text-[#594448]/70">
              Jika kosong, link otomatis dibentuk dari username Instagram di sebelah kiri.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-email" className="block text-sm font-medium text-[#8F454B]">
              Email (Opsional)
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="studio@contoh.com"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-hours" className="block text-sm font-medium text-[#8F454B]">
              Jam Operasional (Opsional)
            </label>
            <input
              id="contact-hours"
              type="text"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              placeholder="Contoh: Setiap hari 08.00 – 19.00 (Dengan janji temu)"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-address" className="block text-sm font-medium text-[#8F454B]">
            Alamat Studio / Area Layanan
          </label>
          <textarea
            id="contact-address"
            rows={2}
            value={addressOrArea}
            onChange={(e) => setAddressOrArea(e.target.value)}
            placeholder="Kosongkan jika belum ingin ditampilkan"
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Pengaturan Popup Ikon WhatsApp Mengambang */}
      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-5">
        <div>
          <h2 className="font-serif text-xl text-[#8F454B]">Popup Ikon WhatsApp Mengambang</h2>
          <p className="text-xs text-[#594448]/75 mt-0.5">
            Atur kata sapaan, teks tombol kirim, dan tombol pesan cepat pada ikon WhatsApp di pojok
            kanan bawah.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="wa-w-sub" className="block text-sm font-medium text-[#8F454B]">
              Subjudul Header Popup
            </label>
            <input
              id="wa-w-sub"
              type="text"
              value={waWidgetSubtitle}
              onChange={(e) => setWaWidgetSubtitle(e.target.value)}
              placeholder="Konsultasi via WhatsApp"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="wa-w-btn" className="block text-sm font-medium text-[#8F454B]">
              Label Tombol Kirim
            </label>
            <input
              id="wa-w-btn"
              type="text"
              value={waWidgetButtonLabel}
              onChange={(e) => setWaWidgetButtonLabel(e.target.value)}
              placeholder="Kirim ke WhatsApp"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="wa-w-greet" className="block text-sm font-medium text-[#8F454B]">
            Teks Sapaan di Dalam Popup
          </label>
          <textarea
            id="wa-w-greet"
            rows={2}
            value={waWidgetGreeting}
            onChange={(e) => setWaWidgetGreeting(e.target.value)}
            placeholder="Halo! Silakan tulis pesan Anda di bawah..."
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
          />
        </div>

        <div className="space-y-3 pt-2 border-t border-[#B96B78]/15">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-[#8F454B]">Tombol Pesan Cepat (Opsional)</p>
              <p className="text-xs text-[#594448]/70">
                Tombol &quot;Default&quot; selalu tersedia otomatis dari Pesan Pembuka WhatsApp di
                atas.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddPreset}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#B96B78]/35 px-3.5 py-1.5 text-xs font-medium text-[#8F454B] hover:bg-[#F8E6EB]/60"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pesan Cepat</span>
            </button>
          </div>

          {waWidgetPresets.length === 0 ? (
            <p className="text-xs text-[#594448]/70 italic">
              Belum ada tombol pesan cepat tambahan.
            </p>
          ) : (
            <div className="space-y-3">
              {waWidgetPresets.map((preset, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <input
                    type="text"
                    value={preset.label}
                    onChange={(e) => {
                      const next = [...waWidgetPresets];
                      next[idx] = { ...preset, label: e.target.value };
                      setWaWidgetPresets(next);
                    }}
                    placeholder="Label (misal: Tanya Jadwal)"
                    className="sm:col-span-4 rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={preset.text}
                    onChange={(e) => {
                      const next = [...waWidgetPresets];
                      next[idx] = { ...preset, text: e.target.value };
                      setWaWidgetPresets(next);
                    }}
                    placeholder="Isi pesan otomatis saat diklik..."
                    className="sm:col-span-7 rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setWaWidgetPresets(waWidgetPresets.filter((_, i) => i !== idx))
                    }
                    className="sm:col-span-1 justify-self-end p-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50"
                    aria-label="Hapus pesan cepat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Media Sosial Tambahan */}
      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-[#8F454B]">Tautan Media Sosial Lainnya</h2>
            <p className="text-xs text-[#594448]/75 mt-0.5">
              Misalnya TikTok, Pinterest, YouTube, atau Google Maps studio.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddSocial}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#B96B78]/35 px-4 py-2 text-xs sm:text-sm font-medium text-[#8F454B] hover:bg-[#F8E6EB]/60"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tautan</span>
          </button>
        </div>

        {extraSocials.length === 0 ? (
          <p className="text-xs text-[#594448]/70 italic">Belum ada tautan tambahan.</p>
        ) : (
          <div className="space-y-3">
            {extraSocials.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => {
                    const next = [...extraSocials];
                    next[idx] = { ...item, label: e.target.value };
                    setExtraSocials(next);
                  }}
                  placeholder="Nama Platform (misal: TikTok)"
                  className="sm:col-span-4 rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
                />
                <input
                  type="url"
                  value={item.url}
                  onChange={(e) => {
                    const next = [...extraSocials];
                    next[idx] = { ...item, url: e.target.value };
                    setExtraSocials(next);
                  }}
                  placeholder="https://..."
                  className="sm:col-span-7 rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setExtraSocials(extraSocials.filter((s) => s.id !== item.id))}
                  className="sm:col-span-1 justify-self-end p-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50"
                  aria-label="Hapus tautan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminFormBar
        isDirty={isDirty}
        saving={saving}
        saveError={saveError}
        saveSuccess={saveSuccess}
      />
    </form>
  );
}
