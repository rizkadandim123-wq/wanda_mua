import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AdminFormBar } from '../../components/admin/AdminFormBar';
import { TextFormatHint } from '../../components/admin/TextFormatHint';
import { useAdminCms } from '../../components/admin/AdminContext';
import { useToast } from '../../components/common/ToastProvider';
import { updateSiteSettings } from '../../lib/cmsService';
import { DEFAULT_SITE_COPY } from '../../lib/defaults';

export function FeedbackEditorPage() {
  const { bundle, reloadBundle } = useAdminCms();
  const { showToast } = useToast();

  const [visible, setVisible] = useState(true);
  const [eyebrow, setEyebrow] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [submitLabel, setSubmitLabel] = useState('');
  const [note, setNote] = useState('');
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!bundle) return;
    const copy = bundle.settings.site_copy ?? DEFAULT_SITE_COPY;
    setVisible(copy.feedback_visible !== false);
    setEyebrow(copy.feedback_eyebrow);
    setTitle(copy.feedback_title);
    setSubtitle(copy.feedback_subtitle);
    setTopics([...copy.feedback_topics]);
    setSubmitLabel(copy.feedback_submit_label);
    setNote(copy.feedback_note);
    setSuccessTitle(copy.feedback_success_title);
    setSuccessMessage(copy.feedback_success_message);
  }, [bundle]);

  if (!bundle) return null;
  const copy = bundle.settings.site_copy ?? DEFAULT_SITE_COPY;

  const isDirty =
    visible !== (copy.feedback_visible !== false) ||
    eyebrow !== copy.feedback_eyebrow ||
    title !== copy.feedback_title ||
    subtitle !== copy.feedback_subtitle ||
    JSON.stringify(topics) !== JSON.stringify(copy.feedback_topics) ||
    submitLabel !== copy.feedback_submit_label ||
    note !== copy.feedback_note ||
    successTitle !== copy.feedback_success_title ||
    successMessage !== copy.feedback_success_message;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setSaveError('Judul bagian Saran & Masukan wajib diisi.');
      return;
    }

    const cleanedTopics = topics.map((t) => t.trim()).filter(Boolean);
    if (cleanedTopics.length === 0) {
      setSaveError('Minimal harus ada satu kategori pesan.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      await updateSiteSettings({
        site_copy: {
          feedback_visible: visible,
          feedback_eyebrow: eyebrow.trim(),
          feedback_title: title.trim(),
          feedback_subtitle: subtitle.trim(),
          feedback_topics: cleanedTopics,
          feedback_submit_label: submitLabel.trim() || 'Kirim Masukan',
          feedback_note: note.trim(),
          feedback_success_title: successTitle.trim() || DEFAULT_SITE_COPY.feedback_success_title,
          feedback_success_message:
            successMessage.trim() || DEFAULT_SITE_COPY.feedback_success_message,
        },
      });
      await reloadBundle();
      setSaveSuccess('Pengaturan Form Masukan berhasil disimpan ke draft.');
      showToast('Form Masukan tersimpan ke draft.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan Form Masukan.';
      setSaveError(msg);
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-[#8F454B]">Form Saran &amp; Masukan</h1>
        <p className="text-sm text-[#594448]/80 mt-1">
          Ubah judul, deskripsi, kategori pilihan pesan, tombol kirim, dan pesan terima kasih pada
          bagian form masukan (Web3Forms).
        </p>
      </div>

      {/* Status Tampil & Teks Utama */}
      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-5">
        <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-[#B96B78]/20 bg-white px-4 py-3">
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
            className="accent-[#B96B78] w-4 h-4"
          />
          <div>
            <span className="block text-sm font-medium text-[#8F454B]">
              Tampilkan Bagian Form Masukan di Website
            </span>
            <span className="block text-xs text-[#594448]/75">
              Nonaktifkan jika sementara tidak ingin menampilkan formulir masukan di bawah Kontak.
            </span>
          </div>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="fb-eyebrow" className="block text-sm font-medium text-[#8F454B]">
              Label Kecil Atas (Eyebrow)
            </label>
            <input
              id="fb-eyebrow"
              type="text"
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              placeholder="Guestbook & Feedback"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="fb-title" className="block text-sm font-medium text-[#8F454B]">
              Judul Bagian
            </label>
            <input
              id="fb-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Saran & *Masukan* Anda"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
            <TextFormatHint />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="fb-subtitle" className="block text-sm font-medium text-[#8F454B]">
            Subjudul / Deskripsi Singkat
          </label>
          <textarea
            id="fb-subtitle"
            rows={3}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="fb-submit" className="block text-sm font-medium text-[#8F454B]">
              Teks Tombol Kirim
            </label>
            <input
              id="fb-submit"
              type="text"
              value={submitLabel}
              onChange={(e) => setSubmitLabel(e.target.value)}
              placeholder="Kirim Masukan"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="fb-note" className="block text-sm font-medium text-[#8F454B]">
              Catatan Kecil Bawah Form
            </label>
            <input
              id="fb-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Pesan Anda akan langsung diteruskan ke tim resmi kami."
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Pilihan Kategori Pesan */}
      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-[#8F454B]">Pilihan Kategori Pesan</h2>
            <p className="text-xs text-[#594448]/75 mt-0.5">
              Tombol pilihan kategori yang dapat diklik pengunjung sebelum menulis pesan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTopics((prev) => [...prev, ''])}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#B96B78]/35 px-4 py-2 text-xs sm:text-sm font-medium text-[#8F454B] hover:bg-[#F8E6EB]/60"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {topics.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const next = [...topics];
                  next[idx] = e.target.value;
                  setTopics(next);
                }}
                placeholder="Contoh: Saran & Masukan"
                className="flex-1 rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2 text-sm"
              />
              <button
                type="button"
                disabled={topics.length <= 1}
                onClick={() => setTopics(topics.filter((_, i) => i !== idx))}
                className="p-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-35"
                aria-label="Hapus kategori"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Teks Konfirmasi Sukses */}
      <div className="rounded-2xl border border-[#B96B78]/20 bg-[#FFF9F5] p-5 sm:p-7 space-y-4">
        <h2 className="font-serif text-xl text-[#8F454B]">Pesan Setelah Terkirim</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="fb-succ-title" className="block text-sm font-medium text-[#8F454B]">
              Judul Terima Kasih
            </label>
            <input
              id="fb-succ-title"
              type="text"
              value={successTitle}
              onChange={(e) => setSuccessTitle(e.target.value)}
              placeholder="Terima Kasih atas Masukan Anda"
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="fb-succ-msg" className="block text-sm font-medium text-[#8F454B]">
              Isi Pesan Terima Kasih
            </label>
            <textarea
              id="fb-succ-msg"
              rows={2}
              value={successMessage}
              onChange={(e) => setSuccessMessage(e.target.value)}
              className="w-full rounded-xl border border-[#B96B78]/25 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>
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
