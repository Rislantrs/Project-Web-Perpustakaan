# 🗄️ Panduan Komprehensif Database Lokal di Hosting yang Sama (MySQL / PostgreSQL)

Panduan ini disusun untuk membantu pengembang menghubungkan aplikasi **React (Frontend)** ke **Database Lokal (MySQL/PostgreSQL)** yang berada di server hosting yang sama (seperti cPanel, Hostinger, Niagahoster, atau VPS) melalui perantara **Server Backend** yang aman.

---

## 📋 DAFTAR ISI
1. [Konsep Utama: Mengapa React Tidak Boleh Berhubungan Langsung dengan Database?](#1-konsep-utama-mengapa-react-tidak-boleh-berhubungan-langsung-dengan-database)
2. [Arsitektur Integrasi & Isolasi Kredensial](#2-arsitektur-integrasi--isolasi-kredensial)
3. [Panduan Langkah demi Langkah Setup Database Lokal](#3-panduan-langkah-demi-langkah-setup-database-lokal)
4. [Skrip Backend Jembatan yang Aman (Production-Ready)](#4-skrip-backend-jembatan-yang-aman-production-ready)
5. [Konfigurasi CORS (Cross-Origin Resource Sharing)](#5-konfigurasi-cors-cross-origin-resource-sharing)
6. [Langkah 3: Konfigurasi Rute API di Frontend React](#6-langkah-3-konfigurasi-rute-api-di-frontend-react)

---

## 1. Konsep Utama: Mengapa React Tidak Boleh Berhubungan Langsung dengan Database?

Aplikasi React + Vite yang Anda buat adalah **Single Page Application (SPA)**. Semua kode komponen, fungsi, dan aset di dalamnya akan dikompilasi menjadi file JavaScript statis biasa dan diunduh secara utuh ke browser pengguna saat mereka mengunjungi situs Anda.

> [!CAUTION]
> **ATURAN MUTLAK KEAMANAN:**
> Jangan pernah menulis kredensial database (Host, Port, Username, Password) di dalam file proyek React Anda.
>
> **Resiko Fatal:** Jika Anda meletakkan kredensial database langsung di React (misalnya memanggil driver database dari sisi browser), siapa pun yang mengunjungi website Anda dapat melihat password database Anda cukup dengan membuka **Developer Tools (F12) > tab Sources/Network**, lalu meretas, menghapus, atau mencuri seluruh data database Anda dalam hitungan detik.

---

## 2. Arsitektur Integrasi & Isolasi Kredensial

Untuk menghubungkan React ke database lokal Anda dengan aman, Anda wajib menyisipkan sebuah **Server Backend** sebagai pelindung dan jembatan penengah. Kredensial database disimpan secara terisolasi hanya di server backend dan tidak pernah dikirimkan ke browser pengguna.

```
[ BROWSER PENGGUNA (Client-Side) ]
       │
       ▼ (1. Mengirim Request API HTTP Aman - TANPA Password DB)
[ SERVER BACKEND (Node.js / PHP di Server) ] ── (2. Membaca Password dari file .env internal)
       │
       ▼ (3. Query Lokal via localhost / 127.0.0.1)
[ DATABASE LOKAL (MySQL / PostgreSQL) ]
```

---

## 3. Panduan Langkah demi Langkah Setup Database Lokal

Berikut adalah panduan lengkap membuat database lokal pada cPanel / panel hosting Hostinger:

### Langkah A: Membuat Database Baru
1. Masuk ke **Control Panel Hosting** Anda (cPanel / hPanel).
2. Cari menu **MySQL Databases** (atau **MySQL Database Wizard**).
3. Buat database baru, contoh: `u12345_disipusda`.
4. Buat user database baru, contoh: `u12345_pusdauser`, dan buat password yang kuat (gunakan tombol *Password Generator*).
5. Pada bagian **Add User to Database**, hubungkan user baru tersebut ke database yang baru dibuat.
6. Centang opsi **ALL PRIVILEGES** (Hak Akses Penuh), lalu simpan perubahan.

### Langkah B: Impor Skema Tabel ke phpMyAdmin
1. Kembali ke halaman utama panel hosting, buka menu **phpMyAdmin**.
2. Pilih nama database yang baru saja Anda buat di bilah sisi kiri.
3. Klik tab **SQL** di bagian atas menu.
4. Salin dan tempel skema tabel database booking di bawah ini, lalu klik **Go/Kirim**:

```sql
CREATE TABLE IF NOT EXISTS `booking_enkapsulasi` (
  `id` VARCHAR(50) NOT NULL,
  `nama_lengkap` VARCHAR(150) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `whatsapp` VARCHAR(20) NOT NULL,
  `instansi` VARCHAR(150) NOT NULL,
  `tanggal_booking` DATE NOT NULL,
  `jumlah_dokumen` INT NOT NULL DEFAULT 1,
  `status` ENUM('pending', 'approved', 'rejected', 'done') NOT NULL DEFAULT 'pending',
  `note` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 4. Skrip Backend Jembatan yang Aman (Production-Ready)

Pilih salah satu dari skrip sisi server di bawah ini sesuai dengan teknologi server hosting Anda.

### Opsi A: Menggunakan PHP PDO (cPanel Shared Hosting - Rekomendasi PHP)
Simpan file ini dengan nama `booking_api.php` pada folder `public_html/api/booking_api.php` di hosting Anda:

```php
<?php
// 1. Konfigurasi Header CORS & Keamanan Ketat
header("Access-Control-Allow-Origin: *"); // Untuk produksi, ubah * menjadi domain Anda (misal: https://disipusda.purwakartakab.go.id)
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Tangani Preflight Request CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Validasi Token Keamanan Bearer
$headers = getallheaders();
$authToken = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';
$secureToken = "GANTI_DENGAN_TOKEN_KEAMANAN_RAHASIA_ANDA";

if (empty($authToken) || $authToken !== $secureToken) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Akses Ditolak: Token Tidak Valid!"]);
    exit();
}

// 3. Koneksi Database Lokal Menggunakan PDO (Lebih Aman)
$db_host = "localhost";
$db_user = "u12345_pusdauser";
$db_pass = "Password_Kuat_Anda_Di_Sini";
$db_name = "u12345_disipusda";

try {
    $dsn = "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Koneksi database gagal."]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// 4. Endpoint GET: Mengambil Data Booking
if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM booking_enkapsulasi ORDER BY created_at DESC");
        $data = $stmt->fetchAll();
        echo json_encode(["success" => true, "data" => $data]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Gagal mengambil data: " . $e->getMessage()]);
    }
    exit();
}

// 5. Endpoint POST: Menyimpan Data Booking Baru
if ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    
    // Validasi input minimal
    if (empty($input['nama_lengkap']) || empty($input['email']) || empty($input['whatsapp']) || empty($input['tanggal_booking'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Data input tidak lengkap."]);
        exit();
    }
    
    try {
        $id = $input['id'] ?? uniqid('BK-');
        
        $query = "INSERT INTO booking_enkapsulasi (id, nama_lengkap, email, whatsapp, instansi, tanggal_booking, jumlah_dokumen, note) 
                  VALUES (:id, :nama, :email, :whatsapp, :instansi, :tanggal, :jumlah, :note)";
                  
        $stmt = $pdo->prepare($query);
        $stmt->execute([
            ':id' => $id,
            ':nama' => $input['nama_lengkap'],
            ':email' => $input['email'],
            ':whatsapp' => $input['whatsapp'],
            ':instansi' => $input['instansi'] ?? null,
            ':tanggal' => $input['tanggal_booking'],
            ':jumlah' => intval($input['jumlah_dokumen'] ?? 1),
            ':note' => $input['note'] ?? null
        ]);
        
        http_response_code(201);
        echo json_encode(["success" => true, "message" => "Booking berhasil disimpan!", "id" => $id]);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Gagal menyimpan data ke database: " . $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Metode HTTP tidak didukung."]);
?>
```

### Opsi B: Menggunakan Node.js Express (`booking_server.js` - VPS / Node Hosting)
Simpan file ini di server Node.js lokal Anda. Anda dapat menjalankannya di background menggunakan PM2:

```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: '*', // Ganti dengan domain frontend Anda
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database Pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u12345_pusdauser',
  password: process.env.DB_PASSWORD || 'Password_Kuat_Anda',
  database: process.env.DB_NAME || 'u12345_disipusda',
  connectionLimit: 10
});

// Auth Middleware
const checkAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const secureToken = process.env.API_SECURE_TOKEN || 'GANTI_DENGAN_TOKEN_KEAMANAN_RAHASIA_ANDA';
  
  if (!token || token !== secureToken) {
    return res.status(403).json({ success: false, message: 'Forbidden: Token tidak valid.' });
  }
  next();
};

app.get('/api/booking', checkAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM booking_enkapsulasi ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/booking', checkAuth, async (req, res) => {
  const { id, nama_lengkap, email, whatsapp, instansi, tanggal_booking, jumlah_dokumen, note } = req.body;
  if (!nama_lengkap || !email || !whatsapp || !tanggal_booking) {
    return res.status(400).json({ success: false, message: 'Data input tidak lengkap.' });
  }
  try {
    const bookingId = id || 'BK-' + Date.now();
    await db.query(
      'INSERT INTO booking_enkapsulasi (id, nama_lengkap, email, whatsapp, instansi, tanggal_booking, jumlah_dokumen, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [bookingId, nama_lengkap, email, whatsapp, instansi || null, tanggal_booking, jumlah_dokumen || 1, note || null]
    );
    res.status(201).json({ success: true, message: 'Booking berhasil disimpan!', id: bookingId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Booking API berjalan di port ${PORT}`));
```

---

## 5. Konfigurasi CORS (Cross-Origin Resource Sharing) & .htaccess

CORS adalah mekanisme keamanan browser untuk mencegah kode jahat (XSS) di domain lain mengakses data sensitif Anda.
* **Pengaturan cPanel Apache (`.htaccess`):**
  Untuk mencegah masalah browser memblokir request preflight (OPTIONS), tambahkan aturan header berikut di berkas `.htaccess` di dalam direktori `public_html/api/`:
  ```apache
  <IfModule mod_headers.c>
      Header set Access-Control-Allow-Origin "*"
      Header set Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE"
      Header set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  </IfModule>
  ```

---

## 6. PENTING: Penanganan React Router Fallback (.htaccess cPanel)

Ketika Anda menggunakan **React Router (SPA)** di frontend (misalnya rute `/admin`, `/login`, atau `/booking`), server hosting seperti Apache di cPanel akan mengira rute tersebut adalah folder fisik di server. Jika folder tidak ada, server akan menampilkan error **404 Not Found** saat pengguna me-refresh halaman.

### Solusi Mutlak React Router cPanel:
Buat file bernama `.htaccess` (perhatikan tanda titik di awal) di direktori utama website Anda (`public_html/`), lalu isi dengan kode rewrite berikut:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Abaikan rewrite jika request berupa file atau direktori fisik yang benar-benar ada
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  
  # Arahkan semua request halaman web lainnya ke index.html agar dihandle oleh React Router
  RewriteRule ^ index.html [L]
</IfModule>
```

---

## 7. Langkah 3: Konfigurasi Rute API di Frontend React

Setelah API backend di server lokal Anda aktif, Anda tinggal menghubungkan aplikasi frontend React Anda:

1. Buka file **`.env`** di direktori proyek React lokal Anda.
2. Atur konfigurasi agar mengarah ke API baru Anda di server:
   ```env
   VITE_ENABLE_BOOKING=true
   VITE_BOOKING_DB_MODE=api
   VITE_BOOKING_API_URL=https://domain-hosting-anda.com/api/booking_api.php
   VITE_BOOKING_API_TOKEN=GANTI_DENGAN_TOKEN_KEAMANAN_RAHASIA_ANDA
   ```
3. Lakukan kompilasi ulang proyek frontend dengan menjalankan perintah:
   ```bash
   npm run build
   ```
4. Unggah seluruh isi file di dalam folder **`dist/`** hasil build ke direktori root publik hosting Anda (seperti folder `public_html` di Hostinger/cPanel).

Aplikasi React Anda kini telah terhubung ke database lokal server Anda dengan aman dan lancar tanpa resiko kebocoran password database!

