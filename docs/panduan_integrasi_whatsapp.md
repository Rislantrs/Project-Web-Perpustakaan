# 📱 PANDUAN INTEGRASI WHATSAPP GATEWAY (NOTIFIKASI WA)

Dokumen ini berisi panduan perencanaan dan langkah-langkah implementasi untuk mengintegrasikan notifikasi WhatsApp otomatis ke dalam sistem booking enkapsulasi.

---

## 📋 DAFTAR ISI
1. [Analisis Dampak Perubahan Kode (Supabase vs Lokal)](#1-analisis-dampak-perubahan-kode-supabase-vs-lokal)
2. [Lokasi Placeholder / Komentar di Berkas Kode](#2-lokasi-placeholder--komentar-di-berkas-kode)
3. [Langkah Konfigurasi API Gateway (Menggunakan Fonnte)](#3-langkah-konfigurasi-api-gateway-menggunakan-fonnte)
4. [Contoh Implementasi Kode Deno (Supabase Edge Function)](#4-contoh-implementasi-kode-deno-supabase-edge-function)

---

## 1. Analisis Dampak Perubahan Kode (Supabase vs Lokal)

Sebelum memulai, Anda perlu memahami bagaimana fitur ini memengaruhi file kode Anda:

* **Di File Kode Lokal (Frontend React / Web):**
  > [!NOTE]
  > **TIDAK ADA perubahan sama sekali di frontend.**
  > 
  > Ini karena arsitektur sistem dirancang agar frontend hanya memicu satu titik fungsi saja (yaitu memanggil Supabase Edge Functions). Semua tugas pengiriman notifikasi (Email via Resend, Telegram ke Admin, dan kelak WhatsApp ke Pemohon) dilakukan secara terpusat di server belakang (*server-side*).

* **Di Supabase Cloud (Secrets):**
  Anda perlu menambahkan variabel rahasia baru untuk menyimpan API Key/Token dari penyedia WhatsApp Gateway Anda:
  ```bash
  # Contoh mendaftarkan secret baru lewat Supabase CLI
  supabase secrets set WA_GATEWAY_TOKEN="token_dari_gateway_anda"
  ```
  *(Atau dapat diinput langsung melalui Supabase Dashboard -> Settings -> Secrets).*

* **Di File Supabase Edge Functions (Deno):**
  Perubahan hanya terjadi pada 2 file Deno Edge Functions di server Supabase Anda:
  1. `supabase/functions/booking-notification/index.ts` (Kirim WA saat pendaftaran masuk).
  2. `supabase/functions/booking-status-change/index.ts` (Kirim WA saat disetujui/ditolak/dijadwal ulang).

---

## 2. Lokasi Placeholder / Komentar di Berkas Kode

Untuk mempermudah tim pengembang Anda di masa mendatang, saya sudah meninggalkan tanda komentar (*comment placeholder*) di lokasi-lokasi yang tepat pada berkas berikut:

1. **[booking-notification/index.ts](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/supabase/functions/booking-notification/index.ts#L274-L287)**
   Terletak di dalam blok paralel `Promise.allSettled`, tepat di bawah blok kirim email konfirmasi.
2. **[booking-status-change/index.ts](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/supabase/functions/booking-status-change/index.ts#L528-L541)**
   Terletak tepat di bawah blok penyelesaian pengiriman email status perubahan.

---

## 3. Langkah Konfigurasi API Gateway (Menggunakan Fonnte)

Sebagai contoh penyedia yang sangat populer di Indonesia (Fonnte):

1. Daftar dan buat akun di **[Fonnte.com](https://fonnte.com)**.
2. Hubungkan nomor WhatsApp Anda (sebagai pengirim) dengan melakukan scan QR Code di menu Device dashboard Fonnte.
3. Masuk ke menu **API Key** dan salin token yang diberikan.
4. Daftarkan token tersebut di dashboard Supabase Secrets dengan nama variabel **`WA_GATEWAY_TOKEN`**.

---

## 4. Contoh Implementasi Kode Deno (Supabase Edge Function)

Ketika Anda siap mengaktifkannya di masa depan, berikut adalah cuplikan kode fungsi pembantu (*helper*) yang bisa dimasukkan ke dalam berkas Edge Function untuk mengirim pesan WhatsApp menggunakan Deno:

```typescript
/**
 * Mengirim pesan WhatsApp menggunakan API Fonnte.com
 * @param target Nomor WhatsApp tujuan (format bebas: 08xx atau +62xx)
 * @param message Isi pesan teks WhatsApp
 * @param token API Token Fonnte (diambil dari Deno.env.get('WA_GATEWAY_TOKEN'))
 */
async function sendWhatsApp(target: string, message: string, token: string): Promise<void> {
  // Bersihkan format nomor agar diawali kode negara (misal 62)
  let cleanNumber = target.replace(/[^0-9]/g, '');
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '62' + cleanNumber.slice(1);
  }

  const response = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: {
      'Authorization': token, // API Key Fonnte
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target: cleanNumber,
      message: message,
      countryCode: '62', // Default Indonesia
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Fonnte API Error: ${response.status} - ${errorBody}`);
  }
}
```

### Contoh Penggunaan untuk Status 'Approved' di `booking-status-change`:
```typescript
const waToken = Deno.env.get('WA_GATEWAY_TOKEN');
if (waToken) {
  const message = `Halo ${booking.nama_lengkap},\n\nBooking layanan Enkapsulasi Anda dengan referensi #${booking.id.slice(0, 8)} telah DISETUJUI. Silakan datang pada tanggal ${booking.tanggal_booking}. Terima kasih!`;
  await sendWhatsApp(booking.whatsapp, message, waToken).catch(err => {
    console.error('Gagal mengirim notifikasi WhatsApp:', err);
  });
}
```
*Dengan metode di atas, email tetap akan terkirim secara paralel dan notifikasi WhatsApp juga akan terkirim sebagai jalur notifikasi alternatif.*
