/**
 * ============================================================================
 * RescheduleConfirm.tsx — Halaman Konfirmasi Penjadwalan Ulang oleh Pemohon
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowLeft,
  Mail,
  Phone,
  AlertTriangle,
  Building2,
  FileText,
} from 'lucide-react';
import { BK_COLORS, BK_FONTS, BK_RADIUS, BK_SHADOW } from '../constants/designTokens';
import { confirmReschedule } from '../services/bookingService';
import type { Booking } from '../types/booking.types';

// Format format tanggal Bahasa Indonesia
function formatIndoDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function RescheduleConfirm() {
  const [token, setToken] = useState<string | null>(null);
  const [actionFromUrl, setActionFromUrl] = useState<'accept' | 'decline' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [decided, setDecided] = useState<boolean>(false);

  // Parse URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    const a = params.get('action');

    setToken(t);
    if (a === 'accept' || a === 'decline') {
      setActionFromUrl(a);
    }

    // Fetch booking details by token or directly initialize checking
    if (!t) {
      setErrorMsg('Token konfirmasi tidak ditemukan di URL. Pastikan Anda mengklik link yang benar dari email Anda.');
      setIsLoading(false);
    } else {
      // Cari booking berdasarkan token dengan memanggil API reschedule info
      // Karena method getBookingByToken tidak secara eksplisit di-expose oleh IBookingRepository,
      // kita memverifikasinya melalui request atau membiarkan confirmReschedule menangani.
      // Namun, untuk kenyamanan UI, kita bisa panggil API endpoint atau get booking details.
      // Supabase repo confirmReschedule mencari berdasarkan token. Kita coba fetch booking menggunakan token.
      // Untuk kesederhanaan, kita langsung tawarkan aksi atau load dengan Supabase.
      fetchBookingDetails(t);
    }
  }, []);

  const fetchBookingDetails = async (tokenStr: string) => {
    setIsLoading(true);
    try {
      // Ambil client supabase secara langsung karena kita ingin mencari booking berdasarkan token reschedule
      const { supabase } = await import('../../../services/supabase');
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('reschedule_token', tokenStr)
        .single();

      if (error || !data) {
        setErrorMsg('Tautan tidak valid atau sudah kedaluwarsa (berlaku 48 jam). Silakan hubungi admin Disipusda.');
      } else {
        setBooking(data as Booking);
        // Cek jika token sudah kedaluwarsa
        const expiresAt = new Date(data.reschedule_token_expires_at);
        if (expiresAt < new Date()) {
          setErrorMsg('Tautan konfirmasi sudah kedaluwarsa. Token usulan jadwal ulang hanya berlaku selama 48 jam.');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal mengambil data usulan jadwal ulang. Hubungi admin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (act: 'accept' | 'decline') => {
    if (!token) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await confirmReschedule(token, act);
      if (res.success) {
        setSuccessMsg(res.message);
        setDecided(true);
        if (booking) {
          setBooking({
            ...booking,
            status: act === 'accept' ? 'pending' : 'cancelled',
            tanggal_booking: act === 'accept' ? (booking.reschedule_date || booking.tanggal_booking) : booking.tanggal_booking,
          });
        }
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan koneksi saat memproses keputusan Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Jalankan aksi otomatis jika diarahkan langsung dari email dengan action parameter
  useEffect(() => {
    if (booking && actionFromUrl && !decided && !isSubmitting) {
      handleAction(actionFromUrl);
    }
  }, [booking, actionFromUrl]);

  // Inject Google Fonts
  useEffect(() => {
    const id = 'bk-google-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: BK_COLORS.surface,
        fontFamily: BK_FONTS.sans,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          backgroundColor: BK_COLORS.surfaceWhite,
          borderRadius: BK_RADIUS.xl,
          boxShadow: BK_SHADOW.lg,
          border: `1px solid ${BK_COLORS.border}`,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${BK_COLORS.primary} 0%, ${BK_COLORS.secondary} 100%)`,
            padding: '2rem 1.5rem',
            textAlign: 'center',
            color: '#ffffff',
          }}
        >
          <Calendar size={40} style={{ margin: '0 auto 12px', opacity: 0.9 }} />
          <h1
            style={{
              fontFamily: BK_FONTS.display,
              fontWeight: 800,
              fontSize: '1.25rem',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Usulan Jadwal Ulang Layanan
          </h1>
          <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '6px', margin: 0 }}>
            Dinas Perpustakaan dan Kearsipan Daerah Kabupaten Purwakarta
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '1.75rem' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div
                style={{
                  border: `3px solid ${BK_COLORS.border}`,
                  borderTop: `3px solid ${BK_COLORS.primary}`,
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 12px',
                }}
              />
              <p style={{ fontSize: '0.85rem', color: BK_COLORS.textMuted }}>
                Memuat informasi usulan jadwal ulang...
              </p>
            </div>
          ) : errorMsg ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: 'center',
                padding: '1rem 0',
              }}
            >
              <AlertTriangle size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#dc2626',
                  margin: '0 0 10px',
                }}
              >
                Tautan Tidak Dapat Digunakan
              </h2>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: BK_COLORS.textMuted,
                  lineHeight: 1.6,
                  margin: '0 0 24px',
                }}
              >
                {errorMsg}
              </p>
              <a
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: BK_RADIUS.md,
                  backgroundColor: BK_COLORS.primary,
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  boxShadow: BK_SHADOW.sm,
                }}
              >
                <ArrowLeft size={14} /> Kembali ke Beranda
              </a>
            </motion.div>
          ) : successMsg ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                textAlign: 'center',
                padding: '1rem 0',
              }}
            >
              {decided && booking?.status === 'pending' ? (
                <CheckCircle size={52} color="#16a34a" style={{ margin: '0 auto 16px' }} />
              ) : (
                <XCircle size={52} color="#dc2626" style={{ margin: '0 auto 16px' }} />
              )}
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: decided && booking?.status === 'pending' ? '#16a34a' : '#dc2626',
                  margin: '0 0 10px',
                }}
              >
                {decided && booking?.status === 'pending'
                  ? 'Jadwal Ulang Disetujui'
                  : 'Booking Dibatalkan'}
              </h2>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: BK_COLORS.textMuted,
                  lineHeight: 1.6,
                  margin: '0 0 24px',
                }}
              >
                {successMsg}
              </p>
              <a
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: BK_RADIUS.md,
                  backgroundColor: BK_COLORS.primary,
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                Kembali ke Beranda
              </a>
            </motion.div>
          ) : booking ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              {/* Info Box */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#faf5ff',
                  border: '1px solid #e9d5ff',
                  borderRadius: BK_RADIUS.md,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <HelpCircle size={18} color="#9333ea" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6b21a8', margin: '0 0 4px' }}>
                    Alasan Perubahan Jadwal:
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#581c87', margin: 0, lineHeight: 1.5 }}>
                    "{booking.reschedule_note || 'Admin mengusulkan penyesuaian jadwal pelayanan.'}"
                  </p>
                </div>
              </div>

              {/* Perbandingan Jadwal */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                {/* Lama */}
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: BK_RADIUS.md,
                    border: `1px solid ${BK_COLORS.border}`,
                  }}
                >
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: BK_COLORS.textMuted, textTransform: 'uppercase' }}>
                    Jadwal Semula
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#64748b' }}>
                    <Calendar size={14} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                      {formatIndoDate(booking.tanggal_booking)}
                    </span>
                  </div>
                </div>

                {/* Baru */}
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: BK_RADIUS.md,
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                    Usulan Jadwal Baru
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#15803d' }}>
                    <Calendar size={14} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      {formatIndoDate(booking.reschedule_date || '')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ringkasan Data Booking */}
              <div
                style={{
                  border: `1px solid ${BK_COLORS.border}`,
                  borderRadius: BK_RADIUS.lg,
                  padding: '12px 14px',
                  backgroundColor: '#f8fafc',
                }}
              >
                <h3
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    margin: '0 0 10px',
                    color: BK_COLORS.text,
                    borderBottom: `1px solid ${BK_COLORS.border}`,
                    paddingBottom: '6px',
                  }}
                >
                  Detail Permohonan
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: BK_COLORS.textMuted }}>Nama Pemohon</span>
                    <span style={{ fontWeight: 600, color: BK_COLORS.text }}>{booking.nama_lengkap}</span>
                  </div>
                  {booking.instansi && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: BK_COLORS.textMuted }}>Instansi</span>
                      <span style={{ fontWeight: 600, color: BK_COLORS.text }}>{booking.instansi}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: BK_COLORS.textMuted }}>Jenis Layanan</span>
                    <span style={{ fontWeight: 600, color: BK_COLORS.text }}>{booking.jenis_layanan}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: BK_COLORS.textMuted }}>Jumlah Dokumen</span>
                    <span style={{ fontWeight: 600, color: BK_COLORS.text }}>{booking.jumlah_dokumen} Arsip</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginTop: '0.5rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleAction('decline')}
                  disabled={isSubmitting}
                  style={{
                    padding: '12px',
                    borderRadius: BK_RADIUS.md,
                    border: '1px solid #dc2626',
                    backgroundColor: 'transparent',
                    color: '#dc2626',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {isSubmitting ? 'Memproses...' : 'Tolak & Batalkan'}
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('accept')}
                  disabled={isSubmitting}
                  style={{
                    padding: '12px',
                    borderRadius: BK_RADIUS.md,
                    border: 'none',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: BK_SHADOW.sm,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
                >
                  {isSubmitting ? 'Memproses...' : 'Setujui Jadwal Baru'}
                </button>
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
