# 🚀 Email Notification Setup Guide

> ⚠️ **CATATAN KEAMANAN**: File ini tidak boleh berisi nilai secrets yang asli.  
> Semua kunci API harus diset langsung di **Supabase Dashboard → Settings → Secrets**.

## Step 1️⃣: Set Supabase Secrets via Dashboard

Karena Supabase CLI belum installed, gunakan Dashboard:

### Buka Settings > Secrets
```
Dashboard URL: https://supabase.com/dashboard/project/<project-id>/settings/api
```

### Add 3 Secrets (klik "New Secret" untuk setiap baris)

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | *(dapatkan dari https://resend.com/api-keys)* |
| `RESEND_FROM_EMAIL` | `Disipusda <no-reply@lann.codes>` |
| `CRON_SECRET` | *(generate dengan `openssl rand -base64 32`)* |

**Klik "Save" setelah setiap secret**

---

## Step 2️⃣: Deploy Edge Functions

Terminal command (pastikan di root project):

```bash
supabase functions deploy send-borrow-notification
supabase functions deploy send-borrow-reminders
```

**Output yang diharapkan:**
```
✓ Function deployed successfully
✓ Available at: https://[project-ref].supabase.co/functions/v1/send-borrow-notification
```

---

## Step 3️⃣: Setup Database Migration

Di Supabase SQL Editor, jalankan script:
```sql
-- File: supabase/migrations/20260428_borrow-notification-logs.sql
-- Copy seluruh isi file dan paste di SQL Editor
```

**Verifikasi tabel terbuat:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'borrow_notification_logs';
```

---

## Step 4️⃣: Schedule Cron Job (PILIH SALAH SATU)

### **Option A: Via Supabase Dashboard (Recommended)**
1. Buka Dashboard → Database → Webhooks (atau Scheduler jika tersedia)
2. Create new scheduled function
3. **URL:** `https://[project-ref].supabase.co/functions/v1/send-borrow-reminders`
4. **Method:** POST
5. **Schedule:** `0 1 * * *` (setiap hari jam 1 AM UTC)
6. **Headers:**
   ```
   x-cron-secret: <nilai CRON_SECRET yang sudah kamu set di Secrets>
   ```

### **Option B: Via EasyCron (External)**
1. Buka https://www.easycron.com/
2. Create new cron job:
   - **URL:** `https://[project-ref].supabase.co/functions/v1/send-borrow-reminders`
   - **Method:** POST
   - **Cron Expression:** `0 1 * * *`
   - **Headers:** 
     ```json
     {
       "x-cron-secret": "<nilai CRON_SECRET yang sudah kamu set di Secrets>"
     }
     ```

---

## Step 5️⃣: Test Email Notifications

### Test Instant Notification (Manual)
```bash
# Di Terminal/Postman:
curl -X POST \
  https://[project-ref].supabase.co/functions/v1/send-borrow-notification \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "borrowId": "BR-[borrow-id-dari-database]"
  }'
```

### Test Daily Reminders (Manual)
```bash
curl -X POST \
  https://[project-ref].supabase.co/functions/v1/send-borrow-reminders \
  -H "Content-Type: application/json" \
  -H "x-cron-secret: <nilai CRON_SECRET dari Supabase Secrets>" \
  -d '{}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Job notifikasi harian selesai dijalankan.",
  "sent": 2,
  "skipped": 0,
  "failures": []
}
```

---

## 📋 Checklist Implementasi

- [ ] 3 Secrets sudah set di Supabase Dashboard (BUKAN di file ini)
- [ ] Edge Functions sudah di-deploy
- [ ] Migration `borrow_notification_logs` sudah dijalankan
- [ ] Cron job sudah dijadwalkan
- [ ] Test instant email notification (saat member pinjam buku)
- [ ] Test daily reminder job
- [ ] Verifikasi email diterima di inbox member

---

## 🔍 Troubleshooting

| Error | Solusi |
|-------|--------|
| `RESEND_API_KEY not found` | Verifikasi secrets sudah tersimpan di Dashboard |
| `403 Forbidden on cron call` | Pastikan `x-cron-secret` header matching dengan value di Dashboard |
| `Email tidak terkirim` | Check Resend email verification di https://resend.com/emails |
| `401 Unauthorized` | JWT token expired, pastikan user login terlebih dahulu |
| `CORS error` | Pastikan request berasal dari `lann.codes` atau `disipusda.purwakartakab.go.id` |

---

## 📧 Contoh Email yang Akan Dikirim

### 1. Konfirmasi Peminjaman (Instan saat borrow)
```
Subject: Konfirmasi Peminjaman: [Judul Buku]
To: [email member]

Konten: Nama Member, Judul Buku, Batas Ambil (1x24 jam)
```

### 2. Pengingat H+1 (Jika belum diambil)
```
Subject: Pengingat Pengambilan Buku: [Judul Buku]
To: [email member]

Konten: Reminder dengan warna kuning (warning tone)
```

### 3. Pengingat H-2 (Jatuh Tempo)
```
Subject: Pengingat Jatuh Tempo: [Judul Buku]
To: [email member]

Konten: Reminder dengan warna kuning sebelum deadline
```

### 4. Pengingat Overdue (Jika sudah lewat)
```
Subject: Peminjaman Terlambat: [Judul Buku]
To: [email member]

Konten: Reminder dengan warna merah (danger tone)
```

---

**Selesai! 🎉 System email notification sudah siap production.**
