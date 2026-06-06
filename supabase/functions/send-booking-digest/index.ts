// @ts-nocheck – Deno runtime (Supabase Edge Function)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
};

const json = (status: number, body: Record<string, unknown>, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
  });

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

/** Escape special MarkdownV2 characters for Telegram. */
const escMd = (text: string): string =>
  String(text || '-').replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(origin) });
  }

  if (req.method !== 'POST') {
    return json(405, { success: false, message: 'Method not allowed.' }, origin);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const cronSecret = Deno.env.get('CRON_SECRET');
  const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const adminChatId = Deno.env.get('TELEGRAM_ADMIN_CHAT_ID');

  if (!supabaseUrl || !serviceRoleKey || !telegramToken || !adminChatId) {
    return json(500, {
      success: false,
      message: 'Environment variables belum lengkap di Edge Function.',
    }, origin);
  }

  // --- Auth check ---
  let isAuthorized = false;
  
  if (cronSecret) {
    const headerSecret = req.headers.get('x-cron-secret')?.trim();
    if (headerSecret && headerSecret === cronSecret.trim()) {
      isAuthorized = true;
    }
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (!isAuthorized) {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (token) {
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (!userError && user) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile && (profile.role === 'admin' || profile.role === 'superadmin')) {
          isAuthorized = true;
        }
      }
    }
  }

  if (!isAuthorized) {
    return json(401, { success: false, message: 'Unauthorized.' }, origin);
  }

  // --- Main Logic: Get Today's Date in Asia/Jakarta ---
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayJakartaYMD = formatter.format(new Date());

  // Format date for long Indonesian format
  const dateFormatted = escMd(new Date(todayJakartaYMD).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }));

  // Query today's approved bookings
  const { data: bookings, error: bookingsError } = await supabaseAdmin
    .from('bookings')
    .select('nama_lengkap, jumlah_dokumen, jenis_layanan')
    .eq('tanggal_booking', todayJakartaYMD)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  if (bookingsError) {
    return json(500, { success: false, message: 'Gagal mengambil data booking dari database.', error: bookingsError.message }, origin);
  }

  // Query pending bookings count
  const { count: pendingCount, error: pendingError } = await supabaseAdmin
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const pendingText = (!pendingError && pendingCount && pendingCount > 0)
    ? `\n⚠️ *Terdapat ${pendingCount} permohonan baru* yang menunggu persetujuan Anda di dashboard\\.`
    : '';

  // Construct message
  let message = '';
  if (bookings && bookings.length > 0) {
    const totalDocs = bookings.reduce((sum: number, b: any) => sum + (b.jumlah_dokumen || 0), 0);
    const listSchedules = bookings.map((b: any, index: number) => {
      const idxEsc = escMd(String(index + 1));
      const namaEsc = escMd(b.nama_lengkap);
      const docsEsc = escMd(String(b.jumlah_dokumen));
      const layananEsc = escMd(b.jenis_layanan);
      return `${idxEsc}\\. *${namaEsc}* \\(${docsEsc} arsip \\- ${layananEsc}\\)`;
    }).join('\n');

    message = [
      `🔔 *RINGKASAN JADWAL HARIAN*`,
      `📅 *${dateFormatted}*`,
      ``,
      `Halo Admin, hari ini terdapat *${bookings.length}* jadwal pelayanan Enkapsulasi:`,
      listSchedules,
      ``,
      `Total dokumen yang akan diproses: *${totalDocs} arsip*\\.`,
      pendingText,
      ``,
      `Semangat bertugas\\! 💪`
    ].join('\n');
  } else {
    message = [
      `🔔 *RINGKASAN JADWAL HARIAN*`,
      `📅 *${dateFormatted}*`,
      ``,
      `Halo Admin, tidak ada jadwal pelayanan Enkapsulasi hari ini\\.`,
      pendingText,
      ``,
      `Semoga hari Anda menyenangkan\\! 😊`
    ].join('\n');
  }

  // Send message to Telegram admin chat
  const tgRes = await tgPost(telegramToken, 'sendMessage', {
    chat_id: adminChatId,
    text: message,
    parse_mode: 'MarkdownV2',
  });

  return json(200, {
    success: true,
    message: 'Daily digest sent successfully.',
    date: todayJakartaYMD,
    schedules_count: bookings?.length || 0,
    telegram_response: tgRes,
  }, origin);
});
