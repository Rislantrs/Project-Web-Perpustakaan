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
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;
  const currentLabel = STEPS.find((s) => s.step === currentStep)?.label || '';

  return (
    <div style={{ marginBottom: '2rem', fontFamily: BK_FONTS.sans }}>
      {/* Desktop layout: Circles */}
      <div
        className="hidden sm:flex"
        style={{
          alignItems: 'center',
          gap: 0,
        }}
      >
        {STEPS.map(({ step, label }, idx) => {
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
                      ? BK_COLORS.secondary
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
                    color: isActive ? BK_COLORS.primary : isCompleted ? BK_COLORS.secondary : BK_COLORS.textMuted,
                    letterSpacing: '0.01em',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </span>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    marginBottom: '18px',
                    marginLeft: '4px',
                    marginRight: '4px',
                    backgroundColor: currentStep > step ? BK_COLORS.secondary : BK_COLORS.border,
                    borderRadius: '2px',
                    transition: 'background-color 0.3s',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile layout: Compact progress line */}
      <div className="sm:hidden" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: BK_COLORS.primary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Langkah {currentStep} dari 3
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: BK_COLORS.text }}>
            {currentLabel}
          </span>
        </div>
        <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%', backgroundColor: BK_COLORS.primary }}
          />
        </div>
      </div>
    </div>
  );
}

/** Info sidebar */
function InfoSidebar() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSection = (section: string) => {
    if (!isMobile) return;
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        fontFamily: BK_FONTS.sans,
        width: '100%',
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
        <button
          type="button"
          onClick={() => toggleSection('jam')}
          style={{
            width: '100%',
            textAlign: 'left',
            border: 'none',
            outline: 'none',
            padding: '12px 16px',
            background: `linear-gradient(135deg, ${BK_COLORS.primary}12, ${BK_COLORS.accent}08)`,
            borderBottom: (isMobile && openSection !== 'jam') ? 'none' : `1px solid ${BK_COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: isMobile ? 'pointer' : 'default',
          }}
        >
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
          {isMobile && (
            <span style={{ fontSize: '0.75rem', color: BK_COLORS.textMuted }}>
              {openSection === 'jam' ? '▲' : '▼'}
            </span>
          )}
        </button>

        <AnimatePresence initial={false}>
          {(!isMobile || openSection === 'jam') && (
            <motion.div
              initial={isMobile ? { height: 0, opacity: 0 } : false}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
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
                        fontWeight: 605,
                        color: jam === 'Tutup' ? '#dc2626' : BK_COLORS.text,
                      }}
                    >
                      {jam}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
        <button
          type="button"
          onClick={() => toggleSection('dokumen')}
          style={{
            width: '100%',
            textAlign: 'left',
            border: 'none',
            outline: 'none',
            padding: '12px 16px',
            background: `linear-gradient(135deg, ${BK_COLORS.primary}12, ${BK_COLORS.accent}08)`,
            borderBottom: (isMobile && openSection !== 'dokumen') ? 'none' : `1px solid ${BK_COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: isMobile ? 'pointer' : 'default',
          }}
        >
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
          {isMobile && (
            <span style={{ fontSize: '0.75rem', color: BK_COLORS.textMuted }}>
              {openSection === 'dokumen' ? '▲' : '▼'}
            </span>
          )}
        </button>

        <AnimatePresence initial={false}>
          {(!isMobile || openSection === 'dokumen') && (
            <motion.div
              initial={isMobile ? { height: 0, opacity: 0 } : false}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Kontak Admin */}
      <div
        style={{
          backgroundColor: BK_COLORS.primary,
          borderRadius: BK_RADIUS.lg,
          boxShadow: BK_SHADOW.md,
          overflow: 'hidden',
          color: '#ffffff',
        }}
      >
        <button
          type="button"
          onClick={() => toggleSection('kontak')}
          style={{
            width: '100%',
            textAlign: 'left',
            border: 'none',
            outline: 'none',
            padding: '16px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderBottom: (isMobile && openSection !== 'kontak') ? 'none' : '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: isMobile ? 'pointer' : 'default',
            color: '#ffffff',
          }}
        >
          <span
            style={{
              fontFamily: BK_FONTS.display,
              fontWeight: 700,
              fontSize: '0.82rem',
              color: '#ffffff',
            }}
          >
            Kontak & Lokasi Admin
          </span>
          {isMobile && (
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
              {openSection === 'kontak' ? '▲' : '▼'}
            </span>
          )}
        </button>

        <AnimatePresence initial={false}>
          {(!isMobile || openSection === 'kontak') && (
            <motion.div
              initial={isMobile ? { height: 0, opacity: 0 } : false}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                  Hubungi via WhatsApp
                </a>

                <a
                  href="mailto:arsip@disipusda.purwakarta.go.id"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                  arsip@disipusda.purwakarta.go.id
                </a>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '8px 4px 4px',
                    fontSize: '0.72rem',
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>Alamat Kantor:</span>
                  Jl. Veteran No. 1, Komplek Perum Griya Asri, Ciseureuh, Purwakarta, Jawa Barat 41118
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
      {/* ── Hero Section (Premium Split Redesign) ── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-50 border-b border-slate-200/60 py-16 lg:py-24">
        {/* Subtle decorative glow circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Title & Text */}
            <div className="lg:col-span-7 text-left space-y-6">
              
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-bold tracking-wider uppercase"
              >
                <Shield size={13} className="text-[#2d6a9f]" /> Disipusda Purwakarta · Layanan Digital
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="font-serif text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight"
              >
                Booking Layanan <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a5f] to-[#2d6a9f]">
                  Enkapsulasi Arsip
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium max-w-2xl"
              >
                Layanan pelindungan arsip menggunakan bahan bebas asam berkualitas tinggi untuk menjaga keutuhan dokumen berharga Anda. Pilih tanggal, isi data, dan tim kami akan menghubungi Anda.
              </motion.p>

              {/* Key Features List */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-wrap gap-3 pt-2"
              >
                {['1 Slot Per Hari', 'Konfirmasi via Email', 'Notifikasi WhatsApp'].map((text) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/50 text-slate-600 text-xs font-bold shadow-sm"
                  >
                    <span>{text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Column: Visual Mockup / Feature Showcase Card */}
            <div className="hidden lg:flex lg:col-span-5 justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="relative bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 w-full max-w-md overflow-hidden"
              >
                {/* Accent bar */}
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#1e3a5f] to-[#2d6a9f]"></div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f]">
                        <Archive size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Metode Enkapsulasi</h4>
                        <p className="text-slate-400 text-xs">Standardisasi ANRI</p>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Bebas Asam
                    </span>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-700">Perlindungan Fisik Total</h5>
                        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                          Melapisi dokumen dengan polyester film bebas asam (acid-free) berkekuatan tinggi di kedua sisi.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-700">Mencegah Kerapuhan & Serangga</h5>
                        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                          Melindungi dari kelembapan udara, jamur, serta gigitan rayap dan serangga perusak kertas.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-700">Dapat Dikembalikan (Reversibel)</h5>
                        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                          Proses aman dan tidak merusak dokumen asli. Kertas dapat dilepas kembali kapan saja tanpa cacat.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
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
          className={`grid gap-6 items-start ${
            step === 3 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-[1fr_300px]'
          }`}
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
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
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
                    <p style={{ fontSize: '0.8rem', color: BK_COLORS.textMuted, margin: '4px 0 0 0' }}>
                      Klik pada tanggal yang tersedia untuk melanjutkan.
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
                        backgroundColor: BK_COLORS.surface,
                        border: `1px solid ${BK_COLORS.border}`,
                        color: BK_COLORS.primary,
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
