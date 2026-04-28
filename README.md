# Perpustakaan Digital - Dinas Arsip dan Perpustakaan

A modern, cozy, and professional library website designed for government archive and library services. Built with React, TypeScript, Tailwind CSS, and inspired by design systems from Elsevier and the New York Public Library.

## 🎨 Design System

### Color Palette
- **Primary**: Deep Navy (#1E3A5F) - Professional and trustworthy
- **Secondary**: Light Gray (#F5F5F5) - Clean and minimal
- **Accent**: Warm Beige (#C8A97E) - Cozy and inviting
- **Background**: Soft White (#FFFFFF)
- **Sage Green**: (#9DAD97) - Calm accent color

### Typography
- **Headings**: Playfair Display (serif, elegant)
- **Body**: Inter (clean, modern sans-serif)
- **Cultural Accents**: Noto Sans Sundanese (for cultural elements)

### Design Principles
- Minimalist and elegant
- Warm and cozy reading atmosphere
- Academic and trustworthy feel
- Lots of whitespace
- Smooth transitions and micro-interactions
- Card-based layouts with soft shadows
- Rounded corners throughout

## 🚀 Fitur Utama (Live Implementation)

### 1. Sistem Autentikasi & Anggota (Fully Integrated)
- **Real Supabase Auth**: Sistem login dan pendaftaran anggota yang terintegrasi dengan database cloud.
- **Email Verification (SMTP Resend)**: Pengiriman kode OTP dan magic link verifikasi melalui provider Resend.com.
- **Premium Verification Flow**: Halaman verifikasi khusus dengan UI Glassmorphism, cooldown resend 60 detik, dan dukungan kode 8-digit.
- **NIK Masking**: Perlindungan privasi otomatis (sensor) pada data NIK anggota di seluruh aplikasi.

### 2. Katalog & Perpustakaan Digital
- **Katalog Buku Dinamis**: Pencarian dan filter kategori yang sinkron dengan database.
- **Numbered Pagination**: Sistem navigasi halaman profesional (1, 2, 3...) menggantikan tombol "Muat Lebih Banyak".
- **Manajemen Kategori**: Dashboard admin untuk mengelola kategori buku dengan desain ramping dan efisien.

### 3. Konten & Artikel
- **Cinematic Media View**: Tampilan khusus untuk kategori "Media Mewarnai" dengan fitur download yang dioptimalkan (anti-corrupt).
- **Dashboard Admin**: CMS lengkap untuk mengelola Artikel, Buku, Kategori, dan Anggota.

## 🛠 Tech Stack (Production Ready)

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Animasi**: Motion (Framer Motion)
- **Backend**: Supabase (Real-time Database & Authentication)
- **Email Service**: Resend SMTP
- **Notifications**: Sonner (Toast)

## 📧 Notifikasi Email Otomatis (Resend API + Supabase Edge Functions)

Implementasi notifikasi email member sudah disiapkan dengan arsitektur aman:

- Frontend memanggil Edge Function via `src/services/emailService.ts`
- Edge Function memanggil Resend API (server-side)
- `RESEND_API_KEY` hanya disimpan di environment variable Supabase, tidak ada hardcode di React

### Komponen yang ditambahkan

- `src/services/emailService.ts`
- `supabase/functions/send-borrow-notification/index.ts`
- `supabase/functions/send-borrow-reminders/index.ts`
- `supabase/functions/_shared/emailTemplates.ts`
- `supabase/migrations/20260428_borrow-notification-logs.sql`

### Environment Variable (Supabase Secrets)

Set secret berikut di project Supabase:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (contoh: `Disipusda <no-reply@domain-anda.com>`)
- `CRON_SECRET` (opsional tapi direkomendasikan untuk endpoint job harian)

### Deploy Edge Function

```bash
supabase functions deploy send-borrow-notification
supabase functions deploy send-borrow-reminders
```

### Jadwalkan Cron Harian

Contoh via Supabase Dashboard Scheduler atau HTTP Cron eksternal:

- Method: `POST`
- URL: `https://<project-ref>.supabase.co/functions/v1/send-borrow-reminders`
- Header: `x-cron-secret: <CRON_SECRET>`

Job harian akan mengirim:

- Pengingat buku belum diambil (H+1 dari tanggal pinjam)
- Pengingat H-2 sebelum jatuh tempo pengembalian
- Pengingat keterlambatan pengembalian (maksimal sekali per hari per transaksi)

## 🔐 Authentication & Security

Sistem ini **TIDAK LAGI MENGGUNAKAN MOCK DATA** untuk autentikasi:
- Data user tersimpan aman di `auth.users` Supabase.
- Profil anggota tersinkronisasi ke tabel `public.members`.
- Menggunakan RLS (Row Level Security) untuk perlindungan data di level database.

## 📱 Responsive & Design

- **Professional Govt UI**: Desain minimalis yang terinspirasi dari standar perpustakaan dunia.
- **Glassmorphism**: Efek transparansi dan blur untuk elemen-elemen premium.
- **Mobile First**: Optimal di semua ukuran layar (Smartphone, Tablet, Desktop).

---

Built with ❤️ for modern library services by Disipusda Purwakarta Team
