// @ts-nocheck – Deno runtime (Supabase Edge Function), bukan Node.js.
// Dijalankan saat booking baru dibuat. Paralel:
//   (A) Kirim notifikasi Telegram ke admin
//   (B) Kirim email konfirmasi ke pemohon

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const json = (status: number, body: Record<string, unknown>, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
  });

/** Escape special MarkdownV2 characters for Telegram. */
const escMd = (text: string): string =>
  text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');

/** Format YYYY-MM-DD → Indonesian long date string. */
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
    return raw;
  }
};

// ---------------------------------------------------------------------------
// Telegram helpers
// ---------------------------------------------------------------------------
const tgPost = async (
  token: string,
  method: string,
  payload: Record<string, unknown>,
): Promise<unknown> => {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json().catch(() => ({}));
};

const buildTelegramMessage = (booking: Record<string, unknown>): string => {
  const shortId = String(booking.id || '').slice(0, 8);
  const tanggal = formatDateId(booking.tanggal_booking as string);

  return [
    `📋 *BOOKING BARU — Enkapsulasi Arsip*`,
    `\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-`,
    `👤 *Nama*     : ${escMd(String(booking.nama_lengkap || '-'))}`,
    `📱 *WhatsApp* : ${escMd(String(booking.whatsapp || '-'))}`,
    `📧 *Email*    : ${escMd(String(booking.email || '-'))}`,
    `🏢 *Instansi* : ${escMd(String(booking.instansi || '-'))}`,
    `📄 *Layanan*  : ${escMd(String(booking.jenis_layanan || '-'))}`,
    `📦 *Dokumen*  : ${escMd(String(booking.jumlah_dokumen ?? '-'))} arsip`,
    `📅 *Tanggal*  : ${escMd(tanggal)}`,
    `📝 *Catatan*  : ${escMd(String(booking.catatan || '-'))}`,
    `\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-`,
    `🔖 ID: \`${escMd(shortId)}\``,
  ].join('\n');
};

// ---------------------------------------------------------------------------
// Email helpers (Resend)
// ---------------------------------------------------------------------------
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
    const msg = (payload as { message?: string }).message || 'Gagal mengirim email lewat Resend.';
    throw new Error(msg);
  }
};

const buildConfirmationEmail = (booking: Record<string, unknown>): string => {
  const shortId = String(booking.id || '').slice(0, 8);
  const tanggal = formatDateId(booking.tanggal_booking as string);

  const content = `
    <h2 style="margin:0 0 6px 0;font-size:20px;font-weight:700;color:#1e3a5f;">
      Permohonan Anda Telah Diterima
    </h2>
    <p style="margin:0 0 20px 0;font-size:13px;color:#64748b;">
      Referensi Booking: <strong>#${shortId}</strong>
    </p>

    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.8;color:#374151;">
      Yth. <strong>${String(booking.nama_lengkap || '')}</strong>,
    </p>
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.8;color:#374151;">
      Permohonan booking layanan <strong>Enkapsulasi Arsip</strong> Anda telah berhasil diterima
      oleh sistem kami dan sedang menunggu konfirmasi dari petugas Disipusda Purwakarta.
    </p>

    ${buildBookingDetailsTable(booking)}

    <!-- Status badge -->
    <div style="text-align:center;margin:22px 0;">
      <span style="display:inline-block;padding:8px 22px;background:#fef3c7;color:#92400e;font-size:13px;font-weight:700;border-radius:99px;border:1.5px solid #f59e0b;letter-spacing:.05em;text-transform:uppercase;">
        ⏳ Menunggu Konfirmasi
      </span>
    </div>

    <!-- Next steps -->
    <div style="margin:20px 0;padding:18px 20px;background:#f0f7ff;border-radius:10px;border:1px solid #bfdbfe;">
      <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#1e40af;">Langkah Selanjutnya:</p>
      <ol style="margin:0;padding-left:18px;font-size:13px;line-height:1.9;color:#374151;">
        <li>Petugas kami akan meninjau permohonan Anda dalam 1×24 jam kerja.</li>
        <li>Notifikasi persetujuan atau perubahan jadwal akan dikirim ke email ini.</li>
        <li>Setelah disetujui, hadir tepat waktu sesuai tanggal yang dikonfirmasi.</li>
        <li>Bawa dokumen asli beserta fotokopinya pada hari kunjungan.</li>
      </ol>
    </div>

    <p style="margin:16px 0 0 0;font-size:13px;line-height:1.8;color:#6b7280;">
      Untuk pertanyaan lebih lanjut, silakan menghubungi kami melalui:<br/>
      📞 <strong>(0264) 200-023</strong> &nbsp;|&nbsp; ✉ <strong>disipusda@purwakartakab.go.id</strong>
    </p>
  `;

  return buildEmailWrapper(
    content,
    '#1e3a5f',
    `Booking enkapsulasi arsip Anda (ref #${shortId}) telah diterima dan sedang diproses.`,
    'Permohonan Layanan Enkapsulasi Arsip Diterima',
  );
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
  const resendFromEmail = Deno.env.get('RESEND_FROM_EMAIL');
  const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const adminChatId = Deno.env.get('TELEGRAM_ADMIN_CHAT_ID');
  const siteUrl = Deno.env.get('SITE_URL') || 'https://lann.codes';
  const emailDomain = Deno.env.get('EMAIL_DOMAIN') || 'lann.codes';

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !telegramToken || !adminChatId) {
    return json(500, {
      success: false,
      message: 'Environment variables belum lengkap.',
    }, origin);
  }

  // --- parse body ---
  const body = await req.json().catch(() => ({}));
  const bookingId = String((body as { booking_id?: string }).booking_id || '').trim();
  if (!bookingId) {
    return json(400, { success: false, message: 'booking_id wajib diisi.' }, origin);
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

  // --- run Telegram + Email in parallel ---
  const results = await Promise.allSettled([
    // (A) Telegram notification to admin
    (async () => {
      const text = buildTelegramMessage(booking);
      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: '✅ Setujui', callback_data: `approve_${booking.id}` },
            { text: '❌ Tolak', callback_data: `reject_${booking.id}` },
          ],
          [
            { text: '📅 Jadwal Ulang', callback_data: `reschedule_${booking.id}` },
            { text: '🔍 Lihat Detail', url: `${siteUrl}/admin/bookings` },
          ],
        ],
      };

      await tgPost(telegramToken, 'sendMessage', {
        chat_id: adminChatId,
        text,
        parse_mode: 'MarkdownV2',
        reply_markup: inlineKeyboard,
      });
    })(),

    // (B) Confirmation email to applicant
    (async () => {
      const email = String(booking.email || '');
      if (!email) throw new Error('Email pemohon tidak ditemukan di data booking.');

      const html = buildConfirmationEmail(booking);
      await sendResendEmail({
        apiKey: resendApiKey,
        from: resendFromEmail || `Disipusda Purwakarta <noreply@${emailDomain}>`,
        to: email,
        subject: '📋 Permohonan Layanan Enkapsulasi Arsip Diterima',
        html,
      });
    })(),

    /*
    // (C) [Rencana Masa Depan] Kirim WhatsApp ke Pemohon
    // Panduan lengkap implementasi silakan lihat di: docs/panduan_integrasi_whatsapp.md
    (async () => {
      const waNumber = String(booking.whatsapp || '');
      if (!waNumber) return;
      
      // Kirim HTTP POST ke API WhatsApp Gateway pilihan Anda (misal Fonnte/Wablas)
      // const waToken = Deno.env.get('WA_GATEWAY_TOKEN');
      // await sendWhatsAppNotification(waNumber, 'Pesan booking diterima...', waToken);
    })(),
    */
  ]);

  const telegramResult = results[0];
  const emailResult = results[1];

  const errors: string[] = [];
  if (telegramResult.status === 'rejected') {
    errors.push(`Telegram: ${(telegramResult as PromiseRejectedResult).reason}`);
  }
  if (emailResult.status === 'rejected') {
    errors.push(`Email: ${(emailResult as PromiseRejectedResult).reason}`);
  }

  if (errors.length === 2) {
    return json(500, {
      success: false,
      message: 'Gagal mengirim notifikasi Telegram dan email.',
      errors,
    }, origin);
  }

  return json(200, {
    success: true,
    message: 'Notifikasi booking berhasil dikirim.',
    data: {
      booking_id: bookingId,
      telegram: telegramResult.status === 'fulfilled' ? 'sent' : 'failed',
      email: emailResult.status === 'fulfilled' ? 'sent' : 'failed',
      errors: errors.length > 0 ? errors : undefined,
    },
  }, origin);
});
