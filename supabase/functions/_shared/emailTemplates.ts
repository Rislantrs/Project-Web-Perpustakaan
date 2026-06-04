// @ts-nocheck – Deno runtime, bukan Node.js.

// ============================================================
// Existing Library Email Template (preserved)
// ============================================================

export type EmailTone = 'info' | 'warning' | 'danger';

const toneMap: Record<EmailTone, { accent: string; soft: string; text: string }> = {
  info: { accent: '#0c2f3d', soft: '#e8eff2', text: '#0c2f3d' },
  warning: { accent: '#b7791f', soft: '#fff7e6', text: '#7a4a10' },
  danger: { accent: '#b42318', soft: '#fff1f3', text: '#7a1b16' },
};

export const buildLibraryEmailHtml = (params: {
  preheader: string;
  title: string;
  subtitle: string;
  memberName: string;
  contentHtml: string;
  tone?: EmailTone;
}) => {
  const palette = toneMap[params.tone || 'info'];

  return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${params.title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f6f8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${params.preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;background:#f3f6f8;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(12,47,61,0.08);">
            <tr>
              <td style="padding:22px 28px;background:linear-gradient(135deg,#0c2f3d 0%,#1a4254 60%,#8b1c24 100%);color:#ffffff;">
                <p style="margin:0 0 6px 0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;opacity:.85;">Disipusda Purwakarta</p>
                <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:700;">${params.title}</h1>
                <p style="margin:8px 0 0 0;font-size:14px;line-height:1.6;color:#d8e3ea;">${params.subtitle}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 28px 12px 28px;">
                <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:#1f2937;">Yth. <strong>${params.memberName}</strong>,</p>
                ${params.contentHtml}
                <div style="margin-top:22px;padding:14px 16px;background:${palette.soft};border-left:4px solid ${palette.accent};border-radius:10px;">
                  <p style="margin:0;font-size:13px;line-height:1.7;color:${palette.text};">
                    Jika Anda membutuhkan bantuan, silakan hubungi petugas perpustakaan melalui kanal resmi Disipusda Purwakarta.
                  </p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 24px 28px;border-top:1px solid #eef2f4;">
                <p style="margin:0;font-size:12px;line-height:1.7;color:#6b7280;">
                  Email ini dikirim otomatis oleh sistem perpustakaan digital.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export const formatInfoGrid = (rows: Array<{ label: string; value: string }>) => {
  const body = rows
    .map(
      (row) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eef2f4;width:42%;font-size:13px;color:#6b7280;">${row.label}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eef2f4;font-size:13px;color:#111827;font-weight:600;">${row.value}</td>
      </tr>`,
    )
    .join('');

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:10px 0 2px 0;border:1px solid #eef2f4;border-radius:12px;overflow:hidden;background:#ffffff;">${body}</table>`;
};

// ============================================================
// Booking Email Template Helpers
// ============================================================

/**
 * Wraps content in a professional government-style email shell.
 * @param content     Inner HTML content string
 * @param headerColor Hex colour for the header background (default: #1e3a5f navy blue)
 * @param preheader   Short preview text hidden in email clients
 * @param title       Title shown in <title> and header
 */
export const buildEmailWrapper = (
  content: string,
  headerColor = '#1e3a5f',
  preheader = '',
  title = 'Notifikasi Layanan — Disipusda Purwakarta',
): string => `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a202c;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;background:#f0f4f8;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,58,95,0.10);">

            <!-- HEADER -->
            <tr>
              <td style="padding:0;background:${headerColor};">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:28px 32px 24px 32px;">
                      <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:rgba(255,255,255,0.70);">Pemerintah Kabupaten Purwakarta</p>
                      <h1 style="margin:0 0 2px 0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-.3px;">DISIPUSDA PURWAKARTA</h1>
                      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.60);">Dinas Kearsipan dan Perpustakaan Daerah</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:30px 32px 24px 32px;">
                ${content}
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:18px 32px 26px 32px;background:#f8fafc;border-top:1px solid #e8edf2;">
                <p style="margin:0 0 6px 0;font-size:12px;font-weight:600;color:#374151;">Disipusda Purwakarta</p>
                <p style="margin:0;font-size:11px;line-height:1.8;color:#6b7280;">
                  Jl. Gandanegara No.25, Purwakarta, Jawa Barat 41115<br/>
                  📞 (0264) 200-023 &nbsp;|&nbsp; ✉ disipusda@purwakartakab.go.id<br/>
                  🌐 disipusda.purwakartakab.go.id
                </p>
                <p style="margin:14px 0 0 0;font-size:10px;color:#9ca3af;">
                  Email ini dikirim secara otomatis oleh sistem. Mohon tidak membalas email ini langsung.<br/>
                  &copy; ${new Date().getFullYear()} Disipusda Purwakarta — Semua Hak Dilindungi.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

/**
 * Renders a styled HTML table of booking details.
 * Accepts a plain Booking-like object and formats fields that are present.
 */
export const buildBookingDetailsTable = (booking: Record<string, unknown>): string => {
  const formatDate = (raw: unknown): string => {
    if (!raw) return '-';
    try {
      return new Date(String(raw)).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return String(raw);
    }
  };

  const rows: Array<{ label: string; value: string }> = [
    { label: 'Nama Lengkap', value: String(booking.nama_lengkap || '-') },
    { label: 'Email', value: String(booking.email || '-') },
    { label: 'WhatsApp', value: String(booking.whatsapp || '-') },
    { label: 'Instansi / Lembaga', value: String(booking.instansi || '-') },
    { label: 'Jenis Layanan', value: String(booking.jenis_layanan || '-') },
    { label: 'Jumlah Dokumen', value: `${booking.jumlah_dokumen ?? '-'} arsip` },
    { label: 'Tanggal Booking', value: formatDate(booking.tanggal_booking) },
    { label: 'Catatan', value: String(booking.catatan || '-') },
  ];

  const rowsHtml = rows
    .map(
      (r, i) => `
    <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="padding:10px 14px;font-size:13px;color:#6b7280;border-bottom:1px solid #edf2f7;width:44%;vertical-align:top;">${r.label}</td>
      <td style="padding:10px 14px;font-size:13px;color:#1a202c;font-weight:600;border-bottom:1px solid #edf2f7;">${r.value}</td>
    </tr>`,
    )
    .join('');

  return `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
    style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:16px 0;">
    <tr style="background:#eef2f7;">
      <td colspan="2" style="padding:10px 14px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#4a5568;">
        Detail Booking
      </td>
    </tr>
    ${rowsHtml}
  </table>`;
};
