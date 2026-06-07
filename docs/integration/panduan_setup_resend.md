# 📧 PANDUAN SETUP DOMAIN DI RESEND & DNS CLOUDFLARE

Dokumen ini menjelaskan cara melakukan verifikasi domain di **Resend.com** dan melakukan konfigurasi **DNS** (Cloudflare) untuk memastikan email transaksi dari website Perpustakaan/Booking Enkapsulasi Disipusda masuk langsung ke **Inbox (Kotak Masuk)**, bukan ke folder **Spam**.

---

## 📋 DAFTAR ISI
1. [Mengapa Email Masih Masuk Spam?](#1-mengapa-email-masih-masuk-spam)
2. [Langkah-Langkah Menambahkan Domain di Resend](#2-langkah-langkah-menambahkan-domain-di-resend)
3. [Panduan Konfigurasi DNS di Cloudflare](#3-panduan-konfigurasi-dns-di-cloudflare)
4. [Mengapa Record SPF Menggunakan Subdomain "send"?](#4-mengapa-record-spf-menggunakan-subdomain-send)
5. [Cara Memeriksa Hasil Autentikasi Email di Gmail](#5-cara-memeriksa-hasil-autentikasi-email-di-gmail)

---

## 1. Mengapa Email Masih Masuk Spam?

Meskipun status domain Anda di Resend sudah menunjukkan **"Verified"** (seperti gambar yang Anda kirimkan), email tetap bisa masuk ke spam karena beberapa faktor berikut:

1. **Reputasi IP Bersama (Shared IP)**
   Resend pada paket gratis (free tier) menggunakan alamat IP bersama untuk mengirimkan email. Jika ada pengguna Resend lain di IP yang sama mengirimkan spam, reputasi IP tersebut di mata Google/Gmail akan menurun, menyebabkan email Anda ikut dicurigai.
2. **Tidak Ada Riwayat Pengiriman (Warm-up Period)**
   Domain baru (`lann.codes`) yang belum memiliki volume pengiriman email yang stabil dan interaksi positif dari penerima (dibuka, dibalas) akan diawasi secara ketat oleh algoritma filter spam Gmail.
3. **Kurangnya Interaksi Pengguna**
   Saat pertama kali menerima email dari domain baru, filter Gmail akan menaruhnya di spam sebagai tindakan pencegahan. 
   * **Solusinya:** Anda wajib membuka folder spam, lalu klik tombol **"Laporkan bukan spam" (Report as not spam)** atau memindahkannya ke Inbox. Tindakan ini memberi tahu Google bahwa pengirim dari `@lann.codes` aman.

---

## 2. Langkah-Langkah Menambahkan Domain di Resend

Jika Anda ingin mendaftarkan ulang atau memastikan domain Anda terhubung dengan benar:

1. Masuk ke **[Dashboard Resend](https://resend.com/domains)**.
2. Klik tombol **Add Domain**.
3. Masukkan nama domain Anda (misal: `lann.codes`).
4. Pilih **Region** terdekat (misal: `North Virginia (us-east-1)`).
5. Klik **Add**. Resend akan menghasilkan beberapa baris DNS Records yang harus dimasukkan ke DNS Manager (Cloudflare).

---

## 3. Panduan Konfigurasi DNS di Cloudflare

Berdasarkan tangkapan layar Resend Anda, berikut adalah DNS Record yang **wajib dimasukkan secara tepat** di Cloudflare DNS Settings:

### A. Record DKIM (DomainKeys Identified Mail)
DKIM berfungsi untuk membubuhkan tanda tangan digital pada email untuk memastikan isi email tidak diubah selama transmisi.
* **Type:** `TXT`
* **Name:** `resend._domainkey` (Cloudflare akan otomatis melengkapinya menjadi `resend._domainkey.lann.codes`)
* **Content:** Salin nilai `p=MIGfMA0GCSqGSIb3...` dari dashboard Resend.
* **TTL:** `Auto` (atau `2 min`/`3600`)
* **Proxy Status:** **DNS Only (Grey Cloud)** ⚠️ *Jangan gunakan Orange Cloud.*

### B. Record SPF (Sender Policy Framework)
SPF digunakan untuk mencantumkan server mana saja yang diizinkan mengirim email atas nama domain Anda.
* **Type:** `TXT`
* **Name:** `send` (Cloudflare akan menjadikannya `send.lann.codes`)
* **Content:** `v=spf1 include:amazonses.com ~all`
* **Proxy Status:** **DNS Only (Grey Cloud)**

### C. Record MX (Mail Exchanger untuk Bounce)
Digunakan oleh Resend untuk mengelola email memantul (bounce email/gagal kirim).
* **Type:** `MX`
* **Name:** `send` (Cloudflare akan menjadikannya `send.lann.codes`)
* **Mail Server:** `feedback-smtp.us-east-1.amazonses.com` (sesuai region Anda)
* **Priority:** `10`
* **Proxy Status:** **DNS Only (Grey Cloud)**

### D. Tambahkan Record DMARC (Sangat Direkomendasikan)
DMARC adalah kebijakan keamanan yang memberitahu penerima (seperti Gmail) apa yang harus dilakukan jika email gagal melewati pemeriksaan SPF/DKIM. Tambahkan TXT record baru berikut pada DNS Anda:
* **Type:** `TXT`
* **Name:** `_dmarc` (Cloudflare akan menjadikannya `_dmarc.lann.codes`)
* **Content:** `v=DMARC1; p=none;`
* *Fungsi:* Nilai `p=none` adalah tingkat awal yang aman, artinya filter email hanya akan memantau reputasi tanpa memblokir email jika terjadi kesalahan minor.

---

## 4. Mengapa Record SPF Menggunakan Subdomain "send"?

Di Resend, record SPF dan MX dikonfigurasi menggunakan subdomain **`send`** (menghasilkan domain `send.lann.codes`). Mengapa tidak menggunakan domain utama `@` / `lann.codes`?

* **Menghindari Konflik Email Kantor/Utama:** Jika domain utama Anda (`lann.codes`) juga digunakan untuk email kantor (seperti Google Workspace atau Microsoft 365), menimpa atau menyatukan MX record dengan milik Resend dapat merusak sistem email masuk utama Anda.
* **Pemisahan Reputasi:** Dengan mengirimkan email transaksional melalui `send.lann.codes`, jika terjadi reputasi buruk pada email sistem (misalnya ada user yang memberikan email palsu saat booking), email utama kantor Anda tidak akan ikut terblokir oleh Gmail.

---

## 5. Cara Memeriksa Hasil Autentikasi Email di Gmail

Untuk mengetahui alasan pasti mengapa email Anda masuk ke spam, Anda bisa melihat status autentikasi email asli di Gmail:

1. Buka email dari website yang masuk ke folder Spam/Inbox Anda.
2. Klik tombol titik tiga vertikal di pojok kanan atas email (sebelah tombol balas).
3. Pilih **Tampilkan Asli (Show Original)**.
4. Perhatikan tabel rangkuman di bagian atas. Pastikan statusnya menunjukkan:
   * **SPF:** `PASS` dengan domain `send.lann.codes`
   * **DKIM:** `PASS` dengan domain `lann.codes`
   * **DMARC:** `PASS`
5. **Periksa Banner Peringatan Spam:**
   Gmail akan menampilkan kotak peringatan berwarna abu-abu/merah di atas email. Baca alasan yang tertera:
   * Jika alasannya **"Google tidak dapat memverifikasi bahwa pengirim asli..."** $\rightarrow$ Autentikasi DNS Anda bermasalah (ada kesalahan input di Cloudflare).
   * Jika alasannya **"Pesan ini mirip dengan pesan lain yang terdeteksi sebagai spam"** $\rightarrow$ Ini murni karena reputasi IP gratis dari Resend atau pola konten email. Cukup klik **"Laporkan Bukan Spam"** beberapa kali, dan Gmail akan mulai membiasakan diri untuk memasukkan email ke Inbox.
