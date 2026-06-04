/**
 * ============================================================================
 * BookingConfirmation.tsx — Halaman Konfirmasi Booking Berhasil
 * ============================================================================
 */

import { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  User,
  Mail,
  Phone,
  Building2,
  FileStack,
  Files,
  Calendar,
  MessageSquare,
  Home,
  Clipboard,
} from 'lucide-react';
import { BK_COLORS, BK_FONTS, BK_RADIUS, BK_SHADOW, BK_STATUS_COLORS, getStatusColor } from '../constants/designTokens';
import { BOOKING_STATUS_CONFIG } from '../constants/bookingStatus';
import type { Booking } from '../types/booking.types';

// ─── Props ────────────────────────────────────────────────────────────────────
interface BookingConfirmationProps {
  booking: Booking;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const HARI_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function formatTanggal(dateStr: string): string {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return `${HARI_ID[d.getDay()]}, ${day} ${BULAN_ID[month - 1]} ${year}`;
}

function formatCreatedAt(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    const day = d.getDate();
    const month = BULAN_ID[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${mins} WIB`;
  } catch {
    return isoStr;
  }
}

// ─── Sub-component: Detail Row ────────────────────────────────────────────────
function DetailRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 0',
        borderBottom: `1px solid ${BK_COLORS.border}`,
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: BK_RADIUS.sm,
          backgroundColor: highlight ? `${BK_COLORS.primary}15` : BK_COLORS.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: highlight ? BK_COLORS.primary : BK_COLORS.textMuted,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: BK_COLORS.textMuted,
            margin: '0 0 2px',
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: highlight ? 700 : 500,
            color: highlight ? BK_COLORS.primary : BK_COLORS.text,
            margin: 0,
            wordBreak: 'break-word',
            lineHeight: 1.4,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BookingConfirmation({ booking }: BookingConfirmationProps) {
  const refNo = booking.id.replace(/-/g, '').slice(0, 8).toUpperCase();
  const statusCfg = BOOKING_STATUS_CONFIG[booking.status] ?? getStatusColor(booking.status);
  const statusLabel = (BOOKING_STATUS_CONFIG[booking.status]?.label) ?? booking.status;
  const statusEmoji = (BOOKING_STATUS_CONFIG[booking.status]?.emoji) ?? '📋';

  // WA Admin number
  const WA_ADMIN = '6281234567890';
  const waMessage = encodeURIComponent(
    `Halo Admin Disipusda Purwakarta,\n\nSaya ingin menanyakan status booking saya:\n\n• No. Referensi: ${refNo}\n• Nama: ${booking.nama_lengkap}\n• Tanggal: ${formatTanggal(booking.tanggal_booking)}\n• Layanan: ${booking.jenis_layanan}\n\nMohon informasinya. Terima kasih.`
  );

  // Inject Google Fonts
  useEffect(() => {
    const id = 'bk-google-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ fontFamily: BK_FONTS.sans, maxWidth: '640px', margin: '0 auto' }}
    >
      {/* ── Success Hero ── */}
      <div
        style={{
          textAlign: 'center',
          padding: '2.5rem 1.5rem 2rem',
          backgroundColor: BK_COLORS.surfaceWhite,
          borderRadius: BK_RADIUS.xl,
          boxShadow: BK_SHADOW.lg,
          border: `1px solid ${BK_STATUS_COLORS.available.border}`,
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${BK_STATUS_COLORS.available.dot}, ${BK_COLORS.accent})`,
          }}
        />

        {/* Animated check icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.15, stiffness: 200, damping: 18 }}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: `0 0 0 12px #dcfce740`,
          }}
        >
          <CheckCircle2 size={42} color={BK_STATUS_COLORS.available.dot} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: BK_FONTS.display,
            fontWeight: 800,
            fontSize: '1.5rem',
            color: BK_COLORS.text,
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}
        >
          Permohonan Berhasil Dikirim!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            color: BK_COLORS.textMuted,
            fontSize: '0.875rem',
            margin: '0 0 1.5rem',
            lineHeight: 1.6,
          }}
        >
          Booking Anda telah diterima dan sedang menunggu konfirmasi dari admin Disipusda Purwakarta.
        </motion.p>

        {/* Reference number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '12px 24px',
            borderRadius: BK_RADIUS.lg,
            backgroundColor: BK_COLORS.surface,
            border: `1.5px dashed ${BK_COLORS.border}`,
          }}
        >
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: BK_COLORS.textMuted,
            }}
          >
            Nomor Referensi Booking
          </span>
          <span
            style={{
              fontFamily: BK_FONTS.mono,
              fontWeight: 700,
              fontSize: '1.4rem',
              color: BK_COLORS.primary,
              letterSpacing: '0.08em',
            }}
          >
            {refNo}
          </span>
          <span style={{ fontSize: '0.68rem', color: BK_COLORS.textMuted }}>
            Simpan nomor ini untuk keperluan pengecekan
          </span>
        </motion.div>

        {/* Submitted at */}
        <p
          style={{
            marginTop: '1rem',
            fontSize: '0.72rem',
            color: BK_COLORS.textMuted,
          }}
        >
          Dikirim pada: {formatCreatedAt(booking.created_at)}
        </p>
      </div>

      {/* ── Booking Details Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.35 }}
        style={{
          backgroundColor: BK_COLORS.surfaceWhite,
          borderRadius: BK_RADIUS.xl,
          boxShadow: BK_SHADOW.md,
          border: `1px solid ${BK_COLORS.border}`,
          overflow: 'hidden',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: BK_COLORS.surface,
            borderBottom: `1px solid ${BK_COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Clipboard size={16} color={BK_COLORS.primary} />
          <span
            style={{
              fontFamily: BK_FONTS.display,
              fontWeight: 700,
              fontSize: '0.875rem',
              color: BK_COLORS.primary,
            }}
          >
            Detail Booking
          </span>
        </div>

        <div style={{ padding: '0 1.25rem' }}>
          <DetailRow icon={<User size={15} />} label="Nama Lengkap" value={booking.nama_lengkap} highlight />
          <DetailRow icon={<Mail size={15} />} label="Email" value={booking.email} />
          <DetailRow icon={<Phone size={15} />} label="WhatsApp" value={booking.whatsapp} />
          {booking.instansi && (
            <DetailRow icon={<Building2 size={15} />} label="Instansi / Organisasi" value={booking.instansi} />
          )}
          <DetailRow icon={<FileStack size={15} />} label="Jenis Layanan" value={booking.jenis_layanan} highlight />
          <DetailRow
            icon={<Files size={15} />}
            label="Jumlah Dokumen / Arsip"
            value={`${booking.jumlah_dokumen.toLocaleString('id-ID')} dokumen`}
          />
          <DetailRow
            icon={<Calendar size={15} />}
            label="Tanggal Booking"
            value={formatTanggal(booking.tanggal_booking)}
            highlight
          />
          {booking.catatan && (
            <DetailRow icon={<MessageSquare size={15} />} label="Catatan" value={booking.catatan} />
          )}

          {/* Status badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 0 16px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: BK_RADIUS.sm,
                backgroundColor: BK_COLORS.surface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.95rem',
              }}
            >
              {statusEmoji}
            </div>
            <div>
              <p
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: BK_COLORS.textMuted,
                  margin: '0 0 4px',
                }}
              >
                Status Booking
              </p>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: BK_RADIUS.full,
                  backgroundColor: statusCfg.bg,
                  color: statusCfg.text,
                  border: `1px solid ${statusCfg.border}`,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: statusCfg.dot,
                    display: 'inline-block',
                  }}
                />
                {statusLabel}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── What's Next ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.35 }}
        style={{
          backgroundColor: BK_COLORS.surfaceWhite,
          borderRadius: BK_RADIUS.xl,
          boxShadow: BK_SHADOW.md,
          border: `1px solid ${BK_COLORS.border}`,
          overflow: 'hidden',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            background: `linear-gradient(135deg, ${BK_COLORS.primary}10, ${BK_COLORS.accent}10)`,
            borderBottom: `1px solid ${BK_COLORS.border}`,
          }}
        >
          <span
            style={{
              fontFamily: BK_FONTS.display,
              fontWeight: 700,
              fontSize: '0.9rem',
              color: BK_COLORS.primary,
            }}
          >
            📋 Apa Selanjutnya?
          </span>
        </div>

        <div style={{ padding: '1.25rem' }}>
          {[
            {
              step: '01',
              title: 'Cek Email Konfirmasi',
              desc: 'Kami telah mengirim email konfirmasi ke alamat yang Anda daftarkan. Periksa kotak masuk (dan folder spam).',
              color: BK_COLORS.accent,
            },
            {
              step: '02',
              title: 'Tunggu Konfirmasi Admin',
              desc: 'Admin Disipusda akan memproses permohonan Anda dalam 1–2 hari kerja.',
              color: BK_STATUS_COLORS.pending.dot,
            },
            {
              step: '03',
              title: 'Hadir Sesuai Jadwal',
              desc: 'Setelah disetujui, hadir di Disipusda Purwakarta pada tanggal yang telah ditentukan beserta dokumen yang diperlukan.',
              color: BK_STATUS_COLORS.available.dot,
            },
          ].map(({ step, title, desc, color }) => (
            <div
              key={step}
              style={{
                display: 'flex',
                gap: '14px',
                marginBottom: step !== '03' ? '16px' : 0,
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: `${color}18`,
                  border: `2px solid ${color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color,
                  letterSpacing: '-0.01em',
                }}
              >
                {step}
              </div>
              <div>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: BK_COLORS.text,
                    margin: '0 0 3px',
                  }}
                >
                  {title}
                </p>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: BK_COLORS.textMuted,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Action buttons ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* WhatsApp admin */}
        <a
          href={`https://wa.me/${WA_ADMIN}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            minWidth: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '13px 20px',
            borderRadius: BK_RADIUS.md,
            backgroundColor: '#16a34a',
            color: '#ffffff',
            fontFamily: BK_FONTS.display,
            fontWeight: 700,
            fontSize: '0.875rem',
            textDecoration: 'none',
            boxShadow: BK_SHADOW.md,
            transition: 'opacity 0.15s, transform 0.15s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.9')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
        >
          {/* WhatsApp icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Hubungi Admin via WhatsApp
        </a>

        {/* Back to home */}
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '13px 20px',
            borderRadius: BK_RADIUS.md,
            border: `1.5px solid ${BK_COLORS.border}`,
            backgroundColor: '#ffffff',
            color: BK_COLORS.text,
            fontFamily: BK_FONTS.sans,
            fontWeight: 600,
            fontSize: '0.875rem',
            textDecoration: 'none',
            transition: 'border-color 0.15s, background 0.15s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = BK_COLORS.primary;
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = BK_COLORS.surface;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = BK_COLORS.border;
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#ffffff';
          }}
        >
          <Home size={16} /> Kembali ke Beranda
        </a>
      </motion.div>
    </motion.div>
  );
}
