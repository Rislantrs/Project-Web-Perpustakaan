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
