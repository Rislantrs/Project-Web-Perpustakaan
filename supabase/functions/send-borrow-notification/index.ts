import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildLibraryEmailHtml, formatInfoGrid } from '../_shared/emailTemplates.ts';

// Daftar origin yang diizinkan memanggil edge function ini.
// Tambahkan origin baru di sini jika domain berubah.
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
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  status: string;
};

type MemberRow = {
  id: string;
  nama_lengkap: string | null;
  email: string | null;
};

const json = (status: number, body: Record<string, unknown>, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
  });

const isAdminUser = async (supabaseAdmin: ReturnType<typeof createClient>, userId: string, userEmail?: string) => {
  const { data, error } = await supabaseAdmin.from('admins').select('id, email, role');
  if (error || !data) return false;

  const normalizedEmail = (userEmail || '').toLowerCase();
  return data.some((row) => {
    const rowEmail = String(row.email || '').toLowerCase();
    return row.id === userId || (normalizedEmail && rowEmail === normalizedEmail);
  });
};

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

  return payload;
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

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !resendFromEmail) {
    return json(500, {
      success: false,
      message: 'Environment variable belum lengkap (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, RESEND_FROM_EMAIL).',
    }, origin);
  }

  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) {
    return json(401, { success: false, message: 'Unauthorized: token tidak ditemukan.' }, origin);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return json(401, { success: false, message: 'Unauthorized: sesi tidak valid.' }, origin);
  }

  const body = await req.json().catch(() => ({}));
  const borrowId = String((body as { borrowId?: string }).borrowId || '').trim();
  if (!borrowId) {
    return json(400, { success: false, message: 'borrowId wajib diisi.' }, origin);
  }

  const { data: borrowData, error: borrowError } = await supabaseAdmin
    .from('borrows')
    .select('id, "bookId", "memberId", "memberName", "bookTitle", "tanggalPinjam", "tanggalKembali", "batasAmbil", status')
    .eq('id', borrowId)
    .single();

  const borrow = borrowData as BorrowRow | null;

  if (borrowError || !borrow) {
    return json(404, { success: false, message: 'Data peminjaman tidak ditemukan.' }, origin);
  }

  const adminAccess = await isAdminUser(supabaseAdmin, user.id, user.email || undefined);
  const isOwner = user.id === borrow.memberId;
  if (!isOwner && !adminAccess) {
    return json(403, { success: false, message: 'Forbidden: tidak boleh mengirim notifikasi untuk data ini.' }, origin);
  }

  const { data: memberData, error: memberError } = await supabaseAdmin
    .from('members')
    .select('id, nama_lengkap, email')
    .eq('id', borrow.memberId)
    .single();

  const member = memberData as MemberRow | null;

  if (memberError || !member?.email) {
    return json(404, { success: false, message: 'Email member tidak ditemukan.' }, origin);
  }

  const memberName = member.nama_lengkap || borrow.memberName || 'Member';
  const html = buildLibraryEmailHtml({
    preheader: `Peminjaman ${borrow.bookTitle} berhasil diproses.`,
    title: 'Konfirmasi Peminjaman Buku',
    subtitle: 'Silakan ambil buku sebelum batas waktu pengambilan berakhir.',
    memberName,
    tone: 'info',
    contentHtml: `
      <p style="margin:0 0 12px 0;font-size:14px;line-height:1.7;color:#374151;">
        Permintaan peminjaman Anda sudah berhasil dicatat dalam sistem perpustakaan.
      </p>
      ${formatInfoGrid([
        { label: 'Nama Member', value: memberName },
        { label: 'Judul Buku', value: borrow.bookTitle },
        { label: 'Batas Ambil', value: borrow.batasAmbil },
      ])}
      <p style="margin:12px 0 0 0;font-size:13px;line-height:1.7;color:#4b5563;">
        Jika buku belum diambil sampai batas waktu, sistem akan membatalkan peminjaman secara otomatis.
      </p>
    `,
  });

  await sendResendEmail({
    apiKey: resendApiKey,
    from: resendFromEmail,
    to: member.email,
    subject: `Konfirmasi Peminjaman: ${borrow.bookTitle}`,
    html,
  });

  return json(200, {
    success: true,
    message: 'Email konfirmasi peminjaman berhasil dikirim.',
    data: { borrowId, email: member.email },
  }, origin);
});
