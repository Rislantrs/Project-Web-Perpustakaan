# Technical Debt Audit - 30 May 2026

## Scope
Audit ini fokus pada hutang teknis yang bisa mengganggu maintainability, keamanan operasional, dan performa, tanpa mengubah flow publik website.

## Non-Disruption Guardrail
Perubahan yang direkomendasikan pada fase cepat harus menjaga hal berikut tetap aman:
- Google Analytics tetap berjalan (jangan putus script GA).
- SEO tidak turun (jangan ubah robots/indexing tanpa rencana).
- Gambar eksternal/internal tetap tampil.
- Rute publik dan konten publik tidak berubah.

## Findings (Prioritized)

### High
1. Browser storage dipakai sebagai sumber data utama untuk domain penting.
- Evidence: src/services/db.ts, src/services/bookService.ts, src/services/dataService.ts, src/services/authService.ts, src/pages/LaporWarga.tsx, src/pages/admin/ManageReports.tsx.
- Risk: data drift antara cache lokal vs cloud, sulit audit, perilaku berbeda antar browser/device.
- Safe action: migrasi bertahap per domain (reports -> table cloud dulu), tetap pertahankan fallback read-only sementara.

2. Test coverage sangat minim untuk skala fitur saat ini.
- Evidence: hanya ada src/services/bookService.test.ts; e2e hanya e2e/katalog.spec.ts.
- Risk: regresi tinggi saat refactor auth, katalog, admin, dan settings.
- Safe action: tambah test untuk alur kritikal tanpa ubah UI publik: login member/admin, register+verify, create/update buku, queue/borrow transitions.

3. Bundle utama besar.
- Evidence: hasil build menunjukkan dist/assets/index-*.js sekitar 1197 kB (gzip 351 kB) dan warning chunk > 500 kB.
- Risk: TTI/LCP menurun terutama mobile.
- Safe action: lazy-load halaman publik berat (sama seperti pola admin di App.tsx), tanpa ubah URL/rute.

### Medium
4. Belum ada lint/format baseline.
- Evidence: tidak ditemukan konfigurasi ESLint/Prettier/editorconfig di root.
- Risk: kualitas kode tidak konsisten, review lambat, debt style meningkat.
- Safe action: tambahkan ESLint + Prettier non-blocking dulu (warn), baru naikkan strict bertahap.

5. Hardcoded link/config masih tersebar lintas page.
- Evidence: src/pages/Home.tsx, src/pages/Diorama.tsx, src/pages/Galendo.tsx, src/components/Footer.tsx, src/pages/JadwalLayanan.tsx.
- Risk: maintenance sulit, perubahan link butuh edit banyak file.
- Safe action: central map di src/config/externalLinks.ts, lalu refactor bertahap tanpa mengubah konten/tujuan URL.

6. Dependency footprint besar dibanding pemakaian aktual yang terdeteksi.
- Evidence: package.json memuat banyak paket UI, sementara pencarian import menunjukkan subset kecil yang dipakai aktif (misalnya Tiptap pada editor).
- Risk: update security patch lebih berat, build/install lebih lambat.
- Safe action: audit dependency terpakai vs tidak terpakai, hapus bertahap setelah verifikasi build+test.

7. Dokumentasi tersebar, belum ada satu sumber operasional utama.
- Evidence: README.md, MONITORING_GUIDE.md, SEO_GUIDE.md, SETUP_EMAIL_NOTIFICATIONS.md, TUTORIAL_SETUP_NOTIFIKASI.md, banyak dokumen guideline.
- Risk: onboarding lambat dan konfigurasi mudah meleset.
- Safe action: buat README operasional ringkas yang mengarah ke dokumen detail.

### Low
8. Konvensi arsitektur belum seragam penuh.
- Evidence: domain masih campuran page-driven + service-driven; banyak fallback lokal untuk mode lama.
- Risk: debt bertambah saat tim bertambah.
- Safe action: tetapkan target struktur domain per fitur (auth, catalog, admin, reporting) tanpa rename besar-besaran sekaligus.

## Mapping to 15 Principles
- Struktur awal: partial, perlu standardisasi domain.
- Quick fix tracking: sudah ada beberapa catatan, belum terpusat.
- Coding standard: belum ada lint/formatter config.
- Readability: campuran; beberapa service sudah diberi komentar, sebagian fungsi masih panjang.
- Documentation: banyak, tapi tersebar.
- Config separation: cukup baik untuk env cloud, masih ada hardcoded URL konten.
- Database design: sudah membaik (split schema/security), perlu konsolidasi migrasi legacy.
- Testing: perlu peningkatan signifikan.
- Dependency control: perlu audit berkala.
- Performance: warning build sudah muncul.
- Deployment: CI sudah ada (test + build), belum ada quality gate lint/coverage.
- Refactoring routine: belum terlihat ritme terjadwal.
- Debt register: perlu satu backlog tunggal.
- Security: hardening berjalan, namun debt operasional masih ada di storage/browser coupling.
- Tech choice fit: stack sesuai kebutuhan, tinggal dirapikan governance-nya.

## 14-Day Safe Plan (No Public Flow Break)
### Phase 1 (Hari 1-3)
- Tambah ESLint + Prettier mode warning.
- Tambah dashboard debt register di guidelines/Hardcode-Audit-Action-Plan.md.
- Tambah 3 unit test kritikal auth + 1 e2e login.

### Phase 2 (Hari 4-7)
- Extract external links ke config tunggal.
- Lazy-load halaman publik berat di App.tsx.
- Tambah monitoring metrik web-vitals (read-only).

### Phase 3 (Hari 8-14)
- Migrasi domain laporan warga dari localStorage ke Supabase table.
- Kurangi fallback write ke localStorage pada domain non-kritis.
- Audit dependency terpakai dan bersihkan paket tidak dipakai.

## Definition of Done (Debt Audit Track)
- Ada backlog prioritas dengan owner per item di `guidelines/Hardcode-Audit-Action-Plan.md`.
- Ada baseline lint/format aktif di CI (minimal warning).
- Ada peningkatan jumlah test untuk alur kritikal.
- Bundle warning menurun atau ada strategi chunking yang tervalidasi.
- Tidak ada gangguan pada SEO indexing, GA tracking, dan rendering gambar.
