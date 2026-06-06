// @ts-nocheck – Deno runtime (Supabase Edge Function), bukan Node.js.
// Webhook untuk Telegram Bot — menangani callback_data dari inline keyboard.
// Register URL ini ke Telegram via:
//   POST https://api.telegram.org/bot{TOKEN}/setWebhook
//     { url: "{SUPABASE_FUNCTIONS_URL}/telegram-webhook",
//       secret_token: "{TELEGRAM_WEBHOOK_SECRET}" }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
}

interface TelegramMessage {
  message_id: number;
  chat: { id: number; type: string };
  text?: string;
}

interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

interface TelegramUpdate {
  update_id: number;
  callback_query?: TelegramCallbackQuery;
  message?: TelegramMessage & { from?: TelegramUser };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const tgPost = async (
  token: string,
  method: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> => {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json().catch(() => ({}));
};

/** Answer a callback query so Telegram stops the loading spinner. */
const answerCallback = (
  token: string,
  callbackQueryId: string,
  text: string,
  showAlert = false,
) =>
  tgPost(token, 'answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  });

/** Remove inline keyboard buttons from the original message. */
const removeButtons = (
  token: string,
  chatId: number,
  messageId: number,
) =>
  tgPost(token, 'editMessageReplyMarkup', {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: { inline_keyboard: [] },
  });

/** Send a plain text message to a Telegram chat. */
const sendMessage = (
  token: string,
  chatId: number,
  text: string,
  parseMode: 'MarkdownV2' | 'HTML' | '' = 'HTML',
) =>
  tgPost(token, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: parseMode || undefined,
  });

/** Escape MarkdownV2 special characters. */
const escMd = (text: string): string =>
  text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');

/** Call the booking-status-change edge function to trigger email. */
const triggerStatusChange = async (
  supabaseFunctionsUrl: string,
  serviceRoleKey: string,
  bookingId: string,
  status: string,
  note?: string,
): Promise<void> => {
  await fetch(`${supabaseFunctionsUrl}/booking-status-change`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ booking_id: bookingId, status, note }),
  }).catch(() => undefined);
};

// ---------------------------------------------------------------------------
// Booking action handlers
// ---------------------------------------------------------------------------
const handleApprove = async (
  bookingId: string,
  supabase: ReturnType<typeof createClient>,
  token: string,
  callbackQuery: TelegramCallbackQuery,
  supabaseFunctionsUrl: string,
  serviceRoleKey: string,
  siteUrl: string,
): Promise<void> => {
  // 1. Update booking status in DB
  const { data: booking, error } = await supabase
    .from('bookings')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select('nama_lengkap, tanggal_booking, email')
    .single();

  if (error || !booking) {
    await answerCallback(token, callbackQuery.id, '⚠️ Gagal: booking tidak ditemukan.', true);
    return;
  }

  // 2. Answer callback & remove buttons
  await Promise.all([
    answerCallback(token, callbackQuery.id, '✅ Booking telah disetujui!'),
    callbackQuery.message
      ? removeButtons(token, callbackQuery.message.chat.id, callbackQuery.message.message_id)
      : Promise.resolve(),
  ]);

  // 3. Send confirmation message in chat
  const nama = escMd(String(booking.nama_lengkap || bookingId));
  const tanggal = escMd(
    new Date(booking.tanggal_booking).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  );

  if (callbackQuery.message) {
    await sendMessage(
      token,
      callbackQuery.message.chat.id,
      [
        `✅ <b>BOOKING DISETUJUI</b>`,
        ``,
        `👤 Nama: <b>${String(booking.nama_lengkap || bookingId)}</b>`,
        `📅 Tanggal: <b>${new Date(booking.tanggal_booking).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</b>`,
        `📧 Email: ${String(booking.email || '-')}`,
        ``,
        `📨 Email konfirmasi telah dikirim ke pemohon.`,
        `🔗 <a href="${siteUrl}/admin/bookings">Lihat Dashboard</a>`,
      ].join('\n'),
      'HTML',
    );
  }

  // 4. Trigger email notification
  await triggerStatusChange(supabaseFunctionsUrl, serviceRoleKey, bookingId, 'approved');
};

const handleReject = async (
  bookingId: string,
  supabase: ReturnType<typeof createClient>,
  token: string,
  callbackQuery: TelegramCallbackQuery,
  supabaseFunctionsUrl: string,
  serviceRoleKey: string,
): Promise<void> => {
  const defaultNote = 'Ditolak via Telegram oleh admin.';

  // 1. Update booking status
  const { data: booking, error } = await supabase
    .from('bookings')
    .update({
      status: 'rejected',
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select('nama_lengkap, email')
    .single();

  if (error || !booking) {
    await answerCallback(token, callbackQuery.id, '⚠️ Gagal: booking tidak ditemukan.', true);
    return;
  }

  // 2. Answer callback & remove buttons
  await Promise.all([
    answerCallback(token, callbackQuery.id, '❌ Booking telah ditolak.'),
    callbackQuery.message
      ? removeButtons(token, callbackQuery.message.chat.id, callbackQuery.message.message_id)
      : Promise.resolve(),
  ]);

  // 3. Notify in chat
  if (callbackQuery.message) {
    await sendMessage(
      token,
      callbackQuery.message.chat.id,
      [
        `❌ <b>BOOKING DITOLAK</b>`,
        ``,
        `👤 Nama: <b>${String(booking.nama_lengkap || bookingId)}</b>`,
        `📧 Email: ${String(booking.email || '-')}`,
        ``,
        `📝 Keterangan: ${defaultNote}`,
        `📨 Email notifikasi telah dikirim ke pemohon.`,
        ``,
        `<i>💡 Untuk penolakan dengan alasan kustom, gunakan dashboard admin.</i>`,
      ].join('\n'),
      'HTML',
    );
  }

  // 4. Trigger email
  await triggerStatusChange(
    supabaseFunctionsUrl,
    serviceRoleKey,
    bookingId,
    'rejected',
    defaultNote,
  );
};

const handleReschedule = async (
  bookingId: string,
  token: string,
  callbackQuery: TelegramCallbackQuery,
  siteUrl: string,
): Promise<void> => {
  // Jadwal ulang tidak bisa dilakukan sepenuhnya via bot karena butuh input tanggal baru.
  // Arahkan admin ke dashboard.
  await answerCallback(
    token,
    callbackQuery.id,
    '📅 Gunakan dashboard admin untuk menjadwal ulang.',
    true,
  );

  if (callbackQuery.message) {
    await sendMessage(
      token,
      callbackQuery.message.chat.id,
      [
        `📅 <b>JADWAL ULANG</b>`,
        ``,
        `Untuk mengusulkan jadwal baru, silakan gunakan dashboard admin:`,
        `🔗 <a href="${siteUrl}/admin/bookings">${siteUrl}/admin/bookings</a>`,
        ``,
        `<i>ID Booking: ${bookingId.slice(0, 8)}</i>`,
      ].join('\n'),
      'HTML',
    );
  }
};

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const adminChatId = Deno.env.get('TELEGRAM_ADMIN_CHAT_ID');

  // We need to clone the request because we might parse the JSON body in both the try and catch blocks
  const reqClone = req.clone();

  try {
    // Only accept POST from Telegram
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const webhookSecret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const siteUrl = Deno.env.get('SITE_URL') || 'https://lann.codes';

    if (!telegramToken || !supabaseUrl || !serviceRoleKey) {
      console.error('Missing env vars: TELEGRAM_BOT_TOKEN | SUPABASE_URL | SUPABASE_SERVICE_ROLE_KEY');
      return new Response('Internal configuration error', { status: 500 });
    }

    // --- verify secret token ---
    if (webhookSecret) {
      const providedSecret = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
      if (providedSecret !== webhookSecret) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    // --- parse update ---
    const update = await req.json().catch(() => null) as TelegramUpdate | null;
    if (!update) {
      return new Response('Bad Request: invalid JSON', { status: 400 });
    }

    // Build supabase functions URL from SUPABASE_URL
    const supabaseFunctionsUrl = `${supabaseUrl}/functions/v1`;

    // --- init supabase admin client ---
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // --- handle callback_query ---
    if (update.callback_query) {
      const cq = update.callback_query;
      const data = cq.data || '';

      const approveMatch = data.match(/^approve_(.+)$/);
      const rejectMatch = data.match(/^reject_(.+)$/);
      const rescheduleMatch = data.match(/^reschedule_(.+)$/);

      if (approveMatch) {
        const bookingId = approveMatch[1];
        await handleApprove(
          bookingId,
          supabase,
          telegramToken,
          cq,
          supabaseFunctionsUrl,
          serviceRoleKey,
          siteUrl,
        );
      } else if (rejectMatch) {
        const bookingId = rejectMatch[1];
        await handleReject(bookingId, supabase, telegramToken, cq, supabaseFunctionsUrl, serviceRoleKey);
      } else if (rescheduleMatch) {
        const bookingId = rescheduleMatch[1];
        await handleReschedule(bookingId, telegramToken, cq, siteUrl);
      } else {
        await answerCallback(telegramToken, cq.id, '⚠️ Aksi tidak dikenal.');
      }

      return new Response('OK', { status: 200 });
    }

    // --- handle regular messages ---
    if (update.message?.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text.trim();

      // Security check: Only respond to the configured admin
      if (String(chatId) !== String(adminChatId)) {
        await sendMessage(
          telegramToken,
          chatId,
          '🔒 <b>Akses Ditolak:</b> Anda bukan administrator yang terdaftar.',
          'HTML',
        );
        return new Response('OK', { status: 200 });
      }

      if (text === '/start' || text === '/help') {
        await sendMessage(
          telegramToken,
          chatId,
          [
            `🤖 <b>Bot Disipusda Purwakarta</b>`,
            ``,
            `Perintah Bot Admin:`,
            `• /hari_ini - Menampilkan daftar kunjungan hari ini`,
            `• /cari [nama/ID] - Mencari data booking`,
            `• /statistik - Statistik booking bulan ini`,
            `• /status - Cek status keaktifan bot`,
            `• /help - Tampilkan panduan ini`,
            ``,
            `🔗 <a href="${siteUrl}/admin/bookings">Buka Dashboard Admin</a>`,
          ].join('\n'),
          'HTML',
        );
      } else if (text === '/status') {
        await sendMessage(
          telegramToken,
          chatId,
          '✅ Bot aktif dan berjalan dengan normal.',
          'HTML',
        );
      } else if (text === '/hari_ini') {
        const formatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Jakarta',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        const todayJakartaYMD = formatter.format(new Date());

        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('nama_lengkap, jumlah_dokumen, jenis_layanan, status')
          .eq('tanggal_booking', todayJakartaYMD)
          .order('created_at', { ascending: true });

        if (error || !bookings) {
          await sendMessage(telegramToken, chatId, '⚠️ Gagal memuat data dari database.', 'HTML');
        } else if (bookings.length === 0) {
          await sendMessage(
            telegramToken,
            chatId,
            `📅 <b>Jadwal Hari Ini:</b>\nTidak ada jadwal pelayanan enkapsulasi hari ini.`,
            'HTML'
          );
        } else {
          const listSchedules = bookings.map((b: any, index: number) => {
            const statusIcon = b.status === 'approved' ? '✅' : b.status === 'pending' ? '⏳' : '•';
            return `${index + 1}. ${statusIcon} <b>${b.nama_lengkap}</b> (${b.jumlah_dokumen} arsip - ${b.jenis_layanan})`;
          }).join('\n');
          
          await sendMessage(
            telegramToken,
            chatId,
            `📅 <b>Jadwal Hari Ini:</b>\n\n${listSchedules}\n\n🔗 <a href="${siteUrl}/admin/bookings">Buka Dashboard</a>`,
            'HTML'
          );
        }
      } else if (text.startsWith('/cari')) {
        const query = text.slice(5).trim();
        if (!query) {
          await sendMessage(
            telegramToken,
            chatId,
            'ℹ️ <b>Format Salah:</b> Gunakan perintah <code>/cari [Nama, WA, atau ID]</code>.',
            'HTML'
          );
        } else {
          let selectQuery = supabase.from('bookings').select('id, nama_lengkap, jumlah_dokumen, tanggal_booking, status');
          
          if (query.length === 8 && /^[0-9a-fA-F]{8}$/.test(query)) {
            selectQuery = selectQuery.or(`id.like.${query.toLowerCase()}%,nama_lengkap.ilike.%${query}%,email.ilike.%${query}%`);
          } else {
            selectQuery = selectQuery.or(`nama_lengkap.ilike.%${query}%,email.ilike.%${query}%,whatsapp.ilike.%${query}%`);
          }
          
          const { data: results, error } = await selectQuery.limit(5);
          
          if (error || !results) {
            await sendMessage(telegramToken, chatId, '⚠️ Gagal mencari data.', 'HTML');
          } else if (results.length === 0) {
            await sendMessage(
              telegramToken,
              chatId,
              `🔍 <b>Hasil Pencarian untuk "${query}":</b>\nTidak ada data booking yang cocok.`,
              'HTML'
            );
          } else {
            const listResults = results.map((b: any) => {
              const shortId = b.id.slice(0, 8);
              const tanggal = new Date(b.tanggal_booking).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
              const statusMap: Record<string, string> = {
                pending: '⏳ Pending',
                approved: '✅ Disetujui',
                rejected: '❌ Ditolak',
                rescheduled: '📅 Reschedule',
                cancelled: '🚫 Batal',
                completed: '✔️ Selesai',
              };
              return `• <b>#${shortId}</b> - <b>${b.nama_lengkap}</b>\n  Tanggal: ${tanggal} | ${b.jumlah_dokumen} arsip\n  Status: ${statusMap[b.status] || b.status}`;
            }).join('\n\n');
            
            await sendMessage(
              telegramToken,
              chatId,
              `🔍 <b>Hasil Pencarian untuk "${query}":</b>\n\n${listResults}`,
              'HTML'
            );
          }
        }
      } else if (text === '/statistik') {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        
        const { data: stats, error } = await supabase
          .from('bookings')
          .select('status')
          .gte('tanggal_booking', firstDayOfMonth);
          
        if (error || !stats) {
          await sendMessage(telegramToken, chatId, '⚠️ Gagal mengambil statistik.', 'HTML');
        } else {
          const counts = {
            pending: 0,
            approved: 0,
            rejected: 0,
            rescheduled: 0,
            cancelled: 0,
            completed: 0,
          };
          
          stats.forEach((b: any) => {
            if (b.status in counts) {
              counts[b.status as keyof typeof counts]++;
            }
          });
          
          const total = stats.length;
          const monthName = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
          
          await sendMessage(
            telegramToken,
            chatId,
            [
              `📊 <b>Statistik Booking - ${monthName}</b>`,
              `━━━━━━━━━━━━━━━━━━━━`,
              `⏳ Pending       : <b>${counts.pending}</b>`,
              `✅ Disetujui     : <b>${counts.approved}</b>`,
              `📅 Rescheduled   : <b>${counts.rescheduled}</b>`,
              `✔️ Selesai       : <b>${counts.completed}</b>`,
              `❌ Ditolak       : <b>${counts.rejected}</b>`,
              `🚫 Dibatalkan    : <b>${counts.cancelled}</b>`,
              `━━━━━━━━━━━━━━━━━━━━`,
              `📈 Total Booking : <b>${total}</b>`,
            ].join('\n'),
            'HTML'
          );
        }
      }
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    
    // Send error details to admin Telegram
    if (telegramToken && adminChatId) {
      const errMsg = err instanceof Error ? err.stack || err.message : String(err);
      await sendMessage(
        telegramToken,
        Number(adminChatId),
        `⚠️ <b>Webhook Error:</b>\n<pre>${escMd(errMsg)}</pre>`,
        'HTML',
      ).catch((e) => console.error('Failed to notify admin of error:', e));
    }

    // Always attempt to answer the callback query to clear the spinner
    try {
      const update = await reqClone.json().catch(() => null) as TelegramUpdate | null;
      if (update?.callback_query && telegramToken) {
        await answerCallback(telegramToken, update.callback_query.id, '⚠️ Gagal memproses permintaan (internal error).', true).catch(() => undefined);
      }
    } catch (e) {
      console.error('Failed to answer callback query in catch block:', e);
    }

    return new Response('Internal Server Error', { status: 500 });
  }
});
