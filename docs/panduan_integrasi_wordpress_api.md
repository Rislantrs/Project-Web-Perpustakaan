# 📘 Panduan Integrasi: Modul Booking React & WordPress REST API

Panduan ini menjelaskan secara detail langkah-langkah untuk memisahkan fitur **Booking Enkapsulasi** agar berjalan di domain baru (sebagai microservice) dan menyimpan datanya langsung ke database **WordPress (MySQL)** milik website utama Anda via **Custom REST API**.

---

## 📋 DAFTAR ISI
1. [Mengapa Variabel Mode API Belum Ada di `.env`?](#1-mengapa-variabel-mode-api-belum-ada-di-env)
2. [Langkah 1: Konfigurasi `.env` pada Modul Booking](#langkah-1-konfigurasi-env-pada-modul-booking)
3. [Langkah 2: Membuat Tabel Database Kustom di WordPress (MySQL)](#langkah-2-membuat-tabel-database-kustom-di-wordpress-mysql)
4. [Langkah 3: Menulis Kode API Custom di Tema WordPress (`functions.php`)](#langkah-3-menulis-kode-api-custom-di-tema-wordpress-functionsphp)
5. [Langkah 4: Deploy & Menampilkan Formulir di Halaman WordPress](#langkah-4-deploy--menampilkan-formulir-di-halaman-wordpress)

---

## 1. Mengapa Variabel Mode API Belum Ada di `.env`?

Secara default, project ini dikonfigurasi menggunakan **Supabase (Monolith)**, sehingga file `.env` bawaan hanya berisi URL Supabase dan Anon Key. 

Untuk mengaktifkan mode REST API (WordPress/backend kustom), Anda cukup menambahkan baris variabel tersebut secara manual ke dalam file `.env` di server hosting modul booking Anda.

---

## Langkah 1: Konfigurasi `.env` pada Modul Booking

Salin kode berikut dan tambahkan ke bagian paling bawah file `.env` pada hosting/subdomain modul booking Anda (misal: `booking.purwakartakab.go.id`):

```env
# --- KONFIGURASI MICROSERVICE (API MODE) ---
# Ubah DB_MODE dari 'supabase' menjadi 'api'
VITE_BOOKING_DB_MODE=api

# URL REST API WordPress Anda (sesuai namespace route di langkah 3)
VITE_BOOKING_API_URL=https://web-utama-wordpress.com/wp-json/booking/v1

# Token keamanan acak bebas yang harus sama antara React dan WordPress
VITE_BOOKING_API_TOKEN=rahasia_token_keamanan_wp_disipusda
```

---

## Langkah 2: Membuat Tabel Database Kustom di WordPress (MySQL)

WordPress menyimpan data di database MySQL. Kita perlu membuat tabel baru bernama `wp_booking_enkapsulasi` untuk menyimpan data booking.

1. Buka **phpMyAdmin** di hosting WordPress Anda.
2. Pilih database WordPress Anda (biasanya berawalan `wp_` atau nama database WordPress Anda).
3. Jalankan perintah SQL berikut di menu **SQL** phpMyAdmin:

```sql
CREATE TABLE IF NOT EXISTS `wp_booking_enkapsulasi` (
  `id` VARCHAR(50) NOT NULL,
  `nama_lengkap` VARCHAR(150) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `whatsapp` VARCHAR(20) NOT NULL,
  `instansi` VARCHAR(150) NOT NULL,
  `tanggal_booking` DATE NOT NULL,
  `jumlah_dokumen` INT NOT NULL DEFAULT 1,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
  `note` TEXT NULL,
  `reschedule_date` DATE NULL,
  `reschedule_note` TEXT NULL,
  `token_reschedule` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## Langkah 3: Menulis Kode API Custom di Tema WordPress (`functions.php`)

Agar WordPress dapat menerima kiriman data dari modul booking React, kita harus membuat **Custom Route API** menggunakan REST API bawaan WordPress.

1. Buka cPanel / File Manager WordPress Anda.
2. Masuk ke folder `/wp-content/themes/[tema-aktif-anda]/`.
3. Buka file `functions.php` dan tambahkan kode PHP berikut di bagian paling bawah file:

```php
<?php
/**
 * ============================================================================
 * CUSTOM REST API UNTUK INTEGRASI MODUL BOOKING REACT
 * ============================================================================
 */

add_action('rest_api_init', function () {
    // 1. Endpoint Cek Tanggal Tersedia: GET /wp-json/booking/v1/check-date
    register_rest_route('booking/v1', '/check-date', array(
        'methods'             => 'GET',
        'callback'            => 'wp_booking_check_date',
        'permission_callback' => 'wp_booking_check_auth',
    ));

    // 2. Endpoint Kirim Booking Baru: POST /wp-json/booking/v1/bookings
    register_rest_route('booking/v1', '/bookings', array(
        'methods'             => 'POST',
        'callback'            => 'wp_booking_create_booking',
        'permission_callback' => 'wp_booking_check_auth',
    ));

    // 3. Endpoint Kalender Status: GET /wp-json/booking/v1/calendar
    register_rest_route('booking/v1', '/calendar', array(
        'methods'             => 'GET',
        'callback'            => 'wp_booking_get_calendar',
        'permission_callback' => 'wp_booking_check_auth',
    ));
});

/**
 * 1. Fungsi Validasi Token Keamanan (Bearer Token)
 */
function wp_booking_check_auth(WP_REST_Request $request) {
    // Tentukan token keamanan (Wajib sama dengan VITE_BOOKING_API_TOKEN di file .env React)
    $secure_token = 'rahasia_token_keamanan_wp_disipusda';

    $auth_header = $request->get_header('Authorization');
    if (!$auth_header) {
        return new WP_Error('no_auth', 'Token otorisasi diperlukan.', array('status' => 401));
    }

    // Ekstrak token dari format "Bearer <token>"
    if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
        if ($matches[1] === $secure_token) {
            return true; // Token cocok, akses diizinkan
        }
    }

    return new WP_Error('invalid_token', 'Token otorisasi tidak valid.', array('status' => 403));
}

/**
 * 2. Callback Cek Kuota Tanggal (GET /check-date?date=YYYY-MM-DD)
 */
function wp_booking_check_date(WP_REST_Request $request) {
    global $wpdb;
    $date = sanitize_text_field($request->get_param('date'));

    if (empty($date)) {
        return new WP_REST_Response(array('available' => false, 'message' => 'Tanggal kosong'), 400);
    }

    // Kuota maksimum booking per hari (misal: maksimal 5 antrean)
    $max_quota = 5;

    $table_name = $wpdb->prefix . 'booking_enkapsulasi';
    $count = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM $table_name WHERE tanggal_booking = %s AND status != 'rejected' AND status != 'cancelled'",
        $date
    ));

    $available = ($count < $max_quota);

    return new WP_REST_Response(array('available' => $available), 200);
}

/**
 * 3. Callback Buat Booking Baru (POST /bookings)
 */
function wp_booking_create_booking(WP_REST_Request $request) {
    global $wpdb;
    $params = $request->get_json_params();

    if (empty($params['nama_lengkap']) || empty($params['tanggal_booking']) || empty($params['whatsapp'])) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Data input tidak lengkap.'), 400);
    }

    $table_name = $wpdb->prefix . 'booking_enkapsulasi';

    // Buat ID unik untuk booking baru (misal: menggunakan UUID sederhana)
    $booking_id = wp_generate_uuid4();

    $data = array(
        'id'              => $booking_id,
        'nama_lengkap'    => sanitize_text_field($params['nama_lengkap']),
        'email'           => sanitize_email($params['email']),
        'whatsapp'        => sanitize_text_field($params['whatsapp']),
        'instansi'        => sanitize_text_field($params['instansi']),
        'tanggal_booking' => sanitize_text_field($params['tanggal_booking']),
        'jumlah_dokumen'  => intval($params['jumlah_dokumen']),
        'status'          => 'pending',
    );

    $inserted = $wpdb->insert($table_name, $data);

    if ($inserted === false) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Gagal menyimpan ke database WordPress.'), 500);
    }

    // Ambil data yang berhasil dimasukkan
    $db_data = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %s", $booking_id), ARRAY_A);

    return new WP_REST_Response(array(
        'success' => true,
        'message' => 'Booking berhasil dibuat.',
        'data'    => $db_data
    ), 201);
}

/**
 * 4. Callback Ambil Data Kalender (GET /calendar?year=YYYY&month=MM)
 */
function wp_booking_get_calendar(WP_REST_Request $request) {
    global $wpdb;
    $year  = intval($request->get_param('year'));
    $month = intval($request->get_param('month'));

    if (!$year || !$month) {
        $year  = intval(date('Y'));
        $month = intval(date('m'));
    }

    $table_name = $wpdb->prefix . 'booking_enkapsulasi';

    // Ambil daftar tanggal booking yang terisi pada bulan & tahun tersebut
    $results = $wpdb->get_results($wpdb->prepare(
        "SELECT tanggal_booking, COUNT(*) as total_count 
         FROM $table_name 
         WHERE YEAR(tanggal_booking) = %d AND MONTH(tanggal_booking) = %d AND status != 'rejected' AND status != 'cancelled'
         GROUP BY tanggal_booking",
        $year, $month
    ), ARRAY_A);

    $calendar_data = array();
    foreach ($results as $row) {
        $calendar_data[] = array(
            'date'  => $row['tanggal_booking'],
            'count' => intval($row['total_count']),
            // Jika booking per hari sudah >= 5, tandai slot penuh
            'isFull' => (intval($row['total_count']) >= 5)
        );
    }

    return new WP_REST_Response(array('data' => $calendar_data), 200);
}
```

---

## Langkah 4: Deploy & Menampilkan Formulir di Halaman WordPress

Setelah backend WordPress dan `.env` pada React di-subdomain telah terhubung, lakukan langkah berikut agar pengguna bisa mengaksesnya:

### Metode Terbaik: Menempelkan Modul Menggunakan Iframe
1. Buka halaman admin WordPress Anda.
2. Masuk menu **Pages (Halaman)** -> **Add New (Tambah Baru)**.
3. Beri judul halaman, misalnya: `Pendaftaran Enkapsulasi`.
4. Jika menggunakan editor bawaan WordPress (Gutenberg), klik ikon `+` (tambah blok) dan pilih **Custom HTML (HTML Kustom)**.
5. Tempel kode iframe ini di dalam blok tersebut:

```html
<iframe 
  src="https://booking.purwakartakab.go.id/booking-enkapsulasi" 
  width="100%" 
  height="900px" 
  style="border: none; width: 100%; min-height: 900px; overflow: hidden;"
  scrolling="no"
  id="booking-iframe">
</iframe>
```

6. Klik **Publish** (Terbitkan). 

**Selesai!** Formulir pendaftaran React Anda sekarang berjalan mandiri di subdomain baru, aman dari gangguan crash tema WordPress, namun datanya otomatis tersimpan rapi langsung di dalam database WordPress.
