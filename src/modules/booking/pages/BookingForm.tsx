/**
 * ============================================================================
 * BookingForm.tsx — Form Pengajuan Booking Enkapsulasi Arsip
 * ============================================================================
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Phone,
  Mail,
  Building2,
  FileStack,
  Files,
  Calendar,
  MessageSquare,
  ChevronLeft,
  Send,
  Lock,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { BK_COLORS, BK_FONTS, BK_RADIUS, BK_SHADOW } from '../constants/designTokens';
import { JENIS_LAYANAN, JENIS_LAYANAN_DESC, MAX_DOKUMEN, MIN_DOKUMEN } from '../constants/jenisLayanan';
import type { Booking, CreateBookingDTO } from '../types/booking.types';

// ─── Service imports ─────────────────────────────────────────────────────────
let createBooking: (data: CreateBookingDTO) => Promise<{ success: boolean; message: string; data?: Booking }>;
let notifyNewBooking: (booking: Booking) => Promise<void>;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  createBooking = require('../services/bookingService').createBooking;
} catch {
  createBooking = async () => ({ success: false, message: 'Service belum tersedia.' });
}
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  notifyNewBooking = require('../services/notificationService').notifyNewBooking;
} catch {
  notifyNewBooking = async () => {};
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface BookingFormProps {
  selectedDate: string;
  onBack: () => void;
  onSuccess: (booking: Booking) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const HARI_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function formatTanggalIndonesia(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return `${HARI_ID[d.getDay()]}, ${day} ${BULAN_ID[month - 1]} ${year}`;
}

// ─── Form validation types ───────────────────────────────────────────────────
interface FormErrors {
  nama_lengkap?: string;
  whatsapp?: string;
  email?: string;
  jenis_layanan?: string;
  jumlah_dokumen?: string;
}

interface FormState {
  nama_lengkap: string;
  whatsapp: string;
  email: string;
  instansi: string;
  jenis_layanan: string;
  jumlah_dokumen: string;
  catatan: string;
}

// ─── Field wrapper component ──────────────────────────────────────────────────
interface FieldProps {
  label: string;
  icon: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, icon, required, optional, error, children }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: BK_COLORS.textMuted,
          fontFamily: BK_FONTS.sans,
        }}
      >
        <span style={{ color: BK_COLORS.primary, flexShrink: 0 }}>{icon}</span>
        {label}
        {required && (
          <span style={{ color: '#dc2626', marginLeft: '1px', fontSize: '0.8rem' }}>*</span>
        )}
        {optional && (
          <span
            style={{
              marginLeft: '4px',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              padding: '2px 7px',
              borderRadius: BK_RADIUS.full,
              backgroundColor: `${BK_COLORS.accent}15`,
              color: BK_COLORS.accent,
              border: `1px solid ${BK_COLORS.accent}30`,
            }}
          >
            Opsional
          </span>
        )}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.75rem',
              color: '#dc2626',
              margin: 0,
              fontFamily: BK_FONTS.sans,
            }}
          >
            <AlertCircle size={13} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Input base styles ────────────────────────────────────────────────────────
const inputStyle = (hasError?: boolean, readOnly?: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '12px 14px',
  borderRadius: BK_RADIUS.md,
  border: `1.5px solid ${hasError ? '#fca5a5' : BK_COLORS.border}`,
  backgroundColor: readOnly ? BK_COLORS.surface : '#ffffff',
  color: readOnly ? BK_COLORS.textMuted : BK_COLORS.text,
  fontSize: '0.875rem',
  fontFamily: BK_FONTS.sans,
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  boxSizing: 'border-box' as const,
  cursor: readOnly ? 'default' : 'text',
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BookingForm({ selectedDate, onBack, onSuccess }: BookingFormProps) {
  const [form, setForm] = useState<FormState>({
    nama_lengkap: '',
    whatsapp: '',
    email: '',
    instansi: '',
    jenis_layanan: '',
    jumlah_dokumen: '',
    catatan: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dateTakenError, setDateTakenError] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

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

  const update = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setSubmitError(null);
    setDateTakenError(false);
  };

  // ─── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.nama_lengkap.trim()) {
      newErrors.nama_lengkap = 'Nama lengkap wajib diisi.';
    } else if (form.nama_lengkap.trim().length < 3) {
      newErrors.nama_lengkap = 'Nama terlalu pendek (minimal 3 karakter).';
    }

    if (!form.whatsapp.trim()) {
      newErrors.whatsapp = 'Nomor WhatsApp wajib diisi.';
    } else if (!/^(\+62|62|0)[0-9]{8,13}$/.test(form.whatsapp.replace(/[-\s]/g, ''))) {
      newErrors.whatsapp = 'Format nomor tidak valid. Contoh: 0812-3456-7890';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email aktif wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Format email tidak valid.';
    }

    if (!form.jenis_layanan) {
      newErrors.jenis_layanan = 'Pilih jenis layanan yang dibutuhkan.';
    }

    const jumlah = parseInt(form.jumlah_dokumen, 10);
    if (!form.jumlah_dokumen) {
      newErrors.jumlah_dokumen = 'Jumlah dokumen wajib diisi.';
    } else if (isNaN(jumlah) || jumlah < MIN_DOKUMEN) {
      newErrors.jumlah_dokumen = `Jumlah minimal ${MIN_DOKUMEN} dokumen.`;
    } else if (jumlah > MAX_DOKUMEN) {
      newErrors.jumlah_dokumen = `Jumlah maksimal ${MAX_DOKUMEN.toLocaleString('id-ID')} dokumen.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setDateTakenError(false);

    if (!validate()) {
      // Scroll to first error
      formRef.current?.querySelector('[data-error="true"]')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateBookingDTO = {
        nama_lengkap: form.nama_lengkap.trim(),
        whatsapp: form.whatsapp.replace(/\s/g, ''),
        email: form.email.trim().toLowerCase(),
        instansi: form.instansi.trim() || undefined,
        jenis_layanan: form.jenis_layanan,
        jumlah_dokumen: parseInt(form.jumlah_dokumen, 10),
        tanggal_booking: selectedDate,
        catatan: form.catatan.trim() || undefined,
      };

      const result = await createBooking(payload);

      if (result.success && result.data) {
        // Fire and forget notification
        notifyNewBooking(result.data).catch(console.warn);
        onSuccess(result.data);
        return;
      }

      // Check for uniqueness violation (date taken)
      const msg = result.message?.toLowerCase() ?? '';
      if (
        msg.includes('unique') ||
        msg.includes('duplicate') ||
        msg.includes('already') ||
        msg.includes('sudah') ||
        msg.includes('diisi') ||
        msg.includes('constraint')
      ) {
        setDateTakenError(true);
      } else {
        setSubmitError(result.message || 'Terjadi kesalahan. Silakan coba kembali.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.toLowerCase().includes('unique') || errMsg.toLowerCase().includes('duplicate')) {
        setDateTakenError(true);
      } else {
        setSubmitError('Koneksi gagal. Periksa internet Anda dan coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getFocusStyle = (field: string): React.CSSProperties =>
    focusedField === field
      ? {
          borderColor: BK_COLORS.borderFocus,
          boxShadow: `0 0 0 3px ${BK_COLORS.accent}20`,
        }
      : {};

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      ref={formRef}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{ fontFamily: BK_FONTS.sans }}
    >
      {/* ── Tanggal Header ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${BK_COLORS.primary} 0%, ${BK_COLORS.secondary} 100%)`,
          borderRadius: BK_RADIUS.xl,
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: BK_SHADOW.md,
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: BK_RADIUS.md,
            backgroundColor: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Calendar size={22} color="#ffffff" />
        </div>
        <div>
          <p
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Tanggal yang Dipilih
          </p>
          <p
            style={{
              color: '#ffffff',
              fontFamily: BK_FONTS.display,
              fontWeight: 700,
              fontSize: '1.1rem',
              margin: '2px 0 0',
              letterSpacing: '-0.01em',
            }}
          >
            {formatTanggalIndonesia(selectedDate)}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: BK_RADIUS.md,
            padding: '6px 12px',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: BK_FONTS.sans,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.25)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.15)')
          }
        >
          <ChevronLeft size={14} /> Ganti Tanggal
        </button>
      </div>

      {/* ── Date taken error ── */}
      <AnimatePresence>
        {dateTakenError && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.97 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: '1.5rem',
              padding: '1rem 1.25rem',
              borderRadius: BK_RADIUS.lg,
              backgroundColor: '#fef2f2',
              border: '1.5px solid #fca5a5',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p
                style={{
                  color: '#991b1b',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  margin: '0 0 4px',
                }}
              >
                Tanggal Sudah Terisi
              </p>
              <p style={{ color: '#b91c1c', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
                Tanggal <strong>{formatTanggalIndonesia(selectedDate)}</strong> sudah diambil oleh
                pemohon lain. Silakan kembali ke kalender dan pilih tanggal lain yang tersedia.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Form card ── */}
      <div
        style={{
          backgroundColor: BK_COLORS.surfaceWhite,
          borderRadius: BK_RADIUS.xl,
          boxShadow: BK_SHADOW.md,
          border: `1px solid ${BK_COLORS.border}`,
          overflow: 'hidden',
        }}
      >
        {/* Card header */}
        <div
          style={{
            borderBottom: `1px solid ${BK_COLORS.border}`,
            padding: '1rem 1.5rem',
            backgroundColor: BK_COLORS.surface,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileStack size={18} color={BK_COLORS.primary} />
          <span
            style={{
              fontFamily: BK_FONTS.display,
              fontWeight: 700,
              fontSize: '0.9rem',
              color: BK_COLORS.primary,
            }}
          >
            Data Pemohon & Layanan
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Row 1: Nama + WA */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {/* Nama Lengkap */}
              <Field
                label="Nama Lengkap"
                icon={<User size={13} />}
                required
                error={errors.nama_lengkap}
              >
                <input
                  data-error={!!errors.nama_lengkap}
                  type="text"
                  value={form.nama_lengkap}
                  onChange={update('nama_lengkap')}
                  onFocus={() => setFocusedField('nama_lengkap')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Masukkan nama lengkap Anda"
                  style={{
                    ...inputStyle(!!errors.nama_lengkap),
                    ...getFocusStyle('nama_lengkap'),
                  }}
                />
              </Field>

              {/* Nomor WhatsApp */}
              <Field
                label="Nomor WhatsApp"
                icon={<Phone size={13} />}
                required
                error={errors.whatsapp}
              >
                <input
                  data-error={!!errors.whatsapp}
                  type="tel"
                  value={form.whatsapp}
                  onChange={update('whatsapp')}
                  onFocus={() => setFocusedField('whatsapp')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="08xx-xxxx-xxxx"
                  style={{
                    ...inputStyle(!!errors.whatsapp),
                    ...getFocusStyle('whatsapp'),
                  }}
                />
              </Field>
            </div>

            {/* Row 2: Email + Instansi */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {/* Email */}
              <Field
                label="Email Aktif"
                icon={<Mail size={13} />}
                required
                error={errors.email}
              >
                <input
                  data-error={!!errors.email}
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="contoh@email.com"
                  style={{
                    ...inputStyle(!!errors.email),
                    ...getFocusStyle('email'),
                  }}
                />
              </Field>

              {/* Instansi */}
              <Field
                label="Instansi / Organisasi"
                icon={<Building2 size={13} />}
                optional
              >
                <input
                  type="text"
                  value={form.instansi}
                  onChange={update('instansi')}
                  onFocus={() => setFocusedField('instansi')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Nama instansi atau organisasi"
                  style={{
                    ...inputStyle(),
                    ...getFocusStyle('instansi'),
                  }}
                />
              </Field>
            </div>

            {/* Row 3: Jenis Layanan + Jumlah Dokumen */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {/* Jenis Layanan */}
              <Field
                label="Jenis Layanan"
                icon={<FileStack size={13} />}
                required
                error={errors.jenis_layanan}
              >
                <select
                  data-error={!!errors.jenis_layanan}
                  value={form.jenis_layanan}
                  onChange={update('jenis_layanan')}
                  onFocus={() => setFocusedField('jenis_layanan')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle(!!errors.jenis_layanan),
                    ...getFocusStyle('jenis_layanan'),
                    appearance: 'none',
                    cursor: 'pointer',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: '36px',
                  }}
                >
                  <option value="">-- Pilih jenis layanan --</option>
                  {JENIS_LAYANAN.map((jl) => (
                    <option key={jl} value={jl} title={JENIS_LAYANAN_DESC[jl]}>
                      {jl}
                    </option>
                  ))}
                </select>
                {form.jenis_layanan && JENIS_LAYANAN_DESC[form.jenis_layanan] && (
                  <p
                    style={{
                      fontSize: '0.72rem',
                      color: BK_COLORS.textMuted,
                      margin: '4px 0 0',
                      lineHeight: 1.5,
                    }}
                  >
                    ℹ️ {JENIS_LAYANAN_DESC[form.jenis_layanan]}
                  </p>
                )}
              </Field>

              {/* Jumlah Dokumen */}
              <Field
                label="Jumlah Dokumen / Arsip"
                icon={<Files size={13} />}
                required
                error={errors.jumlah_dokumen}
              >
                <input
                  data-error={!!errors.jumlah_dokumen}
                  type="number"
                  min={MIN_DOKUMEN}
                  max={MAX_DOKUMEN}
                  value={form.jumlah_dokumen}
                  onChange={update('jumlah_dokumen')}
                  onFocus={() => setFocusedField('jumlah_dokumen')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={`Min. ${MIN_DOKUMEN} — Maks. ${MAX_DOKUMEN.toLocaleString('id-ID')}`}
                  style={{
                    ...inputStyle(!!errors.jumlah_dokumen),
                    ...getFocusStyle('jumlah_dokumen'),
                  }}
                />
              </Field>
            </div>

            {/* Tanggal Booking (read-only) */}
            <Field
              label="Tanggal Booking"
              icon={<Calendar size={13} />}
            >
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formatTanggalIndonesia(selectedDate)}
                  readOnly
                  style={inputStyle(false, true)}
                />
                <Lock
                  size={14}
                  color={BK_COLORS.textMuted}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
              </div>
            </Field>

            {/* Catatan Tambahan */}
            <Field
              label="Catatan Tambahan"
              icon={<MessageSquare size={13} />}
              optional
            >
              <textarea
                value={form.catatan}
                onChange={update('catatan')}
                onFocus={() => setFocusedField('catatan')}
                onBlur={() => setFocusedField(null)}
                rows={4}
                placeholder="Informasi tambahan yang perlu diketahui admin, misal: kondisi dokumen, keperluan khusus, dsb."
                style={{
                  ...inputStyle(),
                  ...getFocusStyle('catatan'),
                  resize: 'vertical',
                  minHeight: '100px',
                  lineHeight: '1.6',
                }}
              />
            </Field>

            {/* Privacy note */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: BK_RADIUS.md,
                backgroundColor: `${BK_COLORS.accent}08`,
                border: `1px solid ${BK_COLORS.accent}20`,
              }}
            >
              <ShieldCheck size={15} color={BK_COLORS.accent} style={{ flexShrink: 0 }} />
              <p
                style={{
                  fontSize: '0.75rem',
                  color: BK_COLORS.textMuted,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Data Anda aman dan hanya digunakan untuk keperluan layanan enkapsulasi arsip
                Disipusda Purwakarta.
              </p>
            </div>

            {/* General submit error */}
            <AnimatePresence>
              {submitError && !dateTakenError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: BK_RADIUS.md,
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fca5a5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#dc2626',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  {submitError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              {/* Back button */}
              <button
                type="button"
                onClick={onBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 20px',
                  borderRadius: BK_RADIUS.md,
                  border: `1.5px solid ${BK_COLORS.border}`,
                  backgroundColor: '#ffffff',
                  color: BK_COLORS.text,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: BK_FONTS.sans,
                  transition: 'border-color 0.15s, background 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = BK_COLORS.primary;
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = BK_COLORS.surface;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = BK_COLORS.border;
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffffff';
                }}
              >
                <ChevronLeft size={16} /> Kembali
              </button>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={!submitting ? { scale: 1.02, y: -1 } : {}}
                whileTap={!submitting ? { scale: 0.98 } : {}}
                style={{
                  flex: 1,
                  minWidth: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: BK_RADIUS.md,
                  border: 'none',
                  background: submitting
                    ? BK_COLORS.textMuted
                    : `linear-gradient(135deg, ${BK_COLORS.primary} 0%, ${BK_COLORS.secondary} 100%)`,
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontFamily: BK_FONTS.display,
                  boxShadow: submitting ? 'none' : BK_SHADOW.md,
                  transition: 'background 0.2s, box-shadow 0.2s',
                  letterSpacing: '0.01em',
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Kirim Permohonan Booking
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </div>

      {/* Spin keyframe */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
}
