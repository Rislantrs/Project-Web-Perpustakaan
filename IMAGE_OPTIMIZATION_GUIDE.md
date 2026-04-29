# Panduan Optimasi Gambar Disipusda Purwakarta

Dokumen ini menjelaskan strategi untuk menjaga performa website tetap kencang melalui pengelolaan aset gambar yang cerdas.

## 1. Apakah Komentar di Kode Mempengaruhi Kecepatan?
**Jawabannya: TIDAK.**
Saat Anda menjalankan perintah `npm run build`, sistem (Vite) akan melakukan proses **Minification**. Semua komentar, spasi berlebih, dan baris kosong akan dihapus secara otomatis sebelum file dikirim ke browser pengguna. Jadi, jangan ragu untuk menulis komentar dokumentasi di kode Anda!

---

## 2. Strategi Optimasi Gambar

### A. Optimasi Manual (Sudah Anda Lakukan - Sangat Bagus!)
Ini adalah cara paling hemat biaya.
*   **Format:** Gunakan `.webp` daripada `.jpg` atau `.png`. Webp rata-rata 30% lebih kecil dengan kualitas yang sama.
*   **Dimensi:** Jangan upload gambar 3000px jika hanya akan ditampilkan di kotak 300px.
*   **Tools:** Gunakan [Squoosh.app](https://squoosh.app/) atau TinyPNG sebelum upload.

### B. Menggunakan Supabase Storage Transformation
Jika gambar disimpan di Supabase Storage, Anda bisa mengubah ukurannya lewat URL tanpa perlu mengubah file aslinya.

**Contoh Kode (Typescript):**
```typescript
// Fungsi helper untuk mendapatkan URL gambar yang sudah di-resize
const getOptimizedUrl = (path: string, width: number = 300) => {
  const baseUrl = 'https://[PROJECT_ID].supabase.co/storage/v1/render/image/public';
  // Parameter: width, quality, format
  return `${baseUrl}/${path}?width=${width}&quality=80&format=webp`;
}
```

### C. Menggunakan Image Proxy (Cloudinary / Cloudimage)
Jika Anda menggunakan banyak link eksternal dari berbagai sumber, Anda bisa menggunakan layanan pihak ketiga sebagai "perantara".

**Contoh Implementasi di React:**
```tsx
function OptimizedImage({ src, width }: { src: string, width: number }) {
  // Contoh menggunakan Cloudimage.io (layanan gratis terbatas)
  const proxyUrl = `https://[YOUR_TOKEN].cloudimg.io/v7/${src}?w=${width}&org_if_sml=1`;
  
  return <img src={proxyUrl} alt="Optimized" loading="lazy" />;
}
```

### D. Parameter URL untuk Katalog Buku (Google Books/OpenLibrary)
Penyedia API cover buku biasanya menyediakan parameter ukuran. Gunakan versi thumbnail untuk list, dan versi besar hanya untuk halaman detail.

**Contoh Google Books:**
*   Thumbnail (Kecil): `...&zoom=1` (Gunakan di halaman List)
*   Besar: `...&zoom=3` (Gunakan di halaman Detail)

---

## 3. Best Practices "Lazy Loading"
Pastikan semua tag `<img>` yang tidak terlihat langsung saat halaman dibuka (di bawah lipatan layar) menggunakan atribut `loading="lazy"`.

```tsx
/* 
  loading="lazy" memberitahu browser: 
  "Jangan unduh gambar ini sampai pengguna men-scroll mendekatinya"
*/
<img src={bookCover} alt={title} loading="lazy" className="..." />
```

---

## 4. Kesimpulan
Untuk saat ini, karena koleksi buku masih dalam tahap pengembangan dan Anda sudah menggunakan **WebP**, optimasi manual Anda sudah mencukupi. Gunakan panduan ini sebagai referensi saat koleksi buku sudah mencapai ribuan atau saat fitur upload gambar admin dibuka.
