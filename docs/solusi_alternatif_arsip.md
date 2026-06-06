# 💡 Solusi Alternatif: Integrasi Arsip JIKN Tanpa API & Tanpa Input Ganda

Dokumen ini memuat solusi alternatif yang cerdas, cepat diimplementasikan, dan tidak membebani admin dengan pekerjaan input data dua kali (double entry), mengingat portal JIKN nasional tidak memiliki API terbuka dan dilindungi sistem login.

---

## 🚀 Solusi 1: "Smart Search Redirect / Deep Linking" (Sangat Direkomendasikan ⭐)

Daripada menyalin datanya ke database kita, kita cukup memanfaatkan portal JIKN nasional yang sudah ada dengan membuat jembatan pencarian langsung dari web Disipusda Purwakarta.

### 🛠️ Cara Kerja:
1. Kita membuat kolom pencarian (Search Bar) "Cari Arsip Purwakarta" di halaman Kearsipan Disipusda Purwakarta.
2. Ketika pengunjung memasukkan kata kunci (misal: `"Bupati Purwakarta 1970"`) lalu klik "Cari", sistem kita akan mendeteksi kata kunci tersebut dan merangkai URL pencarian langsung (*deep link*) ke portal JIKN Nasional yang sudah terfilter khusus untuk wilayah Purwakarta.
3. Contoh format URL JIKN (berbasis AtoM):
   `https://jikn.go.id/index.php/informationobject/browse?repos=ID_PURWAKARTA&query=KATA_KUNCI`
4. Pengunjung akan diarahkan (membuka tab baru) langsung ke hasil pencarian di situs resmi JIKN yang menampilkan dokumen tersebut.

### 📊 Kelebihan & Kekurangan:
* **Beban Developer:** **Hampir 0%** (hanya membuat form pencarian HTML/React sederhana dengan redirect URL).
* **Beban Admin:** **0%** (tetap input data di JIKN seperti biasa, tidak ada input ganda di web Disipusda).
* **Beban Database:** **0%** (tidak perlu menyimpan file atau metadata).
* **Legalitas:** **100% Aman** karena kita mengarahkan pengunjung ke web resmi instansi negara.

---

## 🔗 Solusi 2: "Public Web Scraping" (Hanya untuk Data yang Terbit Publik)

Jika klien bersikeras bahwa hasil pencarian **harus tampil di dalam web Disipusda Purwakarta** (bukan me-redirect ke tab baru):

### 🛠️ Cara Kerja:
1. Kita tidak masuk lewat sistem login admin JIKN. Kita melakukan *scraping* (pengikisan web) pada **halaman publik** JIKN Purwakarta.
2. Jika dokumen kearsipan Purwakarta di JIKN bisa dicari oleh masyarakat umum tanpa login, maka kita bisa menggunakan skrip otomatis (seperti Node.js dengan `axios` + `cheerio` atau `puppeteer`) yang berjalan berkala (misal: 1 minggu sekali).
3. Skrip ini akan menyapu halaman hasil pencarian publik JIKN untuk instansi Purwakarta, mengambil metadatanya (judul, tahun, nomor arsip, link objek digital), lalu menyimpannya ke database lokal Supabase kita.

### 📊 Kelebihan & Kekurangan:
* **Kelebihan:** Hasil pencarian arsip tetap tampil estetik di dalam web Disipusda Purwakarta sendiri.
* **Kekurangan:** Rentan rusak jika tampilan web JIKN berubah (*layout change*), dan proses pembuatan skrip *scraper* memakan waktu ekstra.

---

## 🎨 Solusi 3: "Virtual Gallery / Pameran Arsip Unggulan" (Kompromi Terbaik)

Daripada membuat sistem pengarsipan raksasa yang menampung ribuan dokumen (yang bikin admin malas), tawarkan klien untuk membuat **"Galeri Pameran Arsip Sejarah Purwakarta"**.

### 🛠️ Cara Kerja:
* Kita hanya membuat halaman statis/dinamis yang menampilkan **10 s.d 20 dokumen arsip sejarah paling populer/paling penting** di Purwakarta (misalnya: dokumen pendirian Purwakarta, foto bupati pertama, peta kuno kota).
* Halaman ini dibuat dengan desain visual yang sangat premium (seperti museum digital) dengan deskripsi cerita sejarah di samping gambarnya.
* Untuk pencarian arsip umum lainnya, kita berikan tombol besar: *"Untuk mencari arsip lainnya, silakan akses basis data nasional kami di JIKN"* (menggunakan Solusi 1).

### 📊 Kelebihan & Kekurangan:
* **Kelebihan:** Web terlihat sangat keren dan premium secara visual (khas museum digital), konten dibatasi sehingga admin tidak perlu kerja berat.
* **Kekurangan:** Tidak berfungsi sebagai repositori arsip lengkap.

---

## 📌 Kesimpulan & Saran Negosiasi dengan Klien:

> [!TIP]
> Presentasikan **Solusi 3 (Pameran Arsip Unggulan)** yang dipadukan dengan **Solusi 1 (Pencarian JIKN Terintegrasi)** kepada klien Anda. 
> 
> Bilang ke mereka: *"Daripada membuang anggaran untuk sewa database besar dan memaksa admin mengetik hal yang sama dua kali, lebih baik kita buat galeri arsip unggulan yang estetik di web kita, dan pasang tombol pencari pintar yang langsung terhubung ke database nasional JIKN."*
