# 🚀 Panduan Lengkap Sistem Notifikasi Email & Cron Job

Dokumen ini menjelaskan cara kerja, solusi masalah umum, dan cara migrasi sistem notifikasi otomatis untuk Perpustakaan Disipusda.

---

## 🛠️ Tech Stack
- **Supabase Edge Functions**: Menjalankan logika di serverless Deno.
- **Resend API**: Layanan pengiriman email profesional.
- **GitHub Actions**: Sebagai pemicu (trigger) jadwal otomatis (Cron).

---

## 📋 Langkah Setup (Supabase & GitHub)

### 1. Konfigurasi Secret di Supabase
Pastikan variabel berikut ada di **Settings > Edge Functions > Secrets**:
- `RESEND_API_KEY`: API Key dari resend.com.
- `RESEND_FROM_EMAIL`: Email pengirim (contoh: `onboarding@resend.dev`).
- `CRON_SECRET`: Kunci rahasia bebas (contoh: `kunci-rahasia-perpus-2026`).

### 2. Konfigurasi Secret di GitHub Actions
Buka repo GitHub, masuk ke **Settings > Secrets > Actions**:
- `SUPABASE_FUNCTIONS_URL`: `https://[ref].supabase.co/functions/v1`
- `SUPABASE_SERVICE_ROLE_KEY`: Kunci master dari Supabase (untuk bypass auth).
- `CRON_SECRET`: Harus SAMA dengan yang di Supabase.

---

## ⚠️ Troubleshooting: Masalah "401 Unauthorized"

Jika GitHub Actions gagal dengan error 401, biasanya penyebabnya adalah:

1.  **Gateway Block (Satpam Supabase)**: Supabase menolak request sebelum masuk ke kode karena tidak ada header `Authorization`.
    *   **Solusi**: Deploy dengan flag `--no-verify-jwt` dan pastikan mengirim header `Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}`.
2.  **Invisible Characters**: Ada spasi atau *newline* yang tidak sengaja terbawa saat copy-paste secret.
    *   **Solusi**: Selalu gunakan `.trim()` di sisi kode Deno saat membandingkan secret:
        ```ts
        if (headerSecret?.trim() !== cronSecret?.trim()) { ... }
        ```

---

## 🕒 Logika Hitung Sisa Waktu (H-3 Jam)
Sistem ini menggunakan fungsi `parseIndonesianDateTime` untuk mengubah teks "10 Mei 2026, 10:00" menjadi objek waktu.
- Sistem mengecek jika `(Waktu Deadline - Waktu Sekarang) <= 3.5 jam`.
- Jika cocok, email peringatan dengan nada **Danger** (Merah) akan dikirim.

---

## 🌍 Opsi Non-Supabase (Migrasi ke VPS/Node.js)
Jika suatu saat ingin pindah dari Supabase ke server biasa (VPS), kamu bisa menggunakan script Node.js sederhana:

### 1. Install Dependencies
```bash
npm install resend node-cron @supabase/supabase-js
```

### 2. Contoh Script `server.js`
```javascript
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(URL, KEY);

// Jalankan setiap jam
cron.schedule('0 * * * *', async () => {
  console.log('Menjalankan pengecekan peminjaman...');
  // Pindahkan logika dari index.ts ke sini
  // Bedanya: Gunakan library 'resend' langsung, bukan via fetch API
});
```

### 3. Kelebihan Pindah ke VPS:
- Tidak ada batasan durasi eksekusi (Edge Function biasanya dibatasi).
- Biaya tetap (fixed cost) jika volume email sangat besar.
- Kontrol penuh atas environment server.

---

## ✅ Checklist Maintenance
- [ ] Cek kuota gratis Resend (biasanya 3.000 email/bulan).
- [ ] Pastikan domain email sudah diverifikasi di Resend agar tidak masuk Spam.
- [ ] Pantau log di Supabase Dashboard secara berkala.
