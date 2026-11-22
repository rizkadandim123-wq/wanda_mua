# Niwayuliana Makeup Artist — Website Company Profile & Admin CMS

Website company profile untuk bisnis **Niwayuliana Makeup Artist** bertema **Soft Blush**, berjalan di **Cloudflare (Pages / Workers)** dengan database **Supabase PostgreSQL**, login 1 akun profil sederhana (`public.profiles`), dan penyimpanan foto di **Cloudflare R2** (`MEDIA_BUCKET`).

---

## Ringkasan Arsitektur

- **Website Publik (`/`)**: mengambil snapshot rilis aktif (`published_releases` dengan `is_current = true`) lewat `/api/public/site`, dan foto publik dari R2 (`public/...` lewat `/api/media/public/...` atau custom domain `R2_PUBLIC_URL`).
- **Admin CMS (`/admin/login`, `/admin`, `/preview`)**:
  - Login sederhana berbasis tabel **`public.profiles`** (1 akun `username` + `password` dengan `pgcrypto` bcrypt, tanpa email / Supabase Auth).
  - Seluruh CRUD database & R2 melewati API server Cloudflare (`/api/admin/*`) memakai cookie `HttpOnly` bertanda tangan HMAC-SHA256 (`niwa_admin_session`).
  - Foto draft disimpan di prefix **`draft/...`** pada R2 dan hanya bisa dilihat admin lewat `/api/admin/media/:id` (pengunjung publik diblokir mengakses `draft/`). Saat klik **Publikasikan**, foto disalin ke prefix **`public/...`** dan snapshot versi baru diterbitkan secara atomik.
- **Isolasi Dev Lokal**: Saat menjalankan `npm run dev` (atau `npm.cmd run dev`), upload foto disimpan ke folder disk lokal **`.local-r2/`**, sehingga **tidak masuk ke Cloudflare R2 produksi**.

---

## Catatan Mengenai Foto Demo

Foto bawaan di `public/demo/` (`hero-main.png`, `hero-detail.png`, `service-bridal.png`, `service-engagement.png`, `service-graduation.png`, `about-mua.png`) hanyalah **foto demo/contoh sementara** untuk tata letak awal dan dapat langsung diganti dengan foto asli lewat Admin CMS.

---

## 1. Persiapan & Instalasi Lokal

1. Pastikan **Node.js 20+** telah terpasang.
2. Salin `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Di PowerShell Windows: `Copy-Item .env.example .env`)*
3. Pasang dependensi:
   ```bash
   npm install
   ```
   *(Jika Execution Policy PowerShell memblokir `npm.ps1`, gunakan `npm.cmd install`.)*

---

## 2. Konfigurasi Database Supabase (5 File SQL)

1. Buat project di [Supabase Dashboard](https://supabase.com/dashboard), lalu salin dari **Project Settings → Data API / API**:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (`sb_secret_...` atau legacy `service_role`)
   - `SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...` atau `anon`)
2. Isi nilai tersebut di `.env` (untuk lokal) dan di Environment Variables Cloudflare (untuk produksi). Jangan memakai prefix `VITE_`.
3. Buka **SQL Editor** di Supabase Dashboard dan jalankan file migrasi secara berurutan:
   - [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql) — membuat tabel `public.profiles`, tabel CMS, trigger draft, fungsi login/ganti sandi/publikasi, dan RLS.
   - [`supabase/migrations/0002_seed_initial_content.sql`](supabase/migrations/0002_seed_initial_content.sql) — mengisi data awal website (kontak asli dikosongkan) dan rilis versi 1.
   - [`supabase/migrations/0003_add_image_zoom.sql`](supabase/migrations/0003_add_image_zoom.sql) — menambah kolom zoom foto (100%–220%) serta memperbarui fungsi publikasi.
   - [`supabase/migrations/0004_service_categories_and_testimonials_rating.sql`](supabase/migrations/0004_service_categories_and_testimonials_rating.sql) — menambah tabel `service_categories`, isian paket layanan, subjudul testimoni, dan rating bintang.
   - [`supabase/migrations/0005_enable_default_logo.sql`](supabase/migrations/0005_enable_default_logo.sql) — mengaktifkan tampilan logo bawaan (`public/logo.svg`) bersama nama bisnis secara default.

---

## 3. Membuat 1 Akun Admin Tunggal (`public.profiles`)

- **Cara A (Lewat Browser — Termudah):** Buka `/admin/login`. Karena tabel `public.profiles` masih kosong, halaman akan menampilkan form **Buat Akun Admin Pertama** (`username` + `password`). Setelah dibuat, pendaftaran otomatis terkunci permanen.
- **Cara B (Lewat Supabase SQL Editor):**
  ```sql
  SELECT public.create_initial_admin_profile(
    'niwayuliana',
    'GantiDenganPasswordKuat123!',
    'Admin Niwayuliana'
  );
  ```

---

## 4. Konfigurasi Cloudflare R2 & Deploy

### Langkah A — Buat R2 Bucket di Cloudflare
1. Masuk ke **Cloudflare Dashboard → R2 Object Storage → Create bucket**.
2. Buat bucket bernama **`niwayuliana-media`** (atau sesuaikan nama di `wrangler.jsonc`).
3. Anda **tidak perlu** membuka akses publik bucket R2 secara langsung karena endpoint `/api/media/public/...` sudah menyaring hanya prefix `public/` dan menolak semua akses ke `draft/`. *(Opsional: bila ingin URL CDN langsung via custom domain R2, hanya arahkan ke prefix publik atau gunakan `R2_PUBLIC_URL`.)*

### Langkah B — Deploy ke Cloudflare Pages (Menggunakan `functions/api/[[path]].ts`)
1. Hubungkan repository ke **Cloudflare Dashboard → Workers & Pages → Create → Pages** (atau via CLI `npx wrangler pages deploy dist --project-name niwayuliana-mua`).
2. Build command: `npm run build` | Build output directory: `dist`.
3. Pada **Settings → Functions → R2 bucket bindings**, tambahkan binding:
   - **Variable name**: `MEDIA_BUCKET`
   - **R2 bucket**: `niwayuliana-media`
4. Pada **Settings → Environment variables** (Production & Preview), isi:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (Encrypt/Secret)
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SESSION_SECRET` (Encrypt/Secret)

### Langkah C — Atau Deploy ke Cloudflare Workers Static Assets (`wrangler.jsonc` + `worker/index.ts`)
1. Jalankan `npm run build`.
2. Tambahkan secret lewat Wrangler:
   ```bash
   npx wrangler secret put SUPABASE_URL
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   npx wrangler secret put SUPABASE_PUBLISHABLE_KEY
   npx wrangler secret put SESSION_SECRET
   ```
3. Pastikan bucket `niwayuliana-media` sudah dibuat di R2, lalu deploy:
   ```bash
   npx wrangler deploy
   ```

---

## 5. Menjalankan di Lokal

```bash
npm.cmd run dev
```
- Website publik: `http://localhost:5173/`
- Admin CMS: `http://localhost:5173/admin/login`
- Upload foto di lokal otomatis disimpan ke folder `.local-r2/` di mesin Anda (bukan R2 produksi).
"# wanda_mua" 
