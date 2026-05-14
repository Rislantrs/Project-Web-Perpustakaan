# 📑 Riset Lanjutan: Keamanan, Integrasi, & AI (Disipusda)

Dokumen ini berisi strategi teknis untuk pengembangan tahap lanjut Sistem Informasi Perpustakaan Disipusda.

---

## 1. Keamanan Database: RLS Strict Multi-Tenant
**Tujuan:** Memastikan isolasi data total antara Admin dan proteksi data Member.

### Strategi Implementasi:
*   **Isolasi Admin:** Admin A tidak boleh bisa melihat atau mengubah data di bawah naungan Admin B.
*   **Member Protection:** Member hanya memiliki akses `SELECT` pada profilnya sendiri dan `INSERT` log yang terbatas.
*   **Append-Only Logs:** Tabel `notification_logs` diatur agar hanya bisa diisi (`INSERT`), tidak bisa diubah atau dihapus (`UPDATE/DELETE`), untuk menjaga integritas riwayat.

### Contoh SQL Policy (Postgres/Supabase):
```sql
-- Pastikan RLS aktif
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Admin hanya bisa akses member miliknya sendiri
CREATE POLICY "Admin isolation" ON members
FOR ALL TO authenticated
USING (auth.uid() = tenant_admin_id);

-- Member hanya bisa baca profilnya sendiri
CREATE POLICY "Member self-access" ON members
FOR SELECT TO authenticated
USING (auth.uid() = id);
```

---

## 2. Integrasi API Perpusnas / Satu Data
**Tujuan:** Sinkronisasi katalog buku nasional tanpa membebani server lokal.

### Arsitektur Sinkronisasi:
1.  **Staging Table:** Tempat penampungan sementara data mentah dari API Perpusnas.
2.  **Incremental Sync:** Hanya mengambil data yang berubah sejak tanggal sinkronisasi terakhir (menggunakan header `If-Modified-Since`).
3.  **Delta Detection:** Sistem hanya memperbarui baris di database lokal jika ada perubahan pada Hash/Checksum data buku.

### Jadwal Sinkronisasi (Cron):
*   **Harian (Jam 01:00):** Sinkronisasi data buku baru/populer.
*   **Mingguan (Minggu Malam):** Rekonsiliasi total untuk memastikan integritas data.

---

## 3. Desain AI Book Recommender
**Tujuan:** Memberikan rekomendasi buku personal berbasis histori peminjaman.

### Logika Algoritma (Hybrid Approach):
1.  **Content-Based:** Mencocokkan kategori buku yang sering dipinjam member dengan stok yang tersedia.
2.  **Collaborative Filtering:** Menyarankan buku yang dipinjam oleh member lain yang memiliki selera serupa.
3.  **Novelty Penalty:** Memberikan skor rendah pada buku yang sudah pernah dipinjam agar rekomendasi selalu segar.

### Alur Kerja Edge Function:
1.  Member membuka halaman "Rekomendasi".
2.  Edge Function mengambil histori 5 buku terakhir yang dipinjam.
3.  Function melakukan query ke tabel buku dengan filter kategori yang relevan.
4.  Hasil dikirim kembali ke UI dalam bentuk Carousel "Buku Untukmu".

---

## 🚀 Langkah Selanjutnya (Riset Besok):
- [ ] Tes SQL Policy di Supabase SQL Editor.
- [ ] Cari dokumentasi resmi API Perpusnas untuk endpoint `GET /katalog`.
- [ ] Buat prototipe Edge Function sederhana untuk logika rekomendasi kategori.
