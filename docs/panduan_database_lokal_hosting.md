# 🗄️ Panduan Penggunaan Database Lokal di Hosting yang Sama (MySQL / PostgreSQL)

Jika instansi Anda sudah memiliki server database sendiri pada hosting yang sama (seperti cPanel, Hostinger, atau VPS) dan ingin memanfaatkannya tanpa menggunakan Supabase Cloud, panduan ini menjelaskan arsitektur keamanan dan langkah-langkah konfigurasinya.

---

## 📋 DAFTAR ISI
1. [Prinsip Keamanan: Kenapa React Tidak Bisa Menghubungi Database Langsung?](#1-prinsip-keamanan-kenapa-react-tidak-bisa-menghubungi-database-langsung)
2. [Arsitektur Integrasi Database Lokal](#2-arsitektur-integrasi-database-lokal)
3. [Langkah 1: Setup Database Kustom pada Hosting yang Sama](#langkah-1-setup-database-kustom-pada-hosting-yang-sama)
4. [Langkah 2: Setup Server Backend (Node.js atau PHP) sebagai Jembatan](#langkah-2-setup-server-backend-nodejs-atau-php-sebagai-jembatan)
5. [Langkah 3: Konfigurasi Frontend React ke Backend Lokal](#langkah-3-konfigurasi-frontend-react-ke-backend-lokal)

---

## 1. Prinsip Keamanan: Kenapa React Tidak Bisa Menghubungi Database Langsung?

Aplikasi React + Vite yang Anda bangun adalah **Single Page Application (SPA)** yang berjalan sepenuhnya di browser pengguna (*client-side*).

> [!CAUTION]
> **ATURAN UTAMA KEAMANAN:**  
> Jangan pernah menghubungkan kode React secara langsung ke database MySQL atau PostgreSQL menggunakan kredensial database (seperti DB_PASSWORD) di dalam file frontend.
> 
> * **Kenapa?** Karena semua file Javascript frontend diunduh oleh browser pengguna. Jika Anda menaruh username & password database di sana, pengguna yang melek teknologi dapat dengan mudah membaca password tersebut melalui menu *Inspect Element (Network Tab)* dan meretas database Anda.

Untuk menghubungkan React ke database lokal Anda secara aman, diperlukan **Server Backend** (seperti Node.js, Express, atau PHP) sebagai jembatan penengah.

---

## 2. Arsitektur Integrasi Database Lokal

Keuntungan meletakkan Database dan Server Backend pada hosting yang sama adalah **tidak adanya latensi jaringan** karena koneksi database dilakukan secara lokal (`localhost`).

```
[ BROWSER PENGGUNA ]
       │
       ▼ (Request HTTP Aman tanpa Password DB)
[ SERVER BACKEND (Node.js / PHP) ] ── (Membaca file .env rahasia di server)
       │
       ▼ (Koneksi Lokal ke localhost / 127.0.0.1)
[ DATABASE LOKAL (MySQL / Postgres) ]
```

---

## Langkah 1: Setup Database Kustom pada Hosting yang Sama

1. Buka panel hosting Anda (cPanel / hPanel Hostinger / VPS).
2. Buat database baru (misalnya: `db_disipusda`).
3. Buat user database baru dan buat password yang kuat.
4. Hubungkan user tersebut ke database dengan hak akses penuh (*All Privileges*).
5. Buat tabel database untuk booking dengan mengeksekusi skema SQL di phpMyAdmin:

```sql
CREATE TABLE IF NOT EXISTS `booking_enkapsulasi` (
  `id` VARCHAR(50) NOT NULL,
  `nama_lengkap` VARCHAR(150) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `whatsapp` VARCHAR(20) NOT NULL,
  `instansi` VARCHAR(150) NOT NULL,
  `tanggal_booking` DATE NOT NULL,
  `jumlah_dokumen` INT NOT NULL DEFAULT 1,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
  `note` TEXT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## Langkah 2: Setup Server Backend (Node.js atau PHP) sebagai Jembatan

Tulis kode di sisi server backend untuk melayani request dari frontend React dan meneruskannya ke database lokal.

### Pilihan A: Menggunakan Node.js (Express.js) - Sangat Direkomendasikan
Jika Anda men-deploy server Node.js di VPS/Hostinger yang sama:
1. Buat file `.env` di folder server Node.js Anda (file ini aman dari publik karena berada di sisi server):
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=user_database_anda
   DB_PASS=password_database_anda
   DB_NAME=db_disipusda
   API_SECURE_TOKEN=token_rahasia_untuk_frontend
   ```
2. Hubungkan menggunakan driver `mysql2` di Node.js:
   ```javascript
   const mysql = require('mysql2/promise');
   
   const pool = mysql.createPool({
     host: process.env.DB_HOST,
     user: process.env.DB_USER,
     password: process.env.DB_PASS,
     database: process.env.DB_NAME,
     waitForConnections: true,
     connectionLimit: 10,
   });
   ```

### Pilihan B: Menggunakan PHP (Jika menggunakan Hosting cPanel Biasa)
Jika hosting Anda adalah cPanel PHP biasa, buat file API sederhana (misal: `api.php`):
```php
<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

// Cek Otorisasi Token Keamanan
$headers = getallheaders();
$auth_token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';

if ($auth_token !== 'token_rahasia_untuk_frontend') {
    http_response_code(403);
    echo json_encode(["message" => "Unauthorized"]);
    exit();
}

// Koneksi ke Database Lokal (localhost) secara Aman
$conn = new mysqli("localhost", "user_database_anda", "password_database_anda", "db_disipusda");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["message" => "Koneksi database gagal"]);
    exit();
}

// Proses Route Endpoint
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') {
    // Tangani penyimpanan booking baru
    $data = json_decode(file_get_contents('php://input'), true);
    // Jalankan query INSERT aman...
}
```

---

## Langkah 3: Konfigurasi Frontend React ke Backend Lokal

Setelah API backend lokal Anda aktif dan berjalan di server hosting yang sama, hubungkan frontend React Anda dengan cara:

1. Edit file `.env` milik frontend React Anda:
   ```env
   VITE_ENABLE_BOOKING=true
   VITE_BOOKING_DB_MODE=api
   VITE_BOOKING_API_URL=https://domain-hosting-anda.com/api
   VITE_BOOKING_API_TOKEN=token_rahasia_untuk_frontend
   ```
2. Build ulang aplikasi React Anda menggunakan perintah `npm run build`.
3. Upload folder hasil build (`dist`) ke direktori root publik hosting Anda (seperti `public_html`).

Dengan arsitektur ini, data booking Anda tersimpan dengan aman di database lokal server Anda tanpa ketergantungan pada server pihak ketiga (cloud), serta aman dari kebocoran password database di sisi pengguna.
