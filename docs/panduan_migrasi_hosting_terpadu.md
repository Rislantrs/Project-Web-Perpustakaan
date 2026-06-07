# 📦 PANDUAN MIGRASI KE HOSTING TERPADU (HOSTINGER/VPS)
### Menggunakan Node.js (JavaScript/TypeScript) & Menghindari Overhaul Kode

Dokumen ini menjelaskan strategi memigrasikan website **Disipusda** (React Frontend + Database & Server API) secara mandiri ke penyedia hosting terpadu seperti **Hostinger** atau **VPS** (seperti Niagahoster, DigitalOcean, atau AWS) tanpa perlu menulis ulang frontend.

---

## 📋 DAFTAR ISI
1. [Apakah Harus Merombak Total Kode?](#1-apakah-harus-merombak-total-kode)
2. [Opsi Infrastruktur di Hostinger (Node.js vs Shared Hosting vs VPS)](#2-opsi-infrastruktur-di-hostinger-nodejs-vs-shared-hosting-vs-vps)
3. [Alur Deployment React Frontend (Klien)](#3-alur-deployment-react-frontend-klien)
4. [Alur Deployment Server Backend Node.js (Express)](#4-alur-deployment-server-backend-nodejs-express)
5. [Konfigurasi Daemon Server Menggunakan PM2 (Khusus VPS)](#5-konfigurasi-daemon-server-menggunakan-pm2-khusus-vps)
6. [Konfigurasi Domain, SSL, SMTP, & Cron Jobs di Hostinger](#6-konfigurasi-domain-ssl-smtp--cron-jobs-di-hostinger)

---

## 1. Apakah Harus Merombak Total Kode?

> [!IMPORTANT]
> **TIDAK.** Kode frontend React (TypeScript) Anda **SAMA SEKALI TIDAK PERLU DIROMBAK** jika Anda pindah hosting ke Hostinger/VPS.
>
> Mengapa? Karena ada perbedaan mendasar antara **Frontend** (sisi browser pengguna) dan **Backend** (sisi server):
> 1. **Frontend (React/TypeScript):** Ketika Anda menjalankan perintah `npm run build`, React akan diterjemahkan menjadi file HTML, CSS, dan JavaScript statis biasa (di folder `dist`). File-file inilah yang diunggah ke Hostinger. Browser pengunjung akan mengunduh file ini dan menjalankannya secara lokal di HP/komputer mereka.
> 2. **Backend (Database, Cron, Email):** Sisi yang memproses database dan logika server. Saat ini, semua bagian backend Anda diurus oleh **Supabase**.

Frontend Anda sudah dipisahkan menggunakan *Repository Pattern* yang siap dipindah-pindah. Jika database dipindah ke Hostinger, Anda hanya perlu merubah file **`.env`** di React agar mengarah ke API Hostinger Anda, lalu jalankan `npm run build` kembali.

---

## 2. Opsi Infrastruktur di Hostinger (Node.js vs Shared Hosting vs VPS)

Hostinger menawarkan beberapa opsi lingkungan server yang sesuai dengan kebutuhan dan anggaran:

### Opsi A: Shared Cloud Startup / Node.js Hosting (Rekomendasi - Mudah & Murah)
* **Kelebihan:** Sangat mudah dikelola karena menggunakan control panel hPanel Hostinger. Sudah mendukung runtime Node.js bawaan tanpa setup Linux terminal.
* **Database:** Menyediakan MySQL lokal (tidak perlu bayar Supabase lagi).

### Opsi B: VPS (Virtual Private Server) (Rekomendasi - Skala Besar & Mandiri)
* **Kelebihan:** Akses penuh ke sistem operasi Linux (Root Terminal). Anda bisa menginstal PostgreSQL versi berapa saja, mengatur Node.js port secara kustom, dan performa jauh lebih stabil.
* **Database:** PostgreSQL murni (bisa langsung restore database dari Supabase menggunakan format `.sql`).

---

## 3. Alur Deployment React Frontend (Klien)

Proses mengunggah aplikasi frontend React ke domain utama Anda di Hostinger:

1. Buka folder proyek lokal Anda.
2. Edit berkas `.env` dan ganti isinya agar mengarah ke API backend lokal baru Anda:
   ```env
   VITE_ENABLE_BOOKING=true
   VITE_BOOKING_DB_MODE=api
   VITE_BOOKING_API_URL=https://api.disipusda.purwakartakab.go.id/api
   VITE_BOOKING_API_TOKEN=token_keamanan_api_anda
   ```
3. Jalankan build frontend:
   ```bash
   npm run build
   ```
4. Buka **Control Panel Hostinger** > **File Manager**.
5. Masuk ke direktori domain Anda > buka folder `public_html/`.
6. Unggah seluruh isi file yang ada di dalam folder lokal **`dist/`** ke dalam folder `public_html/` tersebut.

---

## 4. Alur Deployment Server Backend Node.js (Express)

Jika menggunakan layanan Node.js hosting di Hostinger hPanel:

1. Buat folder baru di luar `public_html/` (misalnya: `/home/user/apps/backend-api/`).
2. Masukkan file backend Express Node.js Anda beserta `package.json` dan file `.env` rahasia server Anda.
3. Di panel **Hostinger hPanel** > buka menu **Node.js Configuration**.
4. Setel konfigurasi Node.js:
   - **App Directory:** `/home/user/apps/backend-api/`
   - **Entry File:** `server.js` (atau `dist/server.js`)
   - **Node.js Version:** Pilih versi terbaru (misal: 18 atau 20).
5. Klik **Install NPM Modules** untuk menginstal semua dependency secara otomatis.
6. Klik **Start** untuk menyalakan server API Anda.

---

## 5. Konfigurasi Khusus VPS (Ubuntu / Debian Linux)

Apabila menggunakan VPS Linux mandiri, Anda harus mengatur server proxy dan pengelola proses Node.js sendiri.

### A. Konfigurasi Daemon Server Menggunakan PM2
PM2 bertugas memantau proses Node.js agar tetap berjalan di latar belakang (*daemonize*) dan otomatis restart jika terjadi crash atau server mati listrik.

```bash
# 1. Masuk ke VPS via SSH
ssh root@ip_vps_anda

# 2. Install Node.js dan PM2 secara global
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install pm2 -g

# 3. Masuk ke folder backend-api di VPS
cd /var/www/disipusda-api

# 4. Install dependency dan jalankan server dengan PM2
npm install
pm2 start server.js --name "disipusda-backend-api"

# 5. Konfigurasi agar PM2 otomatis menyala kembali jika VPS restart/mati listrik
pm2 startup systemd
# Salin dan jalankan perintah keluaran dari terminal (sudo env PATH=...)
pm2 save
```

#### Perintah Navigasi PM2 yang Sering Digunakan:
* **Melihat Log Real-time:** `pm2 logs`
* **Melihat Status Layanan:** `pm2 status` atau `pm2 list`
* **Restart Server:** `pm2 restart disipusda-backend-api`
* **Melihat Dashboard Kinerja CPU/Memory:** `pm2 monit`

### B. Konfigurasi Nginx Reverse Proxy (Port 80/443 ke Port Node.js 3000)
Secara default, aplikasi Node.js Express berjalan pada port internal (seperti 3000). Agar dapat diakses publik via port 80 (HTTP) dan 443 (HTTPS), Anda wajib memasang Nginx sebagai Web Server / Reverse Proxy.

1. Install Nginx:
   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```
2. Buat file konfigurasi virtual host baru:
   ```bash
   sudo nano /etc/nginx/sites-available/api.disipusda.conf
   ```
3. Salin dan tempel konfigurasi berikut:
   ```nginx
   server {
       listen 80;
       server_name api.disipusda.purwakartakab.go.id; # Ganti dengan domain/subdomain Anda

       location / {
           proxy_pass http://127.0.0.1:3000; # Arahkan ke port internal Node.js
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
4. Aktifkan konfigurasi dan restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/api.disipusda.conf /etc/nginx/sites-enabled/
   sudo nginx -t # Tes keakuratan sintaks
   sudo systemctl restart nginx
   ```

### C. Mengamankan Koneksi dengan SSL Let's Encrypt Gratis
Gunakan Certbot untuk menginstal sertifikat SSL otomatis pada Nginx Anda:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.disipusda.purwakartakab.go.id
# Pilih opsi redirect HTTP ke HTTPS otomatis
```

---

## 6. Konfigurasi SMTP (Kirim Email Transaksional)

SMTP (Simple Mail Transfer Protocol) wajib disetel agar server Anda dapat mengirimkan email notifikasi konfirmasi booking atau pengingat denda.

### Opsi A: SMTP Nodemailer (Node.js Backend)
Gunakan module `nodemailer` di Node.js:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true untuk port 465 (SSL)
  auth: {
    user: process.env.SMTP_USER || 'no-reply@disipusda.purwakartakab.go.id',
    pass: process.env.SMTP_PASS || 'Password_Akun_Email_SMTP_Anda'
  }
});

// Contoh fungsi mengirim email
async function sendNotificationEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: '"Disipusda Purwakarta" <no-reply@disipusda.purwakartakab.go.id>',
      to: to,
      subject: subject,
      text: text,
      html: html
    });
    console.log("Email berhasil dikirim: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Gagal mengirim email SMTP:", error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendNotificationEmail };
```

### Opsi B: SMTP PHPMailer (PHP Backend)
Jika Anda menggunakan backend PHP, gunakan library **PHPMailer** agar email tidak masuk ke folder SPAM (jangan gunakan fungsi `mail()` bawaan PHP karena sering diblokir penyedia email):

```php
<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Pastikan PHPMailer sudah terinstall via Composer

function sendEmailPHP($to, $subject, $body) {
    $mail = new PHPMailer(true);
    try {
        // Konfigurasi Server
        $mail->isSMTP();
        $mail->Host       = 'smtp.hostinger.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'no-reply@disipusda.purwakartakab.go.id';
        $mail->Password   = 'Password_Akun_Email_SMTP_Anda';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL
        $mail->Port       = 465;

        // Penerima
        $mail->setFrom('no-reply@disipusda.purwakartakab.go.id', 'Disipusda Purwakarta');
        $mail->addAddress($to);

        // Konten
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $body;

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Gagal mengirim email: {$mail->ErrorInfo}");
        return false;
    }
}
?>
```

---

## 7. Setup Cron Jobs (Jadwal Pengiriman Pengingat & Denda Harian)

Tugas terjadwal (seperti mengecek transaksi peminjaman yang telat dan menghitung denda harian) harus dijalankan secara teratur.

### Opsi A: Melalui Hostinger hPanel / cPanel
1. Buka dashboard panel hosting > cari menu **Cron Jobs**.
2. Buat Cron Job baru dengan jadwal harian (misal setiap jam 08.00 pagi = `0 8 * * *`).
3. Setel perintah eksekusi agar memanggil interpreter Node.js atau PHP secara lokal:
   ```bash
   # Contoh Node.js di Hostinger
   /usr/local/bin/node /home/user/apps/backend-api/cron/sendReminders.js
   
   # Contoh PHP di cPanel
   /usr/local/bin/php /home/user/public_html/api/cron_send_reminders.php
   ```

### Opsi B: Menggunakan Crontab di VPS Linux
1. Hubungi VPS via terminal SSH.
2. Buka editor crontab dengan perintah:
   ```bash
   crontab -e
   ```
3. Tambahkan baris konfigurasi berikut di bagian bawah berkas (menjalankan pengecekan denda setiap hari pukul 07:00 pagi waktu server):
   ```text
   0 7 * * * /usr/bin/node /var/www/disipusda-api/cron/overdueCheck.js >> /var/log/cron-overdue.log 2>&1
   ```
4. Simpan dan keluar dari editor. Perintah di atas akan mencatat log aktivitas ke `/var/log/cron-overdue.log` untuk memudahkan proses debugging.

> [!IMPORTANT]
> **KEAMANAN CRON JOB:**
> Sangat direkomendasikan untuk menjalankan Cron Job via CLI (Command Line) seperti contoh di atas, bukan dengan memanggil URL publik (contoh: `curl https://domain.com/api/cron.php`). Memanggil URL publik beresiko dimanipulasi oleh bot spammer yang dapat memicu overload server dengan memanggil URL tersebut jutaan kali secara beruntun.

