// @ts-nocheck – File ini dijalankan di runtime Deno (Supabase Edge Function), bukan Node.js.
// TypeScript checker standar VS Code tidak mengenal Deno globals & ESM HTTP imports.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildLibraryEmailHtml, formatInfoGrid } from '../_shared/emailTemplates.ts';

// Daftar origin yang diizinkan memanggil edge function ini.
const ALLOWED_ORIGINS = [
  'https://lann.codes',
  'https://disipusda.purwakartakab.go.id',
  'http://localhost:5173',
];

const getCorsHeaders = (requestOrigin: string | null) => {
  const origin = requestOrigin || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
};

type BorrowRow = {
  id: string;
  bookId: string;
  memberId: string;
  memberName: string;
  bookTitle: string;
  tanggalPinjam: string;
  tanggalKembali: string;
  batasAmbil: string;
  status: 'menunggu_diambil' | 'dipinjam' | 'dikembalikan' | 'terlambat' | 'batal';
};

type MemberRow = {
  id: string;
  nama_lengkap: string | null;
  email: string | null;
};

type ReminderType = 'pickup_h1' | 'pickup_h_minus_3' | 'due_h2' | 'overdue_daily' | 'cancel_pickup_timeout';

const monthMap: Record<string, number> = {
  januari: 0,
  februari: 1,
  maret: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  agustus: 7,
  september: 8,
  oktober: 9,
  november: 10,
  desember: 11,
};

const toStartOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dayDiff = (left: Date, right: Date) => {
  const leftDay = toStartOfDay(left).getTime();
  const rightDay = toStartOfDay(right).getTime();
  return Math.round((leftDay - rightDay) / (24 * 60 * 60 * 1000));
};

const parseIndonesianDate = (value?: string) => {
  if (!value) return null;
  const base = value.split(',')[0].trim();
  const match = base.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = monthMap[match[2].toLowerCase()];
  const year = Number(match[3]);
  if (Number.isNaN(day) || month === undefined || Number.isNaN(year)) return null;

  return new Date(year, month, day);
};

/**
 * Parses "10 Mei 2026, 10:00" into a Date object.
 * We know the input string is always in WIB (UTC+7).
 */
const parseIndonesianDateTime = (value?: string) => {
  if (!value) return null;
  const parts = value.split(',');
  const datePart = parts[0].trim();
  const timePart = parts[1]?.trim();

  const match = datePart.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = monthMap[match[2].toLowerCase()];
  const year = Number(match[3]);

  if (Number.isNaN(day) || month === undefined || Number.isNaN(year)) return null;

  let hours = 0;
  let minutes = 0;
  if (timePart) {
    const timeMatch = timePart.match(/^(\d{1,2}):(\d{1,2})$/);
    if (timeMatch) {
      hours = Number(timeMatch[1]);
      minutes = Number(timeMatch[2]);
    }
  }

  // Construct UTC timestamp directly.
  // Input string is WIB (UTC+7), so we subtract 7 hours.
  return new Date(Date.UTC(year, month, day, hours - 7, minutes, 0));
};

const isAdminUser = async (supabaseAdmin: ReturnType<typeof createClient>, userId: string, userEmail?: string) => {
  const { data, error } = await supabaseAdmin.from('admins').select('id, email');
  if (error || !data) return false;

  const normalizedEmail = (userEmail || '').toLowerCase();
  return data.some((row: { id: string; email: string | null }) => {
    const rowEmail = String(row.email || '').toLowerCase();
    return row.id === userId || (normalizedEmail && rowEmail === normalizedEmail);
  });
};

const json = (status: number, body: Record<string, unknown>, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
  });

const sendResendEmail = async (params: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}) => {
  const response = await fetch('https://api.resend.com/emails', {
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

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((payload as { message?: string }).message || 'Gagal mengirim email lewat Resend.');
  }
};

const tryCreateLog = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  borrowId: string,
  memberId: string,
  notificationType: ReminderType,
  reason: string,
) => {
  const today = new Date().toISOString().slice(0, 10);
  const { error } = await supabaseAdmin.from('borrow_notification_logs').insert({
    borrow_id: borrowId,
    member_id: memberId,
    notification_type: notificationType,
    notification_date: today,
    reason,
  });

  if (!error) return true;
  if (error.code === '23505') return false;

  throw error;
};

const buildReminderEmail = (
  reminderType: ReminderType,
  payload: { memberName: string; bookTitle: string; batasAmbil: string; tanggalKembali: string },
) => {
  if (reminderType === 'pickup_h_minus_3') {
    return {
      subject: `Segera Ambil Buku: ${payload.bookTitle} (Batas waktu hampir berakhir)`,
      html: buildLibraryEmailHtml({
        preheader: 'Batas waktu pengambilan buku Anda hampir berakhir.',
        title: 'Pengingat Pengambilan (3 Jam Lagi)',
        subtitle: 'Buku Anda akan dibatalkan otomatis jika tidak diambil segera.',
        memberName: payload.memberName,
        tone: 'danger',
        contentHtml: `
          <p style="margin:0 0 12px 0;font-size:14px;line-height:1.7;color:#374151;">
            Kami mengingatkan bahwa batas waktu pengambilan buku Anda tinggal <strong>3 jam lagi</strong>.
          </p>
          ${formatInfoGrid([
            { label: 'Judul Buku', value: payload.bookTitle },
            { label: 'Batas Waktu', value: payload.batasAmbil },
          ])}
          <p style="margin:12px 0 0 0;font-size:13px;line-height:1.7;color:#7a1b16;">
            Mohon segera datang ke perpustakaan untuk melakukan pengambilan.
          </p>
        `,
      }),
    };
  }

    if (reminderType === 'pickup_h1') {
    return {
      subject: `Pengingat Pengambilan Buku: ${payload.bookTitle}`,
      html: buildLibraryEmailHtml({
        preheader: 'Buku Anda belum diambil sejak kemarin.',
        title: 'Pengingat Pengambilan Buku (H+1)',
        subtitle: 'Mohon lakukan pengambilan sebelum batas waktu berakhir.',
        memberName: payload.memberName,
        tone: 'warning',
        contentHtml: `
          <p style="margin:0 0 12px 0;font-size:14px;line-height:1.7;color:#374151;">
            Kami melihat buku yang Anda pinjam belum diambil hingga H+1 sejak tanggal peminjaman.
          </p>
          ${formatInfoGrid([
            { label: 'Judul Buku', value: payload.bookTitle },
            { label: 'Batas Ambil', value: payload.batasAmbil },
          ])}
          <p style="margin:12px 0 0 0;font-size:13px;line-height:1.7;color:#7a4a10;">
            Silakan segera ambil buku untuk menghindari pembatalan otomatis.
          </p>
        `,
      }),
    };
  }

  if (reminderType === 'due_h2') {
    return {
      subject: `Pengingat Jatuh Tempo: ${payload.bookTitle}`,
      html: buildLibraryEmailHtml({
        preheader: 'Masa pinjam akan berakhir dalam 2 hari.',
        title: 'Pengingat Pengembalian (H-2)',
        subtitle: 'Masa pinjam Anda mendekati batas waktu pengembalian.',
        memberName: payload.memberName,
        tone: 'warning',
        contentHtml: `
          <p style="margin:0 0 12px 0;font-size:14px;line-height:1.7;color:#374151;">
            Mohon siapkan pengembalian buku agar terhindar dari status keterlambatan.
          </p>
          ${formatInfoGrid([
            { label: 'Judul Buku', value: payload.bookTitle },
            { label: 'Jatuh Tempo', value: payload.tanggalKembali },
          ])}
          <p style="margin:12px 0 0 0;font-size:13px;line-height:1.7;color:#7a4a10;">
            Pengingat ini dikirim otomatis saat H-2 sebelum jatuh tempo.
          </p>
        `,
      }),
    };
  }

  if (reminderType === 'cancel_pickup_timeout') {
    return {
      subject: `Peminjaman Dibatalkan: ${payload.bookTitle}`,
      html: buildLibraryEmailHtml({
        preheader: 'Peminjaman buku dibatalkan karena melewati batas waktu.',
        title: 'Peminjaman Otomatis Dibatalkan',
        subtitle: 'Buku belum diambil hingga melewati batas waktu.',
        memberName: payload.memberName,
        tone: 'danger',
        contentHtml: `
          <p style="margin:0 0 12px 0;font-size:14px;line-height:1.7;color:#374151;">
            Mohon maaf, peminjaman buku Anda telah dibatalkan otomatis karena tidak diambil hingga melewati batas waktu.
          </p>
          ${formatInfoGrid([
            { label: 'Judul Buku', value: payload.bookTitle },
            { label: 'Batas Waktu', value: payload.batasAmbil },
          ])}
          <p style="margin:12px 0 0 0;font-size:13px;line-height:1.7;color:#7a1b16;">
            Buku sekarang kembali tersedia untuk dipinjam oleh anggota lain.
          </p>
        `,
      }),
    };
  }

  return {
    subject: `Peminjaman Terlambat: ${payload.bookTitle}`,
    html: buildLibraryEmailHtml({
      preheader: 'Buku Anda melewati tanggal jatuh tempo.',
      title: 'Pengingat Keterlambatan Pengembalian',
      subtitle: 'Data peminjaman Anda terdeteksi melewati jatuh tempo.',
      memberName: payload.memberName,
      tone: 'danger',
      contentHtml: `
        <p style="margin:0 0 12px 0;font-size:14px;line-height:1.7;color:#374151;">
          Mohon segera mengembalikan buku yang sudah lewat jatuh tempo.
        </p>
        ${formatInfoGrid([
          { label: 'Judul Buku', value: payload.bookTitle },
          { label: 'Jatuh Tempo', value: payload.tanggalKembali },
        ])}
        <p style="margin:12px 0 0 0;font-size:13px;line-height:1.7;color:#7a1b16;">
          Pengingat keterlambatan akan dikirim berkala sampai status pengembalian diperbarui.
        </p>
      `,
    }),
  };
};

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
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const resendFromEmail = Deno.env.get('RESEND_FROM_EMAIL');
  const cronSecret = Deno.env.get('CRON_SECRET');

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !resendFromEmail) {
    return json(500, {
      success: false,
      message: 'Environment variable belum lengkap (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, RESEND_FROM_EMAIL).',
    }, origin);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Authentication Logic: Allow CRON_SECRET OR Admin Session
  let isAuthorized = false;

  // 1. Check Cron Secret
  if (cronSecret) {
    const headerSecret = req.headers.get('x-cron-secret')?.trim();
    if (headerSecret && headerSecret === cronSecret.trim()) {
      isAuthorized = true;
    }
  }

  // 2. Check Admin Session (if not authorized by cron secret)
  if (!isAuthorized) {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    
    if (token) {
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (!userError && user) {
        const isAdmin = await isAdminUser(supabaseAdmin, user.id, user.email);
        if (isAdmin) isAuthorized = true;
      }
    }
  }

  // 3. Fallback for Local Testing (bypass if dev environment)
  // Disabled for production.
  // if (!isAuthorized && (origin?.includes('localhost') || origin?.includes('127.0.0.1'))) {
  //   console.warn(`[Auth] Bypassing auth for local testing from origin: ${origin}`);
  //   isAuthorized = true;
  // }

  if (!isAuthorized) {
    console.error(`[Auth] Unauthorized access attempt to reminder job. Origin: ${origin}`);
    return json(401, { success: false, message: 'Unauthorized: Harap gunakan Cron Secret atau Login Admin.' }, origin);
  }

  const { data: borrowsData, error: borrowsError } = await supabaseAdmin
    .from('borrows')
    .select('id, "bookId", "memberId", "memberName", "bookTitle", "tanggalPinjam", "tanggalKembali", "batasAmbil", status')
    .in('status', ['menunggu_diambil', 'dipinjam']);

  const borrows = (borrowsData as any[]) as BorrowRow[] | null;

  if (borrowsError) {
    return json(500, { success: false, message: `Gagal membaca data borrows: ${borrowsError.message}` }, origin);
  }

  if (!borrows || borrows.length === 0) {
    return json(200, { success: true, message: 'Tidak ada data peminjaman yang perlu dicek.', sent: 0 }, origin);
  }

  const memberIds = Array.from(new Set(borrows.map((row) => row.memberId).filter(Boolean)));
  const { data: membersData, error: memberError } = await supabaseAdmin
    .from('members')
    .select('id, nama_lengkap, email')
    .in('id', memberIds);

  const members = (membersData as any[]) as MemberRow[] | null;

  if (memberError) {
    return json(500, { success: false, message: `Gagal membaca data members: ${memberError.message}` }, origin);
  }

  const memberMap = new Map<string, MemberRow>((members || []).map((item) => [item.id, item]));

  const now = new Date();
  let sent = 0;
  let skipped = 0;
  const failures: Array<{ borrowId: string; reason: string }> = [];

  for (const borrow of borrows) {
    const member = memberMap.get(borrow.memberId);
    const memberEmail = member?.email || '';
    if (!memberEmail) {
      skipped += 1;
      continue;
    }

    const memberName = member?.nama_lengkap || borrow.memberName || 'Member';
    const borrowDate = parseIndonesianDateTime(borrow.tanggalPinjam);
    const dueDate = parseIndonesianDateTime(borrow.tanggalKembali);
    const deadlineDate = parseIndonesianDateTime(borrow.batasAmbil);

    let reminderType: ReminderType | null = null;
    let reason = '';

    // Logic: Menunggu Diambil
    if (borrow.status === 'menunggu_diambil') {
      // 1. Cek Deadline (Batas Ambil)
      if (deadlineDate) {
        const msToDeadline = deadlineDate.getTime() - now.getTime();
        const hoursToDeadline = msToDeadline / (1000 * 60 * 60);

        // Auto cancel if deadline has passed
        if (hoursToDeadline < 0) {
          reminderType = 'cancel_pickup_timeout';
          reason = 'Dibatalkan otomatis karena melewati batas ambil 1x24 jam';
          await supabaseAdmin.from('borrows').update({ status: 'batal' }).eq('id', borrow.id);
        } else if (hoursToDeadline > 0 && hoursToDeadline <= 3.5) {
          reminderType = 'pickup_h_minus_3';
          reason = '3 jam sebelum batas waktu pengambilan';
        }
      }

      // 2. Cek H+1 (fallback)
      if (!reminderType && borrowDate) {
        const daysFromBorrow = dayDiff(now, borrowDate);
        if (daysFromBorrow === 1) {
          reminderType = 'pickup_h1';
          reason = 'Belum diambil pada H+1 dari tanggal pinjam';
        }
      }
    }

    // Logic: Dipinjam
    if (!reminderType && borrow.status === 'dipinjam' && dueDate) {
      const daysToDue = dayDiff(dueDate, now);
      
      if (daysToDue === 2) {
        reminderType = 'due_h2';
        reason = 'H-2 sebelum jatuh tempo';
      } else if (daysToDue < 0) {
        // Update DB Status to terlambat if it wasn't already
        await supabaseAdmin.from('borrows').update({ status: 'terlambat' }).eq('id', borrow.id);
        
        // Reminder untuk keterlambatan, ingatkan setiap 3 hari
        const daysOverdue = Math.abs(daysToDue);
        if (daysOverdue % 3 === 0 || daysOverdue === 1) {
          reminderType = 'overdue_daily';
          reason = `Sudah melewati jatuh tempo (${daysOverdue} hari)`;
        }
      }
    }

    if (!reminderType) {
      skipped += 1;
      continue;
    }

    try {
      const logCreated = await tryCreateLog(supabaseAdmin, borrow.id, borrow.memberId, reminderType, reason);
      if (!logCreated) {
        skipped += 1;
        continue;
      }

      const email = buildReminderEmail(reminderType, {
        memberName,
        bookTitle: borrow.bookTitle,
        batasAmbil: borrow.batasAmbil,
        tanggalKembali: borrow.tanggalKembali,
      });

      await sendResendEmail({
        apiKey: resendApiKey,
        from: resendFromEmail,
        to: memberEmail,
        subject: email.subject,
        html: email.html,
      });

      sent += 1;
    } catch (err) {
      failures.push({
        borrowId: borrow.id,
        reason: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return json(200, {
    success: true,
    message: 'Job notifikasi harian selesai dijalankan.',
    sent,
    skipped,
    failures,
  }, origin);
});
