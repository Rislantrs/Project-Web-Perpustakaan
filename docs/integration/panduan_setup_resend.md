# 📧 PANDUAN SETUP DOMAIN DI RESEND & KONFIGURASI DNS (NAME.COM, CLOUDFLARE, HOSTINGER, DLL.)

Dokumen ini menjelaskan secara lengkap cara melakukan pendaftaran dan verifikasi domain yang Anda beli dari penyedia luar (seperti Name.com, Hostinger, Niagahoster, GoDaddy, dll.) di **Resend.com**, serta bagaimana mengonfigurasi DNS record-nya agar email notifikasi/OTP website Perpustakaan & Booking Disipusda masuk ke **Inbox (Kotak Masuk)** penerima dan tidak masuk ke folder **Spam**.

---

## 📋 DAFTAR ISI
1. [Mengapa Autentikasi Email Sangat Penting?](#1-mengapa-autentikasi-email-sangat-penting)
2. [Langkah-Langkah Menambahkan Domain di Resend](#2-langkah-langkah-menambahkan-domain-di-resend)
3. [Panduan Konfigurasi DNS di Registrar Luar & Cloudflare](#3-panduan-konfigurasi-dns-di-registrar-luar--cloudflare)
4. [Tabel DNS Records Resend yang Wajib Dimasukkan](#4-tabel-dns-records-resend-yang-wajib-dimasukkan)
5. [Mengapa Record SPF & MX Menggunakan Subdomain "send"?](#5-mengapa-record-spf--mx-menggunakan-subdomain-send)
6. [Cara Memeriksa Status Autentikasi Email di Gmail (SPF, DKIM, DMARC)](#6-cara-memeriksa-status-autentikasi-email-di-gmail-spf-dkim-dmarc)

---

## 1. Mengapa Autentikasi Email Sangat Penting?

Saat website Anda mengirimkan email (seperti kode OTP pendaftaran atau notifikasi denda buku) menggunakan domain kustom Anda (misal: `@perpustakaandaerah.com`), penyedia email seperti Gmail dan Yahoo akan mencurigai email tersebut sebagai email palsu (spoofing) jika Anda tidak membuktikan kepemilikan domain tersebut.

Untuk membuktikannya, Anda harus menambahkan DNS records khusus di tempat Anda membeli domain. Tanpa konfigurasi ini:
* Email Anda akan **100% masuk ke folder Spam** atau bahkan **ditolak (bounce/blocked)** secara permanen oleh Gmail.
* Gmail akan menampilkan peringatan keamanan merah *"Google tidak dapat memverifikasi bahwa pengirim asli..."*.

> [!NOTE]
> **Reputasi IP Bersama (Shared IP Free Tier):**
> Pada paket gratis Resend, email dikirim via IP bersama. Agar email tetap masuk Inbox, Anda wajib memverifikasi domain Anda secara sempurna melalui konfigurasi DKIM, SPF, dan DMARC.

---

## 2. Langkah-Langkah Menambahkan Domain di Resend

Jika Anda baru saja membeli domain dari luar dan ingin menghubungkannya ke Resend:

1. Masuk ke dashboard **[Resend Domains](https://resend.com/domains)**.
2. Klik tombol **Add Domain** di pojok kanan atas.
3. Masukkan nama domain utama yang Anda beli (contoh: `lann.codes` atau `perpustakaandaerah.com`, tanpa tambahan `www` atau `https://`).
4. Pilih **Region** server email terdekat (sangat direkomendasikan memilih **North Virginia (us-east-1)** untuk performa dan kestabilan terbaik).
5. Klik **Add**.
6. Halaman detail domain akan terbuka dan menampilkan status **"Pending"** dengan daftar DNS Records (DKIM, SPF, MX) yang perlu dimasukkan ke penyedia DNS domain Anda.

---

## 3. Panduan Konfigurasi DNS di Registrar Luar & Cloudflare

Setiap penyedia domain (registrar) memiliki menu manajemen DNS yang sedikit berbeda. Berikut adalah cara menemukan dan mengisi records tersebut di berbagai penyedia populer:

### A. Jika Menggunakan Name.com (Registrar Luar)
1. Login ke akun [Name.com](https://www.name.com).
2. Masuk ke halaman **My Domains** dan klik nama domain Anda.
3. Pilih menu **DNS Management** atau **Manage DNS Records**.
4. Untuk menambahkan record baru:
   * **Host/Name:** Masukkan subdomain saja (misal: isi `send` atau `resend._domainkey`). **Jangan** menuliskan nama domain lengkapnya karena sistem Name.com akan melengkapinya secara otomatis di belakang.
   * **Type:** Pilih tipe yang sesuai (`TXT` atau `MX`).
   * **Answer/Content:** Tempel (paste) nilai atau teks panjang yang diberikan oleh Resend.
   * **TTL:** Biarkan default atau setel ke `Auto`/`300`.
   * **Priority (Khusus MX):** Masukkan `10`.

### B. Jika Menggunakan Hostinger / Niagahoster (hPanel)
1. Login ke **Hostinger hPanel**.
2. Masuk ke menu **Domains** > klik domain Anda > pilih **DNS / Nameservers**.
3. Pada tab **DNS Records**, Anda akan melihat form input:
   * **Tipe:** Pilih `TXT` atau `MX`.
   * **Nama:** Masukkan `resend._domainkey` atau `send` (sama seperti Name.com, jangan tulis domain lengkap).
   * **Nilai TXT/Tujuan MX:** Paste teks dari Resend.
   * **Prioritas (Khusus MX):** Isi `10`.
   * **TTL:** Biarkan default (`14400` atau `3600`).
4. Klik **Tambah Record**.

### C. Jika Menggunakan Cloudflare
Jika nameserver domain Anda telah diarahkan ke Cloudflare:
1. Masuk ke dashboard Cloudflare > buka menu **DNS** > **Records**.
2. Klik **Add Record**.
3. Masukkan datanya seperti biasa.
4. ⚠️ **PENTING:** Untuk semua record Resend (DKIM, SPF, MX), pastikan **Proxy Status** dimatikan menjadi **DNS Only (Awan Abu-abu / Grey Cloud)**. Jika statusnya *Proxied (Awan Oranye)*, proses verifikasi Resend akan gagal dan email tidak akan terkirim.

---

## 4. Tabel DNS Records Resend yang Wajib Dimasukkan

Berdasarkan pengaturan standar Resend, berikut adalah 4 baris records yang harus Anda tambahkan di DNS Manager domain Anda:

| Tipe | Nama/Host | Isi / Nilai (Value / Content) | Prioritas | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **TXT** | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBg...` *(Kunci unik dari Resend)* | - | **DKIM**: Tanda tangan digital pengirim email. |
| **TXT** | `send` | `v=spf1 include:amazonses.com ~all` | - | **SPF**: Daftar server resmi yang boleh mengirim email. |
| **MX** | `send` | `feedback-smtp.us-east-1.amazonses.com` *(Sesuaikan dengan region Anda)* | **10** | **MX**: Penanganan email memantul (bounce email). |
| **TXT** | `_dmarc` | `v=DMARC1; p=none;` | - | **DMARC**: Kebijakan keamanan email (Rekomendasi Utama). |

> [!WARNING]
> Perhatikan penulisan nama record! Di beberapa panel registrar, menuliskan `send` di kolom Host otomatis akan menjadi `send.domainanda.com`. Pastikan Anda tidak menulis `send.domainanda.com` di kolom Host secara manual karena akan menghasilkan record ganda (`send.domainanda.com.domainanda.com`).

---

## 5. Mengapa Record SPF & MX Menggunakan Subdomain "send"?

Jika Anda perhatikan, Resend mewajibkan pembuatan record SPF dan MX pada subdomain `send` (misal: `send.lann.codes`), bukan di domain utama (`@` / `lann.codes`). Mengapa demikian?

1. **Menghindari Bentrokan dengan Layanan Email Utama (Kantor)**
   Domain utama Anda biasanya digunakan untuk email masuk/keluar kantor sehari-hari (misal menggunakan Google Workspace atau Microsoft 365). Jika Anda menaruh MX record Resend di domain utama `@`, seluruh email masuk kantor Anda akan tersasar ke server Resend dan tidak akan bisa dibuka.
2. **Isolasi Reputasi Email**
   Dengan memisahkan email transaksional otomatis ke subdomain `send.domainanda.com`, reputasi domain utama Anda tetap aman. Apabila ada pengguna website yang mendaftar dengan email palsu sehingga email dari web memantul (bounce), Google hanya akan menurunkan skor reputasi subdomain `send`, bukan email utama kantor Anda.

---

## 6. Cara Memeriksa Status Autentikasi Email di Gmail (SPF, DKIM, DMARC)

Setelah status domain di Resend berubah menjadi hijau (**Verified**), lakukan uji coba pengiriman email (misal mendaftarkan akun baru di website Anda) ke alamat Gmail pribadi Anda, lalu periksa validitasnya:

1. Buka email masuk tersebut di Gmail browser laptop/komputer.
2. Klik ikon **Titik Tiga** di sebelah tombol balas, lalu pilih **Tampilkan Asli (Show Original)**.
3. Anda akan melihat halaman baru dengan tabel ringkasan verifikasi DNS:
   * **SPF:** Harus menunjukkan status **`PASS`** dengan domain `send.domainanda.com`.
   * **DKIM:** Harus menunjukkan status **`PASS`** dengan domain `domainanda.com`.
   * **DMARC:** Harus menunjukkan status **`PASS`**.
4. Jika salah satu berstatus **FAIL**, periksa kembali penulisan record Anda di DNS Management. Mungkin ada kesalahan salin nilai atau record masih dalam masa propagasi DNS (butuh waktu 10 menit - 24 jam untuk menyebar).
