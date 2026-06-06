/**
 * ============================================================================
 * BookingCalendar.tsx — Kalender Interaktif Booking Enkapsulasi Arsip
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { BK_COLORS, BK_STATUS_COLORS, BK_FONTS, BK_RADIUS, BK_SHADOW } from '../constants/designTokens';
import type { CalendarDay } from '../types/booking.types';

import { getCalendarData } from '../services/bookingService';

// ─── Props ────────────────────────────────────────────────────────────────────
interface BookingCalendarProps {
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BULAN_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const HARI_HEADER = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toYMD(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Skeleton loading shimmer cell */
function SkeletonCell() {
  return (
    <div
      style={{
        borderRadius: BK_RADIUS.md,
        backgroundColor: '#e2e8f0',
        height: '44px',
        animation: 'pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
      }}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BookingCalendar({ onSelectDate, selectedDate }: BookingCalendarProps) {
  const today = new Date();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = forward, -1 = backward
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

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

  // Fetch calendar data when month/year changes
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCalendarData(currentYear, currentMonth + 1);
      setCalendarData(data);
    } catch (err) {
      console.error('Gagal memuat data kalender:', err);
      setCalendarData([]);
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Map date → status from API
  const statusMap = new Map<string, CalendarDay['status']>(
    calendarData.map((d) => [d.date, d.status])
  );

  // Navigation
  const goToPrevMonth = () => {
    setDirection(-1);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    setDirection(1);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Disable prev month if we're already at current month
  const isCurrentOrPast =
    currentYear < today.getFullYear() ||
    (currentYear === today.getFullYear() && currentMonth <= today.getMonth());

  // Build calendar grid
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

  // ─── Day cell rendering ──────────────────────────────────────────────────
  function renderDayCell(cellIndex: number) {
    const dayNumber = cellIndex - firstDayOfWeek + 1;

    // Empty cell (before first day)
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return <div key={`empty-${cellIndex}`} />;
    }

    const dateStr = toYMD(currentYear, currentMonth, dayNumber);
    const cellDate = new Date(currentYear, currentMonth, dayNumber);
    const isToday = dateStr === toYMD(today.getFullYear(), today.getMonth(), today.getDate());
    const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;
    const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isSelected = dateStr === selectedDate;

    // Determine status
    let status = statusMap.get(dateStr) ?? 'available';
    if (isPast || isWeekend) status = 'disabled';

    const isClickable = status === 'available' && !isPast && !isWeekend;

    // ─── Style calculation (Premium, Modern UI) ────────────────────────
    let cellBg = '#ffffff';
    let cellTextColor = BK_COLORS.text;
    let cellBorder = '1px solid transparent';
    let dotColor: string | null = null;
    let cursor = 'default';
    let tooltipText: string | null = null;
    let fontWeight: number = 400;

    if (isSelected) {
      cellBg = BK_COLORS.primary;
      cellTextColor = '#ffffff';
      fontWeight = 700;
      cellBorder = '1px solid transparent';
    } else if (status === 'disabled') {
      cellBg = '#f8fafc';
      cellTextColor = '#cbd5e1';
      cursor = 'not-allowed';
      cellBorder = '1px solid #f1f5f9';
    } else if (status === 'pending') {
      cellBg = '#fffbeb'; // soft amber
      cellTextColor = '#b45309'; // dark amber text
      dotColor = '#d97706';
      cursor = 'not-allowed';
      tooltipText = 'Sudah ada booking, menunggu konfirmasi';
      cellBorder = '1px solid #fef3c7';
    } else if (status === 'approved' || status === 'rescheduled') {
      cellBg = '#fef2f2'; // soft red
      cellTextColor = '#b91c1c'; // dark red text
      dotColor = '#ef4444';
      cursor = 'not-allowed';
      tooltipText = 'Tanggal ini sudah dipesan';
      cellBorder = '1px solid #fee2e2';
    } else if (status === 'available') {
      cellBg = '#ffffff';
      cellTextColor = '#1e293b'; // slate-800
      dotColor = BK_STATUS_COLORS.available.dot; // brand blue dot
      cursor = 'pointer';
      fontWeight = 600;
      cellBorder = '1px solid #e2e8f0'; // slate-200 subtle outline
    }

    if (isToday && !isSelected) {
      cellBorder = `2px solid ${BK_COLORS.accent}`;
    }

    return (
      <div
        key={dateStr}
        style={{ position: 'relative' }}
        onMouseEnter={(e) => {
          if (tooltipText) {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({ text: tooltipText, x: rect.left + rect.width / 2, y: rect.top - 8 });
          }
        }}
        onMouseLeave={() => setTooltip(null)}
      >
        <motion.button
          type="button"
          className="calendar-day-btn"
          whileHover={
            isClickable
              ? {
                  scale: 1.03,
                  backgroundColor: '#f8fafc',
                  borderColor: '#cbd5e1',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                }
              : {}
          }
          whileTap={isClickable ? { scale: 0.98 } : {}}
          disabled={!isClickable}
          onClick={() => isClickable && onSelectDate(dateStr)}
          style={{
            width: '100%',
            minHeight: '46px',
            borderRadius: '12px',
            backgroundColor: cellBg,
            color: cellTextColor,
            border: cellBorder,
            cursor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontFamily: BK_FONTS.sans,
            fontWeight,
            fontSize: '0.85rem',
            position: 'relative',
            overflow: 'hidden',
            transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
            boxShadow: isSelected ? `0 4px 12px ${BK_COLORS.primary}40` : isClickable ? BK_SHADOW.sm : 'none',
          }}
          title={tooltipText ?? undefined}
        >
          {/* Today indicator ring */}
          {isToday && !isSelected && (
            <span
              style={{
                position: 'absolute',
                top: 2,
                right: 4,
                fontSize: '0.45rem',
                color: BK_COLORS.accent,
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              HARI INI
            </span>
          )}

          <span>{dayNumber}</span>

          {/* Status dot */}
          {dotColor && !isSelected && (
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: dotColor,
                display: 'block',
              }}
            />
          )}
        </motion.button>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes bk-fadein {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .calendar-day-btn {
            aspect-ratio: 1 / 1 !important;
            min-height: 0 !important;
            padding: 2px !important;
            border-radius: 8px !important;
          }
          .calendar-grid-container {
            padding: 4px 8px 8px !important;
          }
          .calendar-nav-btn {
            width: 42px !important;
            height: 42px !important;
          }
        }
      `}</style>

      {/* Global tooltip rendered via portal-like fixed div */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            backgroundColor: BK_COLORS.primary,
            color: '#fff',
            padding: '6px 10px',
            borderRadius: BK_RADIUS.sm,
            fontSize: '0.72rem',
            fontFamily: BK_FONTS.sans,
            pointerEvents: 'none',
            zIndex: 9999,
            whiteSpace: 'nowrap',
            boxShadow: BK_SHADOW.md,
            animation: 'bk-fadein 0.15s ease',
          }}
        >
          {tooltip.text}
          <div
            style={{
              position: 'absolute',
              bottom: '-5px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: `5px solid ${BK_COLORS.primary}`,
            }}
          />
        </div>
      )}

      <div
        style={{
          backgroundColor: BK_COLORS.surfaceWhite,
          borderRadius: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.02), 0 10px 10px -5px rgba(0, 0, 0, 0.01), 0 0 0 1px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          fontFamily: BK_FONTS.sans,
        }}
      >
        {/* ── Header: navigation (Premium Clean White style) ── */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <motion.button
            type="button"
            className="calendar-nav-btn"
            whileHover={!isCurrentOrPast ? { scale: 1.05, backgroundColor: 'rgba(30, 58, 95, 0.08)' } : {}}
            whileTap={!isCurrentOrPast ? { scale: 0.95 } : {}}
            onClick={goToPrevMonth}
            disabled={isCurrentOrPast}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              backgroundColor: 'rgba(30, 58, 95, 0.04)',
              border: 'none',
              cursor: isCurrentOrPast ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isCurrentOrPast ? '#cbd5e1' : BK_COLORS.primary,
              transition: 'all 0.2s',
            }}
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft size={18} />
          </motion.button>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`${currentYear}-${currentMonth}`}
              custom={direction}
              initial={{ opacity: 0, y: direction * 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction * -10 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{
                textAlign: 'center',
                color: '#1e293b',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: BK_FONTS.display,
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    letterSpacing: '-0.025em',
                    color: '#0f172a',
                  }}
                >
                  {BULAN_ID[currentMonth]} {currentYear}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.button
            type="button"
            className="calendar-nav-btn"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(30, 58, 95, 0.08)' }}
            whileTap={{ scale: 0.95 }}
            onClick={goToNextMonth}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              backgroundColor: 'rgba(30, 58, 95, 0.04)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: BK_COLORS.primary,
              transition: 'all 0.2s',
            }}
            aria-label="Bulan berikutnya"
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>

        {/* ── Day names header ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            padding: '12px 16px 4px',
          }}
        >
          {HARI_HEADER.map((h, i) => (
            <div
              key={h}
              style={{
                textAlign: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: i === 0 ? BK_STATUS_COLORS.approved.dot : BK_COLORS.textMuted,
                paddingBottom: '4px',
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* ── Calendar grid ── */}
        <div className="calendar-grid-container" style={{ padding: '4px 16px 16px' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`grid-${currentYear}-${currentMonth}`}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '4px',
              }}
            >
              {loading
                ? Array.from({ length: 35 }).map((_, i) => <SkeletonCell key={i} />)
                : Array.from({ length: totalCells }).map((_, i) => renderDayCell(i))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Legend ── */}
        <div
          style={{
            borderTop: `1px solid ${BK_COLORS.border}`,
            padding: '12px 16px',
            backgroundColor: BK_COLORS.surface,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {[
            { dot: BK_STATUS_COLORS.available.dot, label: 'Tersedia' },
            { dot: BK_STATUS_COLORS.pending.dot, label: 'Pending' },
            { dot: BK_STATUS_COLORS.approved.dot, label: 'Sudah Dipesan' },
          ].map(({ dot, label }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.72rem',
                color: BK_COLORS.textMuted,
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: dot,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              {label}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
