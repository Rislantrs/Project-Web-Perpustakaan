/**
 * ============================================================================
 * BookingPage.tsx — Halaman Utama Booking Layanan Enkapsulasi Arsip (Publik)
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Archive,
  Clock,
  Mail,
  Phone,
  FileText,
  ChevronRight,
  Info,
  MapPin,
  CalendarCheck,
  Shield,
} from 'lucide-react';
import { BK_COLORS, BK_FONTS, BK_RADIUS, BK_SHADOW } from '../constants/designTokens';
import type { Booking } from '../types/booking.types';

// ─── Page sub-components (lazy import via index) ──────────────────────────────
import BookingCalendar from './BookingCalendar';
import BookingForm from './BookingForm';
import BookingConfirmation from './BookingConfirmation';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3;

// ─── Step config ──────────────────────────────────────────────────────────────
const STEPS: { step: Step; label: string; shortLabel: string }[] = [
  { step: 1, label: 'Pilih Tanggal', shortLabel: 'Tanggal' },
  { step: 2, label: 'Isi Data', shortLabel: 'Data' },
  { step: 3, label: 'Konfirmasi', shortLabel: 'Selesai' },
];

// ─── Info sidebar data ─────────────────────────────────────────────────────────
const INFO_JAM_LAYANAN = [
  { hari: 'Senin – Kamis', jam: '08.00 – 15.30 WIB' },
  { hari: 'Jumat', jam: '08.00 – 11.30 WIB' },
  { hari: 'Sabtu & Minggu', jam: 'Tutup' },
];

const DOKUMEN_DIPERLUKAN = [
  'Dokumen asli yang akan dienkapsulasi',
  'Surat permohonan (jika instansi)',
  'Fotokopi KTP pemohon',
  'Daftar inventaris arsip (opsional)',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Step indicator bar */
function StepIndicator({ currentStep }: { currentStep: Step }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        marginBottom: '2rem',
        fontFamily: BK_FONTS.sans,
      }}
    >
      {STEPS.map(({ step, label, shortLabel }, idx) => {
        const isCompleted = currentStep > step;
        const isActive = currentStep === step;

        return (
          <div
            key={step}
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: idx < STEPS.length - 1 ? 1 : undefined,
            }}
          >
            {/* Step circle */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <motion.div
                layout
                animate={{
                  backgroundColor: isCompleted
                    ? '#16a34a'
                    : isActive
                    ? BK_COLORS.primary
                    : '#e2e8f0',
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.25 }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: isCompleted || isActive ? '#ffffff' : BK_COLORS.textMuted,
                  boxShadow: isActive ? `0 0 0 4px ${BK_COLORS.primary}25` : 'none',
                  transition: 'box-shadow 0.2s',
                  cursor: 'default',
                }}
              >
                {isCompleted ? '✓' : step}
              </motion.div>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? BK_COLORS.primary : isCompleted ? '#16a34a' : BK_COLORS.textMuted,
                  letterSpacing: '0.01em',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  // Hide label on mobile, show shortLabel
                }}
              >
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{shortLabel}</span>
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  marginBottom: '18px',
                  marginLeft: '4px',
                  marginRight: '4px',
                  backgroundColor: currentStep > step ? '#16a34a' : BK_COLORS.border,
                  borderRadius: '2px',
                  transition: 'background-color 0.3s',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Info sidebar */
function InfoSidebar() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        fontFamily: BK_FONTS.sans,
      }}
    >
      {/* Jam Layanan */}
      <div
        style={{
          backgroundColor: BK_COLORS.surfaceWhite,
          borderRadius: BK_RADIUS.lg,
          boxShadow: BK_SHADOW.sm,
          border: `1px solid ${BK_COLORS.border}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            background: `linear-gradient(135deg, ${BK_COLORS.primary}12, ${BK_COLORS.accent}08)`,
            borderBottom: `1px solid ${BK_COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Clock size={15} color={BK_COLORS.primary} />
          <span
            style={{
              fontFamily: BK_FONTS.display,
              fontWeight: 700,
              fontSize: '0.82rem',
              color: BK_COLORS.primary,
              letterSpacing: '0.01em',
            }}
          >
            Jam Layanan
          </span>
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {INFO_JAM_LAYANAN.map(({ hari, jam }) => (
            <div
              key={hari}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.78rem',
              }}
            >
              <span style={{ color: BK_COLORS.textMuted }}>{hari}</span>
              <span
                style={{
                  fontWeight: 600,
                  color: jam === 'Tutup' ? '#dc2626' : BK_COLORS.text,
                }}
              >
                {jam}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dokumen yang Diperlukan */}
      <div
        style={{
          backgroundColor: BK_COLORS.surfaceWhite,
          borderRadius: BK_RADIUS.lg,
          boxShadow: BK_SHADOW.sm,
          border: `1px solid ${BK_COLORS.border}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            background: `linear-gradient(135deg, ${BK_COLORS.primary}12, ${BK_COLORS.accent}08)`,
            borderBottom: `1px solid ${BK_COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileText size={15} color={BK_COLORS.primary} />
          <span
            style={{
              fontFamily: BK_FONTS.display,
              fontWeight: 700,
              fontSize: '0.82rem',
              color: BK_COLORS.primary,
            }}
          >
            Dokumen yang Diperlukan
          </span>
        </div>
        <div style={{ padding: '12px 16px' }}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DOKUMEN_DIPERLUKAN.map((doc, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '0.78rem',
                  color: BK_COLORS.text,
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    marginTop: '3px',
                    flexShrink: 0,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: `${BK_COLORS.accent}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.55rem',
                    fontWeight: 800,
                    color: BK_COLORS.accent,
                  }}
                >
                  {i + 1}
                </span>
                {doc}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Kontak Admin */}
      <div
        style={{
          backgroundColor: BK_COLORS.primary,
          borderRadius: BK_RADIUS.lg,
          boxShadow: BK_SHADOW.md,
          padding: '1rem',
          color: '#ffffff',
        }}
      >
        <p
          style={{
            fontFamily: BK_FONTS.display,
            fontWeight: 700,
            fontSize: '0.82rem',
            margin: '0 0 10px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Phone size={14} /> Kontak Admin
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: BK_RADIUS.md,
              backgroundColor: 'rgba(255,255,255,0.12)',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '0.78rem',
              fontWeight: 600,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(255,255,255,0.22)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(255,255,255,0.12)')
            }
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            0812-3456-7890
          </a>

          <a
            href="mailto:arsip@disipusda.purwakarta.go.id"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: BK_RADIUS.md,
              backgroundColor: 'rgba(255,255,255,0.12)',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '0.75rem',
              fontWeight: 500,
              transition: 'background 0.15s',
              wordBreak: 'break-all',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(255,255,255,0.22)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(255,255,255,0.12)')
            }
          >
            <Mail size={14} style={{ flexShrink: 0 }} />
            arsip@disipusda.purwakarta.go.id
          </a>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '8px 10px',
              fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.5,
            }}
          >
            <MapPin size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
            Jl. Veteran No. 1, Komplek Perum Griya Asri, Ciseureuh, Purwakarta, Jawa Barat 41118
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function BookingPage() {
  const [step, setStep] = useState<Step>(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  // Set document title & JSON-LD Schema for GEO (AI Search Engines)
  useEffect(() => {
    const prev = document.title;
    document.title = 'Booking Layanan Enkapsulasi Arsip | Disipusda Purwakarta';

    // Inject Service JSON-LD Schema
    const schemaId = 'booking-service-schema';
    let script = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Layanan Enkapsulasi Arsip",
        "serviceType": "Preservasi Dokumen Kearsipan",
        "provider": {
          "@type": "GovernmentOffice",
          "name": "Dinas Kearsipan dan Perpustakaan Daerah Kabupaten Purwakarta",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Jl. Veteran No. 1, Komplek Perum Griya Asri, Ciseureuh",
            "addressLocality": "Purwakarta",
            "addressRegion": "Jawa Barat",
            "postalCode": "41118",
            "addressCountry": "ID"
          }
        },
        "description": "Layanan pelindungan dan pemeliharaan dokumen/arsip berharga daerah menggunakan bahan bebas asam (acid-free) berkualitas tinggi oleh Disipusda Purwakarta secara online.",
        "hoursAvailable": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"],
            "opens": "08:00",
            "closes": "15:30"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Friday",
            "opens": "08:00",
            "closes": "11:30"
          }
        ],
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "IDR",
          "description": "Layanan gratis bagi masyarakat Kabupaten Purwakarta"
        }
      });
      document.head.appendChild(script);
    }

    return () => {
      document.title = prev;
      const element = document.getElementById(schemaId);
      if (element) {
        element.remove();
      }
    };
  }, []);

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

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuccess = (booking: Booking) => {
    setCompletedBooking(booking);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: BK_COLORS.surface,
        fontFamily: BK_FONTS.sans,
      }}
    >
      {/* ── Hero Section (Premium UI Redesign) ── */}
      <div
        style={{
          background: `linear-gradient(180deg, #f8fafc 0%, ${BK_COLORS.surface} 100%)`,
          borderBottom: `1px solid ${BK_COLORS.border}50`,
          padding: '4rem 1.5rem 3.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative glow circles */}
        <div style={{ position: 'absolute', top: '-10%', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '0', right: '5%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(45, 106, 159, 0.04) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }}></div>

        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Icon (Premium Glassmorphic shadow layout) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '24px',
              background: `linear-gradient(135deg, ${BK_COLORS.primary} 0%, ${BK_COLORS.secondary} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.75rem',
              boxShadow: '0 20px 25px -5px rgba(30, 58, 95, 0.2), 0 8px 10px -6px rgba(30, 58, 95, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <Archive size={36} color="#ffffff" />
          </motion.div>

          {/* Badge (Pill Style) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(30, 58, 95, 0.05)',
              border: '1px solid rgba(30, 58, 95, 0.08)',
              color: BK_COLORS.primary,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            <Shield size={13} style={{ color: BK_COLORS.secondary }} /> Disipusda Purwakarta · Layanan Digital
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            style={{
              fontFamily: BK_FONTS.display,
              fontWeight: 800,
              fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
              color: '#0f172a', // slate-900
              letterSpacing: '-0.03em',
              margin: '0 0 1rem',
              lineHeight: 1.2,
            }}
          >
            Booking Layanan Enkapsulasi Arsip
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              fontSize: 'clamp(0.88rem, 2vw, 1.02rem)',
              color: '#475569', // slate-600
              maxWidth: '620px',
              margin: '0 auto 2.25rem',
              lineHeight: 1.7,
              fontWeight: 500,
            }}
          >
            Layanan pelindungan arsip menggunakan bahan bebas asam berkualitas tinggi untuk menjaga
            keutuhan dokumen berharga Anda. Pilih tanggal, isi data, dan tim kami akan menghubungi
            Anda.
          </motion.p>

          {/* Info badges (Tailwind CSS styled premium pills) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
            }}
          >
            {[
              { icon: <CalendarCheck size={14} style={{ color: BK_COLORS.secondary }} />, text: '1 Slot Per Hari' },
              { icon: <Mail size={14} style={{ color: BK_COLORS.secondary }} />, text: 'Konfirmasi via Email' },
              { icon: <Phone size={14} style={{ color: BK_COLORS.secondary }} />, text: 'Notifikasi WhatsApp' },
            ].map(({ icon, text }) => (
              <span
                key={text}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#334155', // slate-700
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.02)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                {icon}
                {text}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '2rem 1.5rem 4rem',
        }}
      >
        {/* Step indicator */}
        {step < 3 && <StepIndicator currentStep={step} />}

        {/* Layout: main + sidebar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: step === 3 ? '1fr' : 'minmax(0, 1fr) minmax(0, 300px)',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* ── Main content area ── */}
          <div>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Step 1 heading */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <CalendarCheck size={18} color={BK_COLORS.primary} />
                      <h2
                        style={{
                          fontFamily: BK_FONTS.display,
                          fontWeight: 700,
                          fontSize: '1.05rem',
                          color: BK_COLORS.text,
                          margin: 0,
                        }}
                      >
                        Pilih Tanggal Kunjungan
                      </h2>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: BK_COLORS.textMuted, margin: '0 0 0 26px' }}>
                      Klik pada tanggal yang tersedia (hijau) untuk melanjutkan.
                    </p>
                  </div>

                  <BookingCalendar
                    onSelectDate={handleDateSelect}
                    selectedDate={selectedDate}
                  />

                  {/* Info note */}
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '10px 14px',
                      borderRadius: BK_RADIUS.md,
                      backgroundColor: `${BK_COLORS.accent}08`,
                      border: `1px solid ${BK_COLORS.accent}20`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                    }}
                  >
                    <Info size={15} color={BK_COLORS.accent} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <p style={{ fontSize: '0.75rem', color: BK_COLORS.textMuted, margin: 0, lineHeight: 1.6 }}>
                      Hanya tersedia <strong>1 slot booking per hari</strong>. Tanggal merah/kuning sudah
                      terisi. Booking minimum H+1 hari kerja dari sekarang.
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 2 && selectedDate && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <BookingForm
                    selectedDate={selectedDate}
                    onBack={handleBack}
                    onSuccess={handleSuccess}
                  />
                </motion.div>
              )}

              {step === 3 && completedBooking && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step 3 success heading */}
                  <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        borderRadius: BK_RADIUS.full,
                        backgroundColor: '#dcfce7',
                        border: '1px solid #86efac',
                        color: '#15803d',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      ✓ Langkah 3 dari 3 · Booking Selesai
                    </span>
                  </div>
                  <BookingConfirmation booking={completedBooking} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Sidebar (hidden on step 3) ── */}
          {step !== 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              style={{
                // On mobile, sidebar collapses to full width below main content
                // We use media query approach via style tag or Tailwind class below
              }}
            >
              <InfoSidebar />
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Responsive override for mobile ── */}
      <style>{`
        @media (max-width: 768px) {
          /* Force single column on mobile */
          div[style*="grid-template-columns: minmax(0, 1fr) minmax(0, 300px)"] {
            grid-template-columns: 1fr !important;
          }
        }
        /* Tailwind responsive helpers used in step labels */
        .hidden { display: none; }
        .sm\\:inline { display: none; }
        @media (min-width: 640px) {
          .hidden { display: none; }
          .sm\\:inline { display: inline; }
          .sm\\:hidden { display: none; }
        }
        @media (max-width: 639px) {
          .hidden { display: inline; }
          .sm\\:hidden { display: inline; }
        }
      `}</style>
    </div>
  );
}
