// @ts-nocheck – File ini dijalankan di runtime Deno (Supabase Edge Function), bukan Node.js.
// TypeScript checker standar VS Code tidak mengenal Deno globals & ESM HTTP imports.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildLibraryEmailHtml, formatInfoGrid } from '../_shared/emailTemplates.ts';

// Daftar origin yang diizinkan memanggil edge function ini.
const ALLOWED_ORIGINS = [
  'https://lann.codes',
  'https://disipusda.purwakartakab.go.id',
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

type ReminderType = 'pickup_6h' | 'due_h2' | 'overdue_daily';

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

// Mem-parse format "1 Mei 2026, 10:30" menjadi Date dengan komponen jam/menit.
// Digunakan untuk mengecek sisa waktu hingga batasAmbil secara presisi (dalam jam).
const parseIndonesianDateTime = (value?: string) => {
  if (!value) return null;
  const match = value.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4}),\s*(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = monthMap[match[2].toLowerCase()];
  const year = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  if (Number.isNaN(day) || month === undefined || Number.isNaN(year)) return null;

  return new Date(year, month, day, hour, minute);
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
  if (reminderType === 'pickup_6h') {
    return {
      subject: `Pengingat Pengambilan Buku: ${payload.bookTitle}`,
      html: buildLibraryEmailHtml({
        preheader: 'Kurang dari 6 jam lagi untuk mengambil buku Anda.',
        title: 'Pengingat Pengambilan Buku (6 Jam)',
        subtitle: 'Mohon lakukan pengambilan sebelum batas waktu berakhir.',
        memberName: payload.memberName,
        tone: 'warning',
        contentHtml: `
          <p style="margin:0 0 12px 0;font-size:14px;line-height:1.7;color:#374151;">
            Batas waktu pengambilan buku Anda kurang dari 6 jam lagi. Segera ambil untuk menghindari pembatalan otomatis.
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

  if (cronSecret) {
    const headerSecret = req.headers.get('x-cron-secret');
    if (headerSecret !== cronSecret) {
      return json(401, { success: false, message: 'Unauthorized cron request.' }, origin);
    }
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

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
    const borrowDate = parseIndonesianDate(borrow.tanggalPinjam);
    const dueDate = parseIndonesianDate(borrow.tanggalKembali);

    let reminderType: ReminderType | null = null;
    let reason = '';

    if (borrow.status === 'menunggu_diambil') {
      const pickupDeadline = parseIndonesianDateTime(borrow.batasAmbil);
      if (pickupDeadline) {
        const hoursUntilDeadline = (pickupDeadline.getTime() - now.getTime()) / (60 * 60 * 1000);
        // Kirim reminder jika sisa waktu pengambilan antara 0 hingga 6 jam.
        if (hoursUntilDeadline > 0 && hoursUntilDeadline <= 6) {
          reminderType = 'pickup_6h';
          reason = `Batas ambil dalam ${Math.ceil(hoursUntilDeadline)} jam lagi (${borrow.batasAmbil})`;
        }
      }
    }

    if (!reminderType && borrow.status === 'dipinjam' && dueDate) {
      const daysToDue = dayDiff(dueDate, now);
      if (daysToDue === 2) {
        reminderType = 'due_h2';
        reason = 'H-2 sebelum jatuh tempo';
      } else if (daysToDue < 0) {
        reminderType = 'overdue_daily';
        reason = 'Sudah melewati jatuh tempo';
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
