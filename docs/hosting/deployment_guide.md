# 📖 Panduan Lengkap: Hosting Cloudflare Pages, Domain Custom, dan Integrasi Supabase / Resend

Panduan ini menjelaskan langkah demi langkah untuk melakukan *deployment* (hosting) website perpustakaan ke **Cloudflare Pages**, memindahkan domain kustom dari luar (seperti Name.com) ke Cloudflare DNS, mengonfigurasi email transaksional Resend, dan mengatur variabel lingkungan (Environment Variables & Secrets).

---

## 🗺️ DAFTAR ISI
1. [Bagian 1: Hosting di Cloudflare Pages (via GitHub)](#-bagian-1-hosting-di-cloudflare-pages-via-github)
2. [Bagian 2: Memindahkan DNS Name.com ke Cloudflare](#-bagian-2-memindahkan-dns-namecom-ke-cloudflare)
3. [Bagian 3: Menghubungkan Custom Domain & Mengatasi www](#-bagian-3-menghubungkan-custom-domain--mengatasi-www)
4. [Bagian 4: Pengaturan DNS Resend.com di Cloudflare](#-bagian-4-pengaturan-dns-resendcom-di-cloudflare)
5. [Bagian 5: Mengatur Variables and Secrets di Cloudflare Pages](#-bagian-5-mengatur-variables-and-secrets-di-cloudflare-pages)
6. [FAQ (Pertanyaan Umum)](#-faq-pertanyaan-umum)

---

## 🚀 BAGIAN 1: HOSTING DI CLOUDFLARE PAGES (VIA GITHUB)

Untuk aplikasi berbasis React + Vite (SPA/Single Page Application), **Cloudflare Pages** adalah platform hosting terbaik karena menyediakan CDN global tercepat secara gratis, SSL otomatis, dan integrasi repositori git langsung.

1. Unggah (*push*) proyek Anda ke repositori **GitHub** (publik atau privat).
2. Masuk ke [Cloudflare Dashboard](https://dash.cloudflare.com) > buka menu **Workers & Pages** > pilih tab **Pages**.
3. Klik **Connect to Git** > hubungkan akun GitHub Anda dan pilih repositori website perpustakaan Anda.
4. Pada halaman **Build settings**:
   * **Framework preset:** Pilih **Vite** atau **React**.
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
5. Klik **Save and Deploy**. Cloudflare akan mem-build proyek Anda dan memberikan subdomain bawaan gratis (contoh: `project-web-perpustakaan.pages.dev`).

---

## 🌐 BAGIAN 2: MEMINDAHKAN DNS NAME.COM KE CLOUDFLARE

Agar domain dari Name.com (atau registrar luar lainnya) dapat diatur dengan mudah untuk website Pages dan verifikasi email Resend, pindahkan pengelolaan DNS ke Cloudflare:

1. Pada dashboard Cloudflare, klik **Add a Site** > masukkan domain Anda (contoh: `lann.codes`).
2. Pilih paket **Free** (Gratis) > klik Continue.
3. Cloudflare akan menampilkan **Nameservers** yang ditunjuk untuk Anda, contoh:
   * `daniella.ns.cloudflare.com`
   * `dimitris.ns.cloudflare.com`
4. Login ke [Name.com](https://www.name.com) > masuk ke **My Domains** > klik domain Anda.
5. Cari menu **Nameservers** > klik **Edit Nameservers**.
6. Hapus nameserver lama milik Name.com, lalu masukkan kedua **Cloudflare Nameservers** di atas. Klik **Save**.
7. Tunggu propagasi DNS (biasanya 10 menit hingga beberapa jam) sampai status domain Anda di Cloudflare menjadi hijau (**Active**).

---

## 🔗 BAGIAN 3: MENGHUBUNGKAN CUSTOM DOMAIN & MENGATASI www

Setelah status domain di Cloudflare aktif:
1. Buka dashboard Cloudflare > **Workers & Pages** > klik nama proyek Anda > pilih tab **Custom Domains**.
2. Klik **Set up a custom domain** > masukkan domain utama Anda (misal: `lann.codes`) > ikuti instruksinya hingga selesai. Cloudflare akan otomatis membuat CNAME record dan menerbitkan sertifikat SSL (HTTPS).
3. ⚠️ **Mengatasi Peringatan www:**
   Jika muncul peringatan *“Visitors cannot reach www.lann.codes”* di tab DNS, Anda wajib menambahkan record baru di menu **DNS > Records**:
   * **Type:** `CNAME`
   * **Name:** `www`
   * **Target:** `lann.codes` (atau `project-web-perpustakaan.pages.dev`)
   * **Proxy status:** **Proxied (Awan Oranye)**
   * **TTL:** `Auto`

---

## 📧 BAGIAN 4: PENGATURAN DNS RESEND.COM DI CLOUDFLARE

Buka dashboard **Resend.com > Domains** dan pastikan Anda memasukkan records berikut pada dashboard **Cloudflare > DNS > Records**:

> [!WARNING]
> **PENTING: MATIKAN PROXY (GUNAKAN DNS ONLY / AWAN ABU-ABU)**
> Untuk seluruh record verifikasi Resend (DKIM, SPF, MX), pastikan status Proxy-nya dinonaktifkan (**DNS Only / Grey Cloud**). Jika di-proxy, verifikasi Resend tidak akan pernah berhasil!

### Records yang Wajib Dimasukkan:

1. **DKIM Record (TXT)**
   * **Type:** `TXT`
   * **Name:** `resend._domainkey`
   * **Content/Value:** Tempel kode kunci `p=MIGf...` yang didapatkan dari Resend.
   * **Proxy status:** **DNS Only**

2. **SPF Record (TXT)**
   * **Type:** `TXT`
   * **Name:** `send`
   * **Content/Value:** `v=spf1 include:amazonses.com ~all`
   * **Proxy status:** **DNS Only**

3. **MX Record (MX)**
   * **Type:** `MX`
   * **Name:** `send`
   * **Mail Server:** `feedback-smtp.us-east-1.amazonses.com` (sesuai region Anda di Resend)
   * **Priority:** `10`
   * **Proxy status:** **DNS Only**

4. **DMARC Record (TXT - Sangat Direkomendasikan)**
   * **Type:** `TXT`
   * **Name:** `_dmarc`
   * **Content/Value:** `v=DMARC1; p=none;`
   * **Proxy status:** **DNS Only**

---

## 🔑 BAGIAN 5: MENGATUR VARIABLES AND SECRETS DI CLOUDFLARE PAGES

Website React Anda membutuhkan API key agar dapat berkomunikasi dengan database Supabase dan Cloudflare Turnstile Captcha secara aman. Daftarkan variabel ini di dashboard Cloudflare Pages:

1. Di dashboard Cloudflare, buka **Workers & Pages** > klik proyek website Anda (contoh: `project-web-perpustakaan`).
2. Masuk ke tab **Settings** (di menu atas) > pilih menu **Configuration** (atau **Variables and Secrets**).
3. Pada bagian **Environment variables**, klik **Add** atau **Edit**.
4. Tambahkan variabel-variabel berikut:
   * **Name:** `VITE_SUPABASE_URL` | **Value:** `https://anqopdxzdkpsmtxuultp.supabase.co` (URL Supabase Anda)
   * **Name:** `VITE_SUPABASE_ANON_KEY` | **Value:** *[Anon Key Supabase Anda]*
   * **Name:** `VITE_TURNSTILE_SITE_KEY` | **Value:** `0x4AAAAAAADDtG5PHsGg6YoP2` (Site Key Turnstile Anda)
5. Klik **Save**.
6. > [!IMPORTANT]
   > **DEPLOY ULANG:** Setelah mengubah/menambahkan variabel lingkungan, lakukan redeploy (misalnya memicu push commit baru di GitHub) agar Cloudflare Pages mengompilasi ulang website dengan nilai variabel yang baru disuntikkan.

---

## ❓ FAQ (PERTANYAAN UMUM)

### T: Mengapa domain saya berstatus "Invalid Configuration" saat pertama kali ditambahkan?
**J:** Hal ini disebabkan karena pembaruan DNS (propagasi) memerlukan waktu untuk menyebar ke seluruh server global. Biasanya memakan waktu 10 hingga 30 menit. Silakan tunggu beberapa saat, lalu klik tombol Refresh/Verify pada dashboard Cloudflare atau Vercel.

### T: Apa gunanya `VITE_TURNSTILE_SITE_KEY`?
**J:** Ini adalah kunci situs publik untuk Cloudflare Turnstile, sistem perlindungan Captcha modern yang gratis dan tidak mengganggu kenyamanan pengguna (tidak perlu mengklik gambar lampu lalu lintas/zebra cross) untuk mencegah bot melakukan brute force di halaman login admin.

### T: Apakah berkas `.env` lokal perlu diunggah ke GitHub?
**J:** **Sama sekali TIDAK.** File `.env` berisi kunci rahasia yang bersifat sensitif. Mengunggahnya ke GitHub memicu risiko kebocoran data. Cloudflare Pages telah menyediakan menu *Variables and Secrets* di dashboard untuk menyimpannya secara aman pada versi produksi.
