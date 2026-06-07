# 📖 Panduan Integrasi Lengkap: Google OAuth, SMTP Resend, dan Supabase Cron Jobs

Panduan ini berisi langkah-langkah praktis dan sangat detail untuk mengonfigurasi tiga integrasi eksternal penting pada website perpustakaan/booking Anda:
1. **Google OAuth** (Pendaftaran & Login akun Google).
2. **Resend SMTP** (Menghubungkan pengiriman email Supabase via server SMTP Resend).
3. **Supabase Native Cron Jobs** (Penjadwalan tugas otomatis seperti pengingat peminjaman menggunakan `pg_cron`).

---

## 📋 DAFTAR ISI
1. [Bagian 1: Google OAuth (Google Cloud Console & Supabase)](#-bagian-1-google-oauth-google-cloud-console--supabase)
2. [Bagian 2: Integrasi Resend SMTP ke dalam Supabase](#-bagian-2-integrasi-resend-smtp-ke-dalam-supabase)
3. [Bagian 3: Setup Supabase Native Cron Jobs (pg_cron)](#-bagian-3-setup-supabase-native-cron-jobs-pg_cron)

---

## 🔐 BAGIAN 1: GOOGLE OAUTH (GOOGLE CLOUD CONSOLE & SUPABASE)

Opsi ini memungkinkan pengguna untuk login atau mendaftar menggunakan akun Google mereka secara instan.

### Langkah A: Membuat Kredensial di Google Cloud Console
1. Buka halaman **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Login menggunakan akun Google/Gmail Anda.
3. Di bilah menu atas, klik dropdown proyek dan pilih **"New Project"** (Proyek Baru). Beri nama proyek, misalnya: `Disipusda Perpustakaan`, lalu klik **Create**.
4. Masuk ke halaman **OAuth Consent Screen** (Layar Persetujuan OAuth) di menu sidebar kiri:
   * **User Type:** Pilih **External** (agar bisa diakses publik oleh semua email), lalu klik **Create**.
   * **App Information:** Isi *App Name* dengan **Disipusda Purwakarta** dan masukkan email dukungan Anda di *User support email*.
   * **Developer Contact Information:** Masukkan email Anda.
   * Klik **Save and Continue** sampai selesai (lewati bagian scopes dan test users untuk saat ini), lalu klik **Back to Dashboard**.
   * Klik tombol **"Publish App"** agar status consent screen menjadi Live (tidak lagi draf / testing).
5. Masuk ke halaman **Credentials** di menu sidebar kiri:
   * Klik tombol **+ Create Credentials** di bagian atas, lalu pilih **OAuth Client ID**.
   * **Application Type:** Pilih **Web Application**.
   * **Name:** Isi dengan `Frontend Web Perpustakaan`.
   * **Authorized JavaScript origins:** Tambahkan URL domain frontend Anda (tanpa garis miring di akhir):
     * `http://localhost:5173` (untuk uji coba lokal di komputer Anda).
     * `https://domain-anda.com` (domain produksi utama).
   * **Authorized redirect URIs:** Ini adalah URL tujuan setelah Google memverifikasi pengguna. Anda wajib mengambil URL Callback dari Supabase:
     ```text
     https://<ref-project-supabase-anda>.supabase.co/auth/v1/callback
     ```
     *(Ganti `<ref-project-supabase-anda>` dengan ID referensi project Supabase Anda).*
   * Klik **Create**.
6. Google akan memunculkan pop-up berisi **Client ID** dan **Client Secret**. Salin kedua kunci tersebut.

### Langkah B: Memasang Kredensial di Dashboard Supabase
1. Buka **[Supabase Dashboard](https://supabase.com)** dan masuk ke proyek Anda.
2. Masuk ke menu **Auth** > **Providers** > klik dropdown **Google**.
3. Aktifkan sakelar **"Enable Google Provider"**.
4. Masukkan **Client ID** dan **Client Secret** yang Anda peroleh dari Google Cloud Console di kolom yang sesuai.
5. Klik **Save**.

---

## 📧 BAGIAN 2: INTEGRASI RESEND SMTP & EDGE FUNCTIONS KE SUPABASE

Secara default, Supabase membatasi pengiriman email konfirmasi (maksimal 3 email per jam). Untuk produksi, Anda wajib mengaktifkan custom SMTP menggunakan **Resend SMTP** dan mengonfigurasi **Supabase Edge Functions Secrets** agar pengiriman email dari website Anda tidak dibatasi dan langsung masuk Inbox penerima.

### Langkah A: Mendapatkan Kredensial SMTP di Resend
1. Buka **[Resend.com](https://resend.com)** dan masuk ke akun Anda.
2. Pastikan domain Anda telah terdaftar dan berstatus **"Verified"** (baca panduan verifikasi domain di `docs/integration/panduan_setup_resend.md`).
3. Masuk ke menu **API Keys** di sidebar kiri.
4. Klik **Create API Key**:
   * **Name:** `Supabase SMTP Integration`
   * **Permission:** Pilih **Sending access** (atau Full Access).
   * **Domain:** Pilih domain terverifikasi Anda.
5. Klik **Add**, lalu **salin API Key** yang muncul (berawalan `re_xxxxxxxx`).

### Langkah B: Konfigurasi Custom SMTP di Supabase Auth
1. Masuk ke **Supabase Dashboard** > **Auth** > **SMTP Settings**.
2. Aktifkan sakelar **"Enable Custom SMTP"**.
3. Isi kolom konfigurasi SMTP secara persis seperti berikut:
   * **Sender Email:** Masukkan email dengan domain Anda yang sudah diverifikasi di Resend (contoh: `no-reply@lann.codes` atau `admin@perpustakaandaerah.com`).
   * **Sender Name:** `Disipusda Purwakarta` (Nama pengirim yang muncul di email).
   * **SMTP Host:** **`smtp.resend.com`**
   * **Port:** **`465`** (menggunakan SSL) atau **`587`** (menggunakan TLS). *Direkomendasikan menggunakan `465`*.
   * **SMTP Username:** **`resend`** (tulis huruf kecil semua, jangan gunakan nama email Anda).
   * **SMTP Password:** Masukkan **API Key** Resend yang Anda buat di Langkah A (contoh: `re_123456789...`).
4. Klik **Save Changes**.

### Langkah C: Menyetel Secrets (Environment Variables) di Supabase Edge Functions
Supabase Edge Functions memerlukan API keys rahasia untuk mengirim email kustom (via Resend API) dan notifikasi bot admin (via Telegram API). 

Daftarkan variabel rahasia ini di dashboard Supabase:
1. Buka **Supabase Dashboard** > **Settings** (ikon roda gigi) > pilih **Edge Functions**.
2. Di bagian **Custom Secrets**, tambahkan variabel berikut satu per satu:
   * **`RESEND_API_KEY`**: API Key Resend Anda (contoh: `re_123456...`).
   * **`RESEND_FROM_EMAIL`**: Email resmi pengirim di Resend (contoh: `Disipusda <no-reply@lann.codes>`).
   * **`TELEGRAM_BOT_TOKEN`**: Token bot Telegram Anda dari `@BotFather`.
   * **`TELEGRAM_ADMIN_CHAT_ID`**: ID chat Telegram admin penerima notifikasi.
   * **`SITE_URL`**: URL web frontend Anda (contoh: `https://lann.codes`).
   * **`CRON_SECRET`**: Kunci rahasia acak untuk pengamanan tugas otomatis (Cron).
3. Anda juga dapat menggunakan perintah terminal Supabase CLI jika ingin melakukan set secara bersamaan:
   ```bash
   supabase secrets set RESEND_API_KEY="re_key_anda" RESEND_FROM_EMAIL="Disipusda <no-reply@lann.codes>" TELEGRAM_BOT_TOKEN="token_bot" TELEGRAM_ADMIN_CHAT_ID="id_chat" SITE_URL="https://lann.codes" CRON_SECRET="kunci_cron"
   ```

### Langkah D: Mendeploy 6 Edge Functions ke Cloud Supabase
Pastikan Anda mengunggah berkas fungsi yang ada di folder `supabase/functions/` ke server Supabase agar backend notifikasi aktif:
1. Jalankan terminal di folder proyek lokal Anda.
2. Login dan tautkan proyek:
   ```bash
   supabase login
   supabase link --project-ref <PROJECT_REF_ID>
   ```
3. Deploy seluruh fungsi dengan perintah berikut:
   ```bash
   supabase functions deploy booking-notification
   supabase functions deploy booking-status-change
   supabase functions deploy send-booking-digest
   supabase functions deploy send-borrow-notification
   supabase functions deploy send-borrow-reminders
   supabase functions deploy telegram-webhook
   ```
4. Pastikan keenam fungsi di atas sudah berstatus **Active** di dashboard Supabase Anda.

---

## ⏰ BAGIAN 3: SETUP SUPABASE NATIVE CRON JOBS (PG_CRON)

Website perpustakaan Anda membutuhkan tugas otomatis yang berjalan di latar belakang (misal: mengirim email pengingat peminjaman buku yang mendekati jatuh tempo setiap hari). Supabase mendukung hal ini secara natif melalui ekstensi `pg_cron`.

### Langkah A: Mengaktifkan Ekstensi Database di Supabase
1. Buka **Supabase Dashboard** > **Database** (di sidebar kiri).
2. Klik menu **Extensions**.
3. Cari ekstensi berikut dan aktifkan sakelarnya (klik enable):
   * **`pg_cron`**: Ekstensi untuk penjadwalan tugas berbasis ekspresi cron.
   * **`pg_net`**: Ekstensi untuk mengirimkan request HTTP POST/GET secara asynchronous dari database.

### Langkah B: Membuat Jadwal Tugas Otomatis (Cron Job) via SQL Editor
Setelah ekstensi aktif, kita jadwalkan pemanggilan otomatis Edge Function pengirim pengingat email.

1. Buka menu **SQL Editor** di sidebar kiri Supabase.
2. Klik **New Query** (Buat Query Baru).
3. Salin dan tempel perintah SQL berikut ke dalam editor:

```sql
-- 1. Bersihkan job lama jika sudah ada agar tidak terjadi duplikasi job
SELECT cron.unschedule('kirim-pengingat-peminjaman-harian');

-- 2. Jadwalkan cron job baru
SELECT cron.schedule(
  'kirim-pengingat-peminjaman-harian',
  '0 8 * * *', -- Ekspresi Cron: Berjalan setiap hari pada jam 08:00 pagi UTC (sekitar jam 15:00 WIB)
  $$
  SELECT net.http_post(
    url := 'https://<ref-project-supabase-anda>.supabase.co/functions/v1/send-borrow-reminders',
    headers := '{"Content-Type": "application/json", "x-cron-secret": "MASUKKAN_CRON_SECRET_SAMA_DENGAN_GITHUB_SECRETS"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

### Langkah C: Penjelasan Parameter SQL di Atas
* **Ekspresi Cron `'0 8 * * *'`**: Mengikuti format standar 5 kolom (menit, jam, hari, bulan, hari dalam seminggu). Jika ingin mengetes setiap 5 menit untuk pengujian, Anda bisa mengubahnya sementara menjadi `'*/5 * * * *'`.
* **URL target Edge Function**: Pastikan Anda mengganti `<ref-project-supabase-anda>` dengan ID referensi project Supabase asli Anda.
* **Header `x-cron-secret`**: Ini adalah token keamanan kustom untuk mencegah orang lain menembak Edge Function Anda secara sembarangan. Masukkan string acak panjang dan simpan kunci rahasia ini sebagai rahasia env/GitHub Secrets Anda.

---

Dengan mengikuti panduan di atas, seluruh integrasi eksternal website Anda (autentikasi Google, email sistem via Resend, dan pembersihan terjadwal database) akan berjalan secara harmonis dan otomatis 100%.
