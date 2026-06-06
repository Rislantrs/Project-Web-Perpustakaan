// @ts-nocheck – Deno runtime (Supabase Edge Function), bukan Node.js.
// Dijalankan saat status booking berubah. Mengirim email sesuai status baru.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildEmailWrapper, buildBookingDetailsTable } from 'shared/emailTemplates.ts';

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = [
  'https://lann.codes',
  'https://disipusda.purwakartakab.go.id',
  'http://localhost:5173',
];

const getCorsHeaders = (requestOrigin: string | null) => {
  const origin = ALLOWED_ORIGINS.includes(requestOrigin || '')
    ? requestOrigin!
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
};

const json = (status: number, body: Record<string, unknown>, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
  });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatDateId = (raw: string | null | undefined): string => {
  if (!raw) return '-';
  try {
    return new Date(raw).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return String(raw);
  }
};

const sendResendEmail = async (params: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<void> => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (payload as { message?: string }).message || 'Gagal mengirim email lewat Resend.',
    );
  }
};

// ---------------------------------------------------------------------------
// Email template builders per status
// ---------------------------------------------------------------------------

const buildApprovedEmail = (booking: Record<string, unknown>): string => {
  const shortId = String(booking.id || '').slice(0, 8);
  const tanggal = formatDateId(booking.tanggal_booking as string);

  const content = `
    <div style="text-align:center;margin-bottom:22px;">
      <span style="font-size:36px;">✅</span>
      <h2 style="margin:8px 0 4px 0;font-size:22px;font-weight:800;color:#166534;">Booking Disetujui!</h2>
      <p style="margin:0;font-size:13px;color:#4ade80;">Ref #${shortId}</p>
    </div>

    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.8;color:#374151;">
      Yth. <strong>${String(booking.nama_lengkap || '')}</strong>,
    </p>
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.8;color:#374151;">
      Permohonan booking layanan <strong>Enkapsulasi Arsip</strong> Anda telah
      <strong style="color:#166534;">DISETUJUI</strong> oleh petugas Disipusda Purwakarta.
      Harap hadir sesuai jadwal yang telah dikonfirmasi.
    </p>

    ${buildBookingDetailsTable(booking)}

    <!-- Highlighted attendance box -->
    <div style="margin:20px 0;padding:18px 20px;background:#f0fdf4;border-radius:10px;border:2px solid #86efac;">
      <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#166534;">
        📅 Jadwal &amp; Instruksi Kehadiran
      </p>
      <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#15803d;">${tanggal}</p>
      <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.9;color:#374151;">
        <li>Hadir <strong>30 menit sebelum</strong> waktu pelayanan dimulai.</li>
        <li>Bawa <strong>dokumen asli</strong> yang akan dienkapsulasi.</li>
        <li>Sertakan <strong>fotokopi</strong> setiap dokumen (1 lembar per arsip).</li>
        <li>Menunjukkan email konfirmasi ini kepada petugas di loket.</li>
        <li>Pakaian rapi dan sopan sesuai ketentuan perkantoran pemerintah.</li>
      </ul>
    </div>

    <p style="margin:16px 0 0 0;font-size:13px;line-height:1.8;color:#6b7280;">
      Ada pertanyaan? Hubungi kami:<br/>
      📞 <strong>(0264) 200-023</strong> &nbsp;|&nbsp; ✉ <strong>disipusda@purwakartakab.go.id</strong>
    </p>
  `;

  return buildEmailWrapper(
    content,
    '#166534',
    `Booking Anda (ref #${shortId}) telah disetujui. Hadir ${tanggal}.`,
    'Booking Layanan Enkapsulasi Arsip Disetujui',
  );
};

const buildRejectedEmail = (booking: Record<string, unknown>, note?: string): string => {
  const shortId = String(booking.id || '').slice(0, 8);
  const siteUrl = Deno.env.get('SITE_URL') || 'https://disipusda.purwakartakab.go.id';

  const content = `
    <div style="text-align:center;margin-bottom:22px;">
      <span style="font-size:36px;">❌</span>
      <h2 style="margin:8px 0 4px 0;font-size:22px;font-weight:800;color:#374151;">Permohonan Tidak Dapat Diproses</h2>
      <p style="margin:0;font-size:13px;color:#9ca3af;">Ref #${shortId}</p>
    </div>

    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.8;color:#374151;">
      Yth. <strong>${String(booking.nama_lengkap || '')}</strong>,
    </p>
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.8;color:#374151;">
      Dengan hormat, kami menyampaikan bahwa permohonan booking layanan Enkapsulasi Arsip
      Anda dengan nomor referensi <strong>#${shortId}</strong> tidak dapat kami proses
      pada saat ini. Kami mohon maaf atas ketidaknyamanan ini.
    </p>

    ${
      note
        ? `
    <div style="margin:16px 0;padding:16px 18px;background:#f9fafb;border-radius:10px;border-left:4px solid #9ca3af;">
      <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Keterangan dari Petugas</p>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#374151;">${note}</p>
    </div>`
        : ''
    }

    ${buildBookingDetailsTable(booking)}

    <div style="margin:20px 0;padding:16px 18px;background:#fef9ec;border-radius:10px;border:1px solid #fcd34d;">
      <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:#92400e;">💡 Langkah Selanjutnya</p>
      <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.9;color:#374151;">
        <li>Hubungi kami untuk mendapatkan penjelasan lebih lanjut.</li>
        <li>Ajukan permohonan baru dengan memilih tanggal lain yang tersedia.</li>
        <li>Pastikan semua dokumen telah sesuai persyaratan layanan.</li>
      </ul>
    </div>

    <div style="text-align:center;margin-top:20px;">
      <a href="${siteUrl}/booking-enkapsulasi" style="display:inline-block;padding:12px 28px;background:#1e3a5f;color:#ffffff;font-size:13px;font-weight:700;border-radius:8px;text-decoration:none;">
        Ajukan Permohonan Baru
      </a>
    </div>

    <p style="margin:20px 0 0 0;font-size:13px;line-height:1.8;color:#6b7280;">
      Hubungi kami: 📞 <strong>(0264) 200-023</strong> &nbsp;|&nbsp; ✉ <strong>disipusda@purwakartakab.go.id</strong>
    </p>
  `;

  return buildEmailWrapper(
    content,
    '#4b5563',
    `Permohonan booking Anda (ref #${shortId}) tidak dapat diproses saat ini.`,
    'Permohonan Booking Tidak Dapat Diproses',
  );
};

const buildRescheduledEmail = (
  booking: Record<string, unknown>,
  note: string | undefined,
  siteUrl: string,
): string => {
  const shortId = String(booking.id || '').slice(0, 8);
  const currentDate = formatDateId(booking.tanggal_booking as string);
  const newDate = formatDateId(booking.reschedule_date as string);
  const rescheduleNote = note || booking.reschedule_note as string || '-';
  const token = booking.reschedule_token as string || '';

  const acceptUrl = `${siteUrl}/booking-enkapsulasi/konfirmasi-reschedule?token=${token}&action=accept`;
  const declineUrl = `${siteUrl}/booking-enkapsulasi/konfirmasi-reschedule?token=${token}&action=decline`;

  const content = `
    <div style="text-align:center;margin-bottom:22px;">
      <span style="font-size:36px;">📅</span>
      <h2 style="margin:8px 0 4px 0;font-size:22px;font-weight:800;color:#6d28d9;">Usulan Jadwal Baru</h2>
      <p style="margin:0;font-size:13px;color:#a78bfa;">Ref #${shortId}</p>
    </div>

    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.8;color:#374151;">
      Yth. <strong>${String(booking.nama_lengkap || '')}</strong>,
    </p>
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.8;color:#374151;">
      Admin Disipusda Purwakarta mengusulkan <strong>perubahan jadwal</strong> untuk
      booking layanan Enkapsulasi Arsip Anda. Silakan tinjau usulan di bawah ini dan
      berikan respons Anda.
    </p>

    <!-- Date comparison -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
      style="margin:16px 0;border-collapse:separate;border-spacing:0 0;">
      <tr>
        <td style="width:48%;padding:14px 16px;background:#fef2f2;border-radius:10px;border:1px solid #fecaca;text-align:center;vertical-align:top;">
          <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#ef4444;text-transform:uppercase;letter-spacing:.08em;">Tanggal Sebelumnya</p>
          <p style="margin:0;font-size:13px;font-weight:600;color:#374151;">${currentDate}</p>
        </td>
        <td style="width:4%;text-align:center;vertical-align:middle;font-size:18px;color:#6b7280;">→</td>
        <td style="width:48%;padding:14px 16px;background:#f0fdf4;border-radius:10px;border:1px solid #86efac;text-align:center;vertical-align:top;">
          <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:.08em;">Tanggal Usulan Baru</p>
          <p style="margin:0;font-size:13px;font-weight:700;color:#15803d;">${newDate}</p>
        </td>
      </tr>
    </table>

    ${
      rescheduleNote && rescheduleNote !== '-'
        ? `
    <div style="margin:16px 0;padding:14px 16px;background:#faf5ff;border-radius:10px;border-left:4px solid #a855f7;">
      <p style="margin:0 0 4px 0;font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:.06em;">Alasan Admin</p>
      <p style="margin:0;font-size:13px;line-height:1.7;color:#374151;">${rescheduleNote}</p>
    </div>`
        : ''
    }

    <!-- CTA Buttons -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;">
      <tr>
        <td style="text-align:center;">
          <a href="${acceptUrl}"
            style="display:inline-block;margin:0 6px 10px 6px;padding:13px 26px;background:#16a34a;color:#ffffff;font-size:13px;font-weight:700;border-radius:8px;text-decoration:none;">
            ✅ Setujui Tanggal Baru
          </a>
          <a href="${declineUrl}"
            style="display:inline-block;margin:0 6px 10px 6px;padding:13px 26px;background:#dc2626;color:#ffffff;font-size:13px;font-weight:700;border-radius:8px;text-decoration:none;">
            ❌ Tolak
          </a>
        </td>
      </tr>
    </table>

    <div style="padding:12px 16px;background:#fff7ed;border-radius:8px;border:1px solid #fed7aa;">
      <p style="margin:0;font-size:12px;color:#c2410c;">
        ⚠️ <strong>Penting:</strong> Tautan di atas akan kadaluarsa dalam
        <strong>48 jam</strong>. Jika tidak ada respons, permohonan akan ditandai
        sebagai tidak aktif.
      </p>
    </div>

    <p style="margin:16px 0 0 0;font-size:13px;line-height:1.8;color:#6b7280;">
      Ada pertanyaan? Hubungi kami:<br/>
      📞 <strong>(0264) 200-023</strong> &nbsp;|&nbsp; ✉ <strong>disipusda@purwakartakab.go.id</strong>
    </p>
  `;

  return buildEmailWrapper(
    content,
    '#6d28d9',
    `Admin mengusulkan tanggal baru ${newDate} untuk booking Anda (ref #${shortId}).`,
    'Usulan Jadwal Baru dari Admin',
  );
};

const buildCancelledEmail = (booking: Record<string, unknown>, note?: string): string => {
  const shortId = String(booking.id || '').slice(0, 8);
  const siteUrl = Deno.env.get('SITE_URL') || 'https://disipusda.purwakartakab.go.id';

  const content = `
    <div style="text-align:center;margin-bottom:22px;">
      <span style="font-size:36px;">🚫</span>
      <h2 style="margin:8px 0 4px 0;font-size:22px;font-weight:800;color:#374151;">Booking Telah Dibatalkan</h2>
      <p style="margin:0;font-size:13px;color:#9ca3af;">Ref #${shortId}</p>
    </div>

    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.8;color:#374151;">
      Yth. <strong>${String(booking.nama_lengkap || '')}</strong>,
    </p>
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.8;color:#374151;">
      Dengan ini kami memberitahukan bahwa booking layanan Enkapsulasi Arsip Anda
      dengan nomor referensi <strong>#${shortId}</strong> telah dibatalkan.
    </p>

    ${
      note
        ? `
    <div style="margin:16px 0;padding:14px 16px;background:#f9fafb;border-radius:10px;border-left:4px solid #9ca3af;">
      <p style="margin:0 0 4px 0;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Keterangan</p>
      <p style="margin:0;font-size:13px;line-height:1.7;color:#374151;">${note}</p>
    </div>`
        : ''
    }

    ${buildBookingDetailsTable(booking)}

    <div style="text-align:center;margin-top:22px;">
      <a href="${siteUrl}/booking-enkapsulasi"
        style="display:inline-block;padding:12px 28px;background:#1e3a5f;color:#ffffff;font-size:13px;font-weight:700;border-radius:8px;text-decoration:none;">
        Buat Booking Baru
      </a>
    </div>

    <p style="margin:20px 0 0 0;font-size:13px;line-height:1.8;color:#6b7280;">
      Hubungi kami: 📞 <strong>(0264) 200-023</strong> &nbsp;|&nbsp; ✉ <strong>disipusda@purwakartakab.go.id</strong>
    </p>
  `;

  return buildEmailWrapper(
    content,
    '#4b5563',
    `Booking Anda (ref #${shortId}) telah dibatalkan.`,
    'Booking Layanan Enkapsulasi Arsip Dibatalkan',
  );
};

const buildCompletedEmail = (booking: Record<string, unknown>): string => {
  const shortId = String(booking.id || '').slice(0, 8);
  const tanggal = formatDateId(booking.tanggal_booking as string);

  const content = `
    <div style="text-align:center;margin-bottom:22px;">
      <span style="font-size:36px;">✔️</span>
      <h2 style="margin:8px 0 4px 0;font-size:22px;font-weight:800;color:#1e40af;">Layanan Selesai — Terima Kasih!</h2>
      <p style="margin:0;font-size:13px;color:#93c5fd;">Ref #${shortId}</p>
    </div>

    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.8;color:#374151;">
      Yth. <strong>${String(booking.nama_lengkap || '')}</strong>,
    </p>
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.8;color:#374151;">
      Layanan <strong>Enkapsulasi Arsip</strong> Anda telah selesai dilaksanakan.
      Kami mengucapkan terima kasih atas kepercayaan Anda menggunakan layanan Disipusda Purwakarta.
      Dokumen Anda kini telah tersimpan dengan baik dan terlindungi untuk jangka panjang.
    </p>

    <!-- Summary -->
    <div style="margin:16px 0;padding:16px 18px;background:#eff6ff;border-radius:10px;border:1px solid #bfdbfe;">
      <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:#1e40af;">📋 Ringkasan Layanan</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-size:13px;color:#6b7280;padding:4px 0;width:40%;">Jenis Layanan</td>
          <td style="font-size:13px;color:#1a202c;font-weight:600;padding:4px 0;">${String(booking.jenis_layanan || '-')}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#6b7280;padding:4px 0;">Jumlah Arsip</td>
          <td style="font-size:13px;color:#1a202c;font-weight:600;padding:4px 0;">${booking.jumlah_dokumen ?? '-'} arsip</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#6b7280;padding:4px 0;">Tanggal Pelayanan</td>
          <td style="font-size:13px;color:#1a202c;font-weight:600;padding:4px 0;">${tanggal}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#6b7280;padding:4px 0;">Status</td>
          <td style="font-size:13px;padding:4px 0;">
            <span style="padding:3px 12px;background:#dcfce7;color:#166534;font-size:12px;font-weight:700;border-radius:99px;">✅ Selesai</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Feedback request -->
    <div style="margin:20px 0;padding:16px 18px;background:#faf5ff;border-radius:10px;border:1px solid #e9d5ff;">
      <p style="margin:0 0 6px 0;font-size:13px;font-weight:700;color:#7c3aed;">💬 Bagikan Pendapat Anda</p>
      <p style="margin:0;font-size:13px;line-height:1.8;color:#374151;">
        Kepuasan Anda adalah prioritas kami. Silakan sampaikan masukan atau saran
        melalui email kami di
        <a href="mailto:disipusda@purwakartakab.go.id" style="color:#7c3aed;font-weight:600;">disipusda@purwakartakab.go.id</a>
        atau datang langsung ke kantor kami.
      </p>
    </div>

    <p style="margin:16px 0 0 0;font-size:13px;line-height:1.8;color:#6b7280;">
      Terima kasih telah mempercayakan pengelolaan arsip Anda kepada kami.<br/>
      Semoga dokumen Anda terjaga dengan baik. 🏛️
    </p>
  `;

  return buildEmailWrapper(
    content,
    '#1e40af',
    `Layanan enkapsulasi arsip Anda (ref #${shortId}) telah selesai. Terima kasih!`,
    'Layanan Enkapsulasi Arsip Selesai',
  );
};

// ---------------------------------------------------------------------------
// Email subject map
// ---------------------------------------------------------------------------
const STATUS_SUBJECTS: Record<string, string> = {
  approved: '✅ Booking Layanan Enkapsulasi Arsip Disetujui',
  rejected: '❌ Permohonan Tidak Dapat Diproses',
  rescheduled: '📅 Usulan Jadwal Baru dari Admin',
  cancelled: '🚫 Booking Anda Telah Dibatalkan',
  completed: '✔ Layanan Enkapsulasi Arsip Selesai — Terima Kasih',
};

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(origin) });
  }

  if (req.method !== 'POST') {
    return json(405, { success: false, message: 'Method not allowed.' }, origin);
  }

  // --- env ---
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const emailDomain = Deno.env.get('EMAIL_DOMAIN') || 'lann.codes';
  const siteUrl = Deno.env.get('SITE_URL') || 'https://lann.codes';
  const resendFromEmail = Deno.env.get('RESEND_FROM_EMAIL');

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return json(500, { success: false, message: 'Environment variables belum lengkap.' }, origin);
  }

  // --- parse body ---
  const body = await req.json().catch(() => ({})) as {
    booking_id?: string;
    status?: string;
    note?: string;
  };

  const bookingId = String(body.booking_id || '').trim();
  const status = String(body.status || '').trim().toLowerCase();
  const note = body.note ? String(body.note).trim() : undefined;

  if (!bookingId) {
    return json(400, { success: false, message: 'booking_id wajib diisi.' }, origin);
  }

  const validStatuses = ['approved', 'rejected', 'rescheduled', 'cancelled', 'completed'];
  if (!status || !validStatuses.includes(status)) {
    return json(400, {
      success: false,
      message: `status tidak valid. Harus salah satu dari: ${validStatuses.join(', ')}`,
    }, origin);
  }

  // --- init supabase ---
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // --- fetch booking ---
  const { data: bookingData, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (bookingError || !bookingData) {
    return json(404, { success: false, message: 'Booking tidak ditemukan.' }, origin);
  }

  const booking = bookingData as Record<string, unknown>;
  const recipientEmail = String(booking.email || '');

  if (!recipientEmail) {
    return json(422, { success: false, message: 'Email pemohon tidak ditemukan di data booking.' }, origin);
  }

  // --- build email HTML ---
  let html: string;
  switch (status) {
    case 'approved':
      html = buildApprovedEmail(booking);
      break;
    case 'rejected':
      html = buildRejectedEmail(booking, note);
      break;
    case 'rescheduled':
      html = buildRescheduledEmail(booking, note, siteUrl);
      break;
    case 'cancelled':
      html = buildCancelledEmail(booking, note);
      break;
    case 'completed':
      html = buildCompletedEmail(booking);
      break;
    default:
      return json(400, { success: false, message: 'Status tidak dikenali.' }, origin);
  }

  // --- send email ---
  try {
    await sendResendEmail({
      apiKey: resendApiKey,
      from: resendFromEmail || `Disipusda Purwakarta <noreply@${emailDomain}>`,
      to: recipientEmail,
      subject: STATUS_SUBJECTS[status],
      html,
    });
  } catch (err) {
    return json(500, {
      success: false,
      message: `Gagal mengirim email: ${(err as Error).message}`,
    }, origin);
  }

  /*
  // [Rencana Masa Depan] Kirim WhatsApp Status Change ke Pemohon
  // Panduan lengkap implementasi silakan lihat di: docs/panduan_integrasi_whatsapp.md
  try {
    const waNumber = String(booking.whatsapp || '');
    const waToken = Deno.env.get('WA_GATEWAY_TOKEN');
    if (waNumber && waToken) {
      // Panggil fungsi kirim WhatsApp di sini (misal ke Fonnte/Wablas API)
    }
  } catch (waErr) {
    console.warn('Gagal mengirim WhatsApp:', waErr);
  }
  */

  return json(200, {
    success: true,
    message: `Email notifikasi status "${status}" berhasil dikirim.`,
    data: { booking_id: bookingId, status, email: recipientEmail },
  }, origin);
});
