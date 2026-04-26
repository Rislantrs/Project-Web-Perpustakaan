# Hardcode Audit Action Plan

Dokumen ini memisahkan audit hardcode berdasarkan domain risiko agar perbaikan bisa dieksekusi bertahap tanpa mengganggu fitur.

## 1) Domain Warna

Tujuan:
- Kurangi pemakaian hex inline di komponen/page.
- Pindahkan warna brand ke token terpusat.

Checklist:
- [ ] Inventaris semua hex literal di halaman user/admin.
- [ ] Kelompokkan ke token semantic (`brand-primary`, `brand-accent`, `text-muted`, `surface-soft`).
- [ ] Definisikan token di `src/styles/tailwind.css` (atau config tema tunggal).
- [ ] Ganti class hardcoded ke token bertahap per halaman prioritas tinggi.
- [ ] Validasi kontras teks terhadap background setelah migrasi.

Hotspot awal:
- `src/pages/**/*.tsx`
- `src/pages/admin/**/*.tsx`

## 2) Domain URL Eksternal

Tujuan:
- Mengurangi URL literal tersebar (gambar, formulir, map, drive) yang sulit dirawat.
- Menetapkan owner untuk tiap URL eksternal.

Checklist:
- [ ] Daftar semua URL eksternal yang muncul di page/service.
- [ ] Tandai jenis URL: `asset`, `layanan publik`, `dokumen`, `sosial media`.
- [ ] Buat central map `src/config/externalLinks.ts` untuk URL non-dinamis.
- [ ] Ganti URL literal di file target ke constant map.
- [ ] Tambahkan fallback jika URL kosong/tidak valid.

Hotspot awal:
- `src/pages/Home.tsx`
- `src/pages/Galendo.tsx`
- `src/pages/JadwalLayanan.tsx`
- `src/pages/Ppid.tsx`
- `src/pages/admin/ManagePpid.tsx`
- `src/pages/admin/MediaEditor.tsx`

## 3) Domain Konstanta Operasional

Tujuan:
- Menyatukan angka operasional (pagination, cooldown, TTL, limit upload) di satu sumber kebenaran.

Checklist:
- [ ] Inventaris konstanta operasional lintas auth, katalog, admin, image processing.
- [ ] Buat `src/config/appLimits.ts` untuk konstanta global.
- [ ] Migrasikan nilai literal pada page/service ke konstanta.
- [ ] Tambahkan komentar konteks bisnis pada tiap konstanta.
- [ ] Uji regresi flow utama: login, verify OTP, katalog, admin CRUD.

Hotspot awal:
- `src/pages/AuthVerifyCode.tsx`
- `src/pages/BlogList.tsx`
- `src/pages/KatalogBuku.tsx`
- `src/pages/admin/ManageBooks.tsx`
- `src/pages/admin/ManageMembers.tsx`
- `src/pages/admin/ManageStructure.tsx`
- `src/services/authService.ts`
- `src/services/imageUtils.ts`

## 4) Domain Endpoint Sensitif

Tujuan:
- Menghilangkan endpoint/token sensitif dari frontend.
- Menegakkan pola akses melalui backend proxy atau Edge Function.

Checklist:
- [ ] Audit endpoint publik yang berpotensi membocorkan kredensial.
- [ ] Pindahkan integrasi sensitif ke backend/edge function.
- [ ] Simpan secret hanya di environment server-side.
- [ ] Refactor frontend agar memanggil endpoint internal yang aman.
- [ ] Tambahkan catatan keamanan di handover + SOP deployment.

Hotspot awal:
- `src/pages/LaporWarga.tsx`
- `src/services/supabase.ts`
- `.env*` (validasi keberadaan key di runtime build/deploy)

## 5) Eksekusi Sprint

Sprint 1:
- Warna + konstanta operasional (paling minim risiko perubahan behavior).

Sprint 2:
- URL eksternal ke central map + fallback handling.

Sprint 3:
- Endpoint sensitif dan hardening deployment.

## 6) Definition Of Done

- Tidak ada hardcoded kritikal tersisa di domain prioritas.
- Seluruh konstanta operasional terpusat dan didokumentasi.
- Endpoint sensitif tidak dieksekusi langsung dari frontend.
- Dokumen handover diperbarui setelah setiap sprint selesai.
