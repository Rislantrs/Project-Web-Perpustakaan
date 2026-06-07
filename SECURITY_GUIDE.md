# ⚠️ PANDUAN PENGAMANAN KREDENSIAL ADMIN (PASCA DEPLOYMENT)

Dokumen ini menjelaskan langkah cepat untuk mengamankan akun admin default pada aplikasi **Disipusda Perpustakaan** yang telah dideploy di platform Cloudflare (atau hosting lainnya) agar tidak disalahgunakan oleh pihak asing, namun tetap mudah digunakan saat sesi presentasi/demo.

---

## 🔒 Status Risiko Saat Ini
Saat aplikasi pertama kali dijalankan, sistem otomatis mendaftarkan akun administratif default berikut ke dalam database lokal maupun Cloud Supabase:
* **Email**: `admin@disipusda.go.id`
* **Password Default**: `admin123`

> [!WARNING]
> Jika tautan hosting Cloudflare Anda disebarkan ke publik dan Anda masih menggunakan kredensial di atas tanpa diubah, siapa pun dapat masuk ke dashboard admin, menghapus katalog buku, mengubah artikel, atau memanipulasi riwayat peminjaman warga.

---

## 🛡️ Cara Mengamankan (2 Pilihan Langkah)

### Pilihan A: Mengubah Password Langsung dari Dashboard Admin (Sangat Direkomendasikan & Termudah)
Anda tidak perlu mengubah kode program. Cukup ubah datanya secara langsung:
1. Buka situs web demo Anda yang sudah aktif di Cloudflare.
2. Masuk ke halaman **Login Admin** (biasanya di `/login-admin` atau melalui menu navigasi admin).
3. Masuk menggunakan akun default:
   * **Email**: `admin@disipusda.go.id`
   * **Password**: `admin123`
4. Setelah masuk ke **Dashboard Admin**, navigasikan ke menu **Kelola Admin** atau **Pengaturan Profil**.
5. Pilih akun **Super Admin** Anda, klik **Edit / Ubah Password**.
6. Masukkan password baru yang kuat (contoh: `DisipusdaPwk2026!`).
7. Simpan perubahan. Password default `admin123` kini sudah tidak aktif lagi di server cloud Supabase Anda!

---

### Pilihan B: Menonaktifkan Seeder Otomatis di Kode Program (Langkah Permanen)
Jika Anda tidak ingin akun default ini dibuat sama sekali pada database baru di masa mendatang, Anda bisa menghapus pendaftarannya di kode sumber:

1. Buka berkas [db.ts](file:///c:/Users/Rislan/Downloads/Library%20Website%20Design/src/services/db.ts#L89-L107).
2. Temukan fungsi `initializeDB()` pada baris ke-89.
3. Hapus atau komentari blok kode inisialisasi default admin:

```typescript
// Hapus atau komentari bagian ini jika dideploy ke produksi:
const admins = dbGet(DB_KEYS.ADMINS, []);
if (admins.length === 0) {
  // Blok inisialisasi admin123
}
```

4. Lakukan *push* atau *deploy* ulang ke Cloudflare Pages.

---

## 💡 Tips untuk Sesi Demo/Presentasi
* Jika web ini hanya digunakan untuk **Demo Singkat (1-2 hari)**, Anda boleh tetap membiarkan password `admin123` agar dosen/penguji mudah mencoba. Namun, **segera ubah** password tersebut setelah sesi demo selesai agar database Supabase Anda tetap aman dari robot scanner internet.
