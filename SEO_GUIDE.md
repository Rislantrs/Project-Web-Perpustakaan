# Panduan Pengelolaan SEO Disipusda Purwakarta

Dokumen ini berisi langkah-langkah untuk mengelola SEO agar web baru ini tidak bertabrakan dengan web lama selama masa pengembangan, namun siap untuk "go-live" kapan saja.

## 1. Selama Masa Pengembangan (Staging)

Saat ini, website disetel agar **TIDAK** muncul di hasil pencarian Google untuk menghindari konflik dengan website resmi yang masih aktif.

**Pengaturan di `index.html`:**
```html
<meta name="robots" content="noindex, nofollow" />
```
*   **noindex**: Memberitahu Google untuk tidak menyimpan halaman ini di database mereka.
*   **nofollow**: Memberitahu Google untuk tidak menelusuri link yang ada di web ini.

---

## 2. Persiapan Gambar Preview (Social Share)

Agar saat link dibagikan ke WhatsApp/Facebook muncul gambar yang bagus:
1.  Simpan gambar preview di folder `public/` (Contoh: `public/og-image.webp`).
2.  Gunakan path root di Meta Tag:
    ```html
    <meta property="og:image" content="/og-image.webp" />
    ```
*Catatan: Gambar di folder `public` akan langsung bisa diakses setelah web di-build.*

---

## 3. Langkah Rilis (Go-Live)

Jika Anda sudah siap menggantikan website lama dengan website baru ini, ikuti langkah berikut:

### Langkah A: Ubah Tag Robots
Buka `index.html` dan ubah baris robots menjadi:
```html
<meta name="robots" content="index, follow" />
```

### Langkah B: Perbarui URL Resmi
Pastikan `og:url` dan `twitter:url` sudah mengarah ke domain asli:
```html
<meta property="og:url" content="https://disipusda.purwakartakab.go.id/" />
```

### Langkah C: Request Indexing (Opsional)
Buka [Google Search Console](https://search.google.com/search-console) dan masukkan URL website baru Anda untuk mempercepat Google mengganti data web lama ke web baru.

---

## 4. Checklist Ringkas SEO
- [ ] `lang="id"` (Bahasa Indonesia).
- [ ] `<title>` unik dan mengandung kata kunci.
- [ ] `<meta name="description">` menarik dan informatif (max 160 karakter).
- [ ] `og:image` tersedia di folder public.
- [ ] `robots` sudah diubah ke `index, follow` saat hari peluncuran.

---
> **Tip:** Selalu cek tampilan preview link Anda menggunakan tool seperti opengraph.xyz sebelum melakukan rilis besar.
