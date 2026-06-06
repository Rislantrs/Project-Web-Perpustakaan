# 📦 Dokumentasi: Modul "Cari Arsip" — Arsitektur & Cara Kerja

> **Lokasi Modul:** `src/modules/arsip/`  
> **Akses Publik:** `https://[domain]/cari-arsip`  
> **Versi:** 1.0.0

---

## 🎯 Latar Belakang & Tujuan

Klien meminta integrasi pencarian data arsip Purwakarta. Setelah evaluasi, ditemukan bahwa:

- **JIKN (Jaringan Informasi Kearsipan Nasional)** milik ANRI **tidak menyediakan API publik** yang bisa diakses bebas
- Membuat database arsip sendiri membutuhkan input manual ribuan dokumen oleh admin
- Scraping / crawling data JIKN terhambat oleh sistem login

**Solusi yang dipilih: Smart Search Redirect / Deep Linking ⭐**

Alih-alih mengambil data arsip ke database kita sendiri, kita cukup **merangkai URL pencarian** yang langsung mengarahkan pengguna ke halaman hasil pencarian JIKN dengan filter instansi Purwakarta yang sudah terpasang otomatis.

---

## 🏗️ Arsitektur

```
Pengguna ketik keyword
        │
        ▼
[CariArsip.tsx] — React Component
        │
        ▼
[arsipConfig.ts] — buildJiknSearchUrl(keyword, filterInstansi)
        │  Merangkai URL:
        │  https://jikn.anri.go.id/pencarian?q={keyword}&instansi=Purwakarta
        │
        ▼
window.open(url, '_blank')
        │
        ▼
[Portal JIKN ANRI] — Tab Baru Browser Pengguna
```

### Pola: Microservice-Lite / Modul Mandiri

Modul ini dirancang **terpisah sepenuhnya** dari sistem utama:

| Aspek | Nilai |
|---|---|
| **Database** | ❌ Tidak ada |
| **API Request** | ❌ Tidak ada request ke server manapun |
| **Ketergantungan ke Supabase** | ❌ Nol |
| **Ketergantungan ke backend lain** | ❌ Nol |
| **Data pengguna yang disimpan** | ❌ Tidak ada |
| **Kebutuhan server** | ✅ Static hosting (Vercel, Netlify, GitHub Pages) |
| **Biaya operasional tambahan** | ✅ Rp 0 |

---

## 📁 Struktur Folder Modul

```
src/modules/arsip/           ← Root modul (TERPISAH dari modul lain)
├── config/
│   └── arsipConfig.ts       ← Konfigurasi terpusat: URL JIKN, topik saran, statistik
└── pages/
    └── CariArsip.tsx        ← Komponen halaman React
```

> **Mengapa dipisah?** Mengikuti pola yang sama dengan modul `booking/` yang sudah ada. Setiap modul mandiri memiliki folder sendiri agar mudah dihapus, diperbarui, atau dipindahkan ke microservice nyata tanpa mengganggu kode lain.

---

## ⚙️ File Konfigurasi: `arsipConfig.ts`

File ini adalah **satu-satunya file yang perlu diubah** jika ANRI memperbarui struktur URL JIKN di masa mendatang.

```typescript
JIKN: {
  BASE_URL: 'https://jikn.anri.go.id',
  SEARCH_PATH: '/pencarian',
  QUERY_PARAM: 'q',
  INSTANSI_PARAM: 'instansi',
  INSTANSI_VALUE: 'Dinas Arsip dan Perpustakaan Kabupaten Purwakarta',
}
```

**Fungsi utama:**
```typescript
buildJiknSearchUrl('sejarah bupati', true)
// => "https://jikn.anri.go.id/pencarian?q=sejarah+bupati&instansi=Dinas+Arsip..."
```

---

## 🔌 Integrasi ke Sistem Utama

Hanya **2 file utama** yang dimodifikasi untuk mengintegrasikan modul ini:

### 1. `src/App.tsx` — Routing
```tsx
// Import lazy
const CariArsip = lazy(() => import('./modules/arsip/pages/CariArsip'));

// Route
<Route path="cari-arsip" element={
  <Suspense fallback={<LoadingSpinner />}>
    <CariArsip />
  </Suspense>
} />
```

### 2. `src/config/siteConfig.ts` — Menu Navbar
```typescript
NAV_LINKS: [
  // ... menu lainnya ...
  { name: 'Cari Arsip', path: '/cari-arsip' }, // ← Ditambahkan
],
```

---

## 🔄 Skenario Upgrade ke Microservice Sesungguhnya

Jika di masa mendatang ANRI membuka API resmi JIKN, atau Anda ingin membangun layer middleware sendiri, migrasi bisa dilakukan tanpa merombak UI:

```
Saat ini (Deep Link):
  Frontend → window.open(jiknUrl)

Upgrade ke API Proxy:
  Frontend → fetch('/api/arsip/search?q=keyword')
           → Node.js Proxy Server
           → JIKN API / Scraper
           → Return JSON hasil pencarian
           → Ditampilkan langsung di halaman (tanpa redirect)
```

Cukup ubah fungsi `buildJiknSearchUrl` di `arsipConfig.ts` menjadi fungsi `fetch()` ke endpoint API baru. Tidak ada perubahan di `CariArsip.tsx`.

---

## ✅ Kelebihan Solusi Ini

| Keunggulan | Penjelasan |
|---|---|
| **Zero cost** | Tidak ada biaya database atau server tambahan |
| **Zero maintenance** | Tidak ada data yang perlu diupdate admin |
| **Selalu up-to-date** | Data arsip selalu terbaru karena langsung dari JIKN |
| **Aman** | Tidak ada data pengguna yang dikumpulkan/disimpan |
| **Ringan** | Tidak menambah beban performa website |
| **Dapat dikembangkan** | Mudah dimigrasi ke API proxy jika dibutuhkan |

---

## ⚠️ Keterbatasan & Catatan

> [!NOTE]
> Hasil pencarian bergantung sepenuhnya pada ketersediaan data di portal JIKN ANRI. Jika instansi Purwakarta belum mengunggah arsip tertentu ke JIKN, hasil pencarian akan kosong.

> [!WARNING]  
> Nilai parameter `instansi` (`INSTANSI_VALUE` di `arsipConfig.ts`) harus sesuai persis dengan nama instansi yang terdaftar di sistem JIKN. Jika berbeda, filter tidak akan bekerja. Verifikasi secara manual di portal JIKN jika hasil filter tidak sesuai harapan.

> [!TIP]
> Untuk meningkatkan pengalaman pengguna tanpa perlu API, Anda bisa menambahkan **daftar arsip unggulan** secara manual di `arsipConfig.ts` sebagai data statis — misalnya 10 arsip terpopuler yang sudah dikurasi oleh arsiparis.

---

*Dokumen ini dibuat oleh sistem AI dan perlu ditinjau oleh tim teknis sebelum digunakan sebagai panduan resmi.*
