/**
 * ============================================================================
 * AdminBookings.tsx — Dashboard Admin Manajemen Booking Enkapsulasi Arsip
 * ============================================================================
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  Table2,
  X,
  XCircle,
} from 'lucide-react';

import * as bookingService from '../../services/bookingService';
import { exportToExcel, exportToPDF } from '../../services/exportService';
import { BOOKING_STATUS_CONFIG, ALLOWED_TRANSITIONS } from '../../constants/bookingStatus';
import { BK_STATUS_COLORS } from '../../constants/designTokens';

import type {
  Booking,
  BookingAuditLog,
  BookingFilters,
  BookingStats,
  BookingStatus,
} from '../../types/booking.types';

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<{ value: BookingFilters['status']; label: string }> = [
  { value: 'all',         label: 'Semua Status' },
  { value: 'pending',     label: 'Pending' },
  { value: 'approved',    label: 'Disetujui' },
  { value: 'rejected',    label: 'Ditolak' },
  { value: 'rescheduled', label: 'Dijadwal Ulang' },
  { value: 'cancelled',   label: 'Dibatalkan' },
  { value: 'completed',   label: 'Selesai' },
];

type ModalType = 'approve' | 'reject' | 'reschedule' | 'complete' | 'cancel' | 'detail' | null;

interface ModalState {
  type:    ModalType;
  booking: Booking | null;
}

// ── Helper: format tanggal ────────────────────────────────────────────────────

const fmtDate = (iso: string | null | undefined) => {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const fmtDateTime = (iso: string | null | undefined) => {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

// ── StatusBadge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg  = BOOKING_STATUS_CONFIG[status];
  const clr  = BK_STATUS_COLORS[status];

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border"
      style={{
        backgroundColor: clr?.bg    ?? '#f3f4f6',
        color:           clr?.text  ?? '#374151',
        borderColor:     clr?.border ?? '#d1d5db',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: clr?.dot ?? '#6b7280' }}
      />
      {cfg?.labelShort ?? status}
    </span>
  );
}

// ── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label:  string;
  count:  number;
  icon:   React.ReactNode;
  bg:     string;
  text:   string;
  border: string;
}

function StatCard({ label, count, icon, bg, text, border }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: bg, color: text, border: `1px solid ${border}` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{count.toLocaleString('id-ID')}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

// ── Skeleton Row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 11 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-100 rounded" />
        </td>
      ))}
    </tr>
  );
}

// ── Overlay Modal Wrapper ─────────────────────────────────────────────────────

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  // Tutup saat klik backdrop
  const backdropRef = useRef<HTMLDivElement>(null);
  return (
    <motion.div
      ref={backdropRef}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ── Booking Summary (inside modal) ────────────────────────────────────────────

function BookingSummary({ booking }: { booking: Booking }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500">Pemohon</span>
        <span className="font-semibold text-gray-800">{booking.nama_lengkap}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Tanggal Booking</span>
        <span className="font-semibold text-gray-800">{fmtDate(booking.tanggal_booking)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Jenis Layanan</span>
        <span className="font-semibold text-gray-800 text-right max-w-[60%]">{booking.jenis_layanan}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">Status Saat Ini</span>
        <StatusBadge status={booking.status} />
      </div>
    </div>
  );
}

// ── Audit Log Timeline ────────────────────────────────────────────────────────

function AuditTimeline({ logs }: { logs: BookingAuditLog[] }) {
  if (logs.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-4">Belum ada riwayat perubahan.</p>
    );
  }

  return (
    <ol className="relative border-l border-gray-200 space-y-4 ml-2">
      {logs.map((log) => {
        const newClr = BK_STATUS_COLORS[log.new_status as BookingStatus] ?? BK_STATUS_COLORS.disabled;
        return (
          <li key={log.id} className="ml-4">
            <span
              className="absolute w-3 h-3 rounded-full -left-1.5 border-2 border-white"
              style={{ backgroundColor: newClr.dot }}
            />
            <p className="text-[11px] text-gray-400">{fmtDateTime(log.changed_at)}</p>
            <p className="text-sm font-semibold text-gray-800">
              {log.old_status
                ? `${BOOKING_STATUS_CONFIG[log.old_status as BookingStatus]?.labelShort ?? log.old_status} → ${BOOKING_STATUS_CONFIG[log.new_status as BookingStatus]?.labelShort ?? log.new_status}`
                : `Dibuat dengan status ${BOOKING_STATUS_CONFIG[log.new_status as BookingStatus]?.labelShort ?? log.new_status}`
              }
            </p>
            {log.note && <p className="text-xs text-gray-500 mt-0.5">{log.note}</p>}
            {log.changed_by && (
              <p className="text-[11px] text-gray-400">oleh: {log.changed_by}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function AdminBookings() {
  // ── Data state ───────────────────────────────────────────────────────────
  const [bookings,    setBookings]    = useState<Booking[]>([]);
  const [stats,       setStats]       = useState<BookingStats | null>(null);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [isLoading,   setIsLoading]   = useState(true);
  const [errorMsg,    setErrorMsg]    = useState('');

  // ── Filters ──────────────────────────────────────────────────────────────
  const [filterStatus,    setFilterStatus]    = useState<BookingFilters['status']>('all');
  const [filterDateFrom,  setFilterDateFrom]  = useState('');
  const [filterDateTo,    setFilterDateTo]    = useState('');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [currentPage,     setCurrentPage]     = useState(1);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [expandedRow,  setExpandedRow]  = useState<string | null>(null);
  const [modal,        setModal]        = useState<ModalState>({ type: null, booking: null });
  const [auditLogs,    setAuditLogs]    = useState<BookingAuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [showExport,   setShowExport]   = useState(false);

  // ── Modal form state ──────────────────────────────────────────────────────
  const [modalNote,    setModalNote]    = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [reschedDate,  setReschedDate]  = useState('');
  const [reschedNote,  setReschedNote]  = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Load data ────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const [result, statsData] = await Promise.all([
        bookingService.getBookings({
          status:       filterStatus,
          tanggal_from: filterDateFrom || undefined,
          tanggal_to:   filterDateTo   || undefined,
          search:       searchQuery    || undefined,
          page:         currentPage,
          limit:        PAGE_SIZE,
        }),
        bookingService.getBookingStats(),
      ]);

      setBookings(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setStats(statsData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat data booking.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, filterDateFrom, filterDateTo, searchQuery, currentPage]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Reset halaman saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterDateFrom, filterDateTo, searchQuery]);

  // ── Pagination ───────────────────────────────────────────────────────────

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: Array<number | '...'> = [1];
    const start = Math.max(2, currentPage - 1);
    const end   = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) pages.push('...');
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  // ── Modal helpers ─────────────────────────────────────────────────────────

  const openModal = (type: ModalType, booking: Booking) => {
    setModal({ type, booking });
    setModalNote('');
    setRejectReason('');
    setReschedDate('');
    setReschedNote('');
  };

  const closeModal = () => {
    setModal({ type: null, booking: null });
  };

  const openDetailModal = async (booking: Booking) => {
    openModal('detail', booking);
    setAuditLoading(true);
    const logs = await bookingService.getAuditLogs(booking.id);
    setAuditLogs(logs);
    setAuditLoading(false);
  };

  // ── Action handlers ───────────────────────────────────────────────────────

  const handleApprove = async () => {
    if (!modal.booking) return;
    setIsSubmitting(true);
    const res = await bookingService.updateBookingStatus(modal.booking.id, 'approved', { note: modalNote || undefined });
    setIsSubmitting(false);
    if (res.success) {
      toast.success('Booking berhasil disetujui.');
      closeModal();
      void loadData();
    } else {
      toast.error(res.message);
    }
  };

  const handleReject = async () => {
    if (!modal.booking || !rejectReason.trim()) return;
    setIsSubmitting(true);
    const res = await bookingService.updateBookingStatus(modal.booking.id, 'rejected', { note: rejectReason });
    setIsSubmitting(false);
    if (res.success) {
      toast.success('Booking berhasil ditolak.');
      closeModal();
      void loadData();
    } else {
      toast.error(res.message);
    }
  };

  const handleReschedule = async () => {
    if (!modal.booking || !reschedDate || !reschedNote.trim()) return;
    setIsSubmitting(true);
    const res = await bookingService.proposeReschedule(modal.booking.id, {
      reschedule_date: reschedDate,
      reschedule_note: reschedNote,
    });
    setIsSubmitting(false);
    if (res.success) {
      toast.success('Usulan jadwal ulang berhasil dikirim.');
      closeModal();
      void loadData();
    } else {
      toast.error(res.message);
    }
  };

  const handleComplete = async () => {
    if (!modal.booking) return;
    setIsSubmitting(true);
    const res = await bookingService.updateBookingStatus(modal.booking.id, 'completed', { note: modalNote || undefined });
    setIsSubmitting(false);
    if (res.success) {
      toast.success('Booking berhasil ditandai selesai.');
      closeModal();
      void loadData();
    } else {
      toast.error(res.message);
    }
  };

  const handleCancel = async () => {
    if (!modal.booking) return;
    setIsSubmitting(true);
    const res = await bookingService.updateBookingStatus(modal.booking.id, 'cancelled', { note: modalNote || undefined });
    setIsSubmitting(false);
    if (res.success) {
      toast.success('Booking berhasil dibatalkan.');
      closeModal();
      void loadData();
    } else {
      toast.error(res.message);
    }
  };

  // ── Export handlers ───────────────────────────────────────────────────────

  const handleExport = async (format: 'excel' | 'pdf') => {
    setShowExport(false);
    toast.info('Menyiapkan data untuk diekspor...');
    const data = await bookingService.getAllBookingsForExport({
      status:       filterStatus,
      tanggal_from: filterDateFrom || undefined,
      tanggal_to:   filterDateTo   || undefined,
      search:       searchQuery    || undefined,
    });

    if (data.length === 0) {
      toast.warning('Tidak ada data untuk filter yang dipilih.');
      return;
    }

    if (format === 'excel') {
      exportToExcel(data);
      toast.success(`Berhasil mengekspor ${data.length} data ke Excel.`);
    } else {
      exportToPDF(data);
      toast.success(`Berhasil mengekspor ${data.length} data ke PDF.`);
    }
  };

  // ── Reset filters ─────────────────────────────────────────────────────────

  const resetFilters = () => {
    setFilterStatus('all');
    setFilterDateFrom('');
    setFilterDateTo('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filterStatus !== 'all' || filterDateFrom !== '' || filterDateTo !== '' || searchQuery !== '';

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="pb-20">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Booking Enkapsulasi Arsip</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola permohonan layanan enkapsulasi arsip — setujui, tolak, jadwal ulang, atau selesaikan
          </p>
        </div>
        <button
          onClick={() => void loadData()}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Error Banner ─────────────────────────────────────────────────── */}
      {errorMsg && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <XCircle size={16} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* ── Stats Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Booking"
          count={stats?.total ?? 0}
          icon={<Table2 size={20} />}
          bg={BK_STATUS_COLORS.completed.bg}
          text={BK_STATUS_COLORS.completed.text}
          border={BK_STATUS_COLORS.completed.border}
        />
        <StatCard
          label="Menunggu Konfirmasi"
          count={stats?.pending ?? 0}
          icon={<Clock size={20} />}
          bg={BK_STATUS_COLORS.pending.bg}
          text={BK_STATUS_COLORS.pending.text}
          border={BK_STATUS_COLORS.pending.border}
        />
        <StatCard
          label="Disetujui (Confirmed)"
          count={stats?.approved ?? 0}
          icon={<CheckCircle size={20} />}
          bg={BK_STATUS_COLORS.approved.bg}
          text={BK_STATUS_COLORS.approved.text}
          border={BK_STATUS_COLORS.approved.border}
        />
        <StatCard
          label="Selesai"
          count={stats?.completed ?? 0}
          icon={<Shield size={20} />}
          bg={BK_STATUS_COLORS.rescheduled.bg}
          text={BK_STATUS_COLORS.rescheduled.text}
          border={BK_STATUS_COLORS.rescheduled.border}
        />
      </div>

      {/* ── Filter Toolbar ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3 flex-wrap">

          {/* Status dropdown */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus ?? 'all'}
              onChange={(e) => setFilterStatus(e.target.value as BookingFilters['status'])}
              className="pl-8 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none appearance-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value ?? 'all'}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                max={filterDateTo || undefined}
                className="pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
                title="Dari Tanggal"
                placeholder="Dari Tanggal"
              />
            </div>
            <span className="text-gray-400 text-sm">s/d</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              min={filterDateFrom || undefined}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
              title="Sampai Tanggal"
            />
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, atau WhatsApp..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
            />
          </div>

          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExport((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] text-white text-sm font-semibold rounded-xl hover:bg-[#16304f] transition-colors"
            >
              <Download size={15} />
              Ekspor
              <ChevronDown size={13} className={`transition-transform ${showExport ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showExport && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden"
                >
                  <button
                    onClick={() => void handleExport('excel')}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Table2 size={15} className="text-emerald-600" />
                    📊 Ekspor Excel
                  </button>
                  <button
                    onClick={() => void handleExport('pdf')}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-50 transition-colors"
                  >
                    <FileText size={15} className="text-red-500" />
                    📄 Ekspor PDF
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={14} />
              Reset Filter
            </button>
          )}
        </div>

        {/* Filter summary */}
        <div className="mt-3 pt-3 border-t border-gray-50">
          <p className="text-xs text-gray-400">
            Menampilkan <span className="font-semibold text-gray-600">{bookings.length}</span> dari{' '}
            <span className="font-semibold text-gray-600">{total}</span> booking
            {hasActiveFilters && ' (difilter)'}
          </p>
        </div>
      </div>

      {/* ── Data Table ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  'No', 'Tanggal Dibuat', 'Nama', 'WhatsApp', 'Email',
                  'Instansi', 'Jenis Layanan', 'Jml Dok', 'Tanggal Booking', 'Status', 'Aksi',
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                : bookings.length === 0
                  ? (
                    <tr>
                      <td colSpan={11}>
                        <div className="text-center py-20">
                          <Clock size={48} className="mx-auto text-gray-200 mb-4" />
                          <p className="text-gray-400 font-medium">Belum ada booking</p>
                          <p className="text-xs text-gray-300 mt-1">
                            {hasActiveFilters ? 'Coba ubah filter pencarian' : 'Booking akan muncul di sini setelah ada permohonan masuk'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                  : bookings.map((booking, idx) => (
                    <>
                      <motion.tr
                        key={booking.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50/60 transition-colors cursor-pointer group"
                        onClick={() => setExpandedRow(expandedRow === booking.id ? null : booking.id)}
                      >
                        {/* No */}
                        <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                          {(currentPage - 1) * PAGE_SIZE + idx + 1}
                        </td>
                        {/* Tanggal Dibuat */}
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {fmtDate(booking.created_at)}
                        </td>
                        {/* Nama */}
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800 whitespace-nowrap">{booking.nama_lengkap}</p>
                        </td>
                        {/* WhatsApp */}
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {booking.whatsapp}
                        </td>
                        {/* Email */}
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate">
                          {booking.email}
                        </td>
                        {/* Instansi */}
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">
                          {booking.instansi ?? '-'}
                        </td>
                        {/* Jenis Layanan */}
                        <td className="px-4 py-3 text-xs text-gray-600 max-w-[160px]">
                          <span className="line-clamp-2">{booking.jenis_layanan}</span>
                        </td>
                        {/* Jml Dok */}
                        <td className="px-4 py-3 text-xs text-gray-500 text-center">
                          {booking.jumlah_dokumen.toLocaleString('id-ID')}
                        </td>
                        {/* Tanggal Booking */}
                        <td className="px-4 py-3 text-xs font-semibold text-gray-700 whitespace-nowrap">
                          {fmtDate(booking.tanggal_booking)}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={booking.status} />
                        </td>
                        {/* Aksi */}
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5 flex-nowrap">
                            {/* Setujui */}
                            {(ALLOWED_TRANSITIONS[booking.status].includes('approved')) && (
                              <button
                                title="Setujui"
                                onClick={() => openModal('approve', booking)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            {/* Tolak */}
                            {ALLOWED_TRANSITIONS[booking.status].includes('rejected') && (
                              <button
                                title="Tolak"
                                onClick={() => openModal('reject', booking)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            )}
                            {/* Jadwal Ulang */}
                            {ALLOWED_TRANSITIONS[booking.status].includes('rescheduled') && (
                              <button
                                title="Jadwal Ulang"
                                onClick={() => openModal('reschedule', booking)}
                                className="p-1.5 rounded-lg text-violet-600 hover:bg-violet-50 transition-colors"
                              >
                                <Calendar size={16} />
                              </button>
                            )}
                            {/* Selesai */}
                            {ALLOWED_TRANSITIONS[booking.status].includes('completed') && (
                              <button
                                title="Tandai Selesai"
                                onClick={() => openModal('complete', booking)}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <Shield size={16} />
                              </button>
                            )}
                            {/* Batalkan */}
                            {ALLOWED_TRANSITIONS[booking.status].includes('cancelled') && (
                              <button
                                title="Batalkan"
                                onClick={() => openModal('cancel', booking)}
                                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                            {/* Detail */}
                            <button
                              title="Detail"
                              onClick={() => void openDetailModal(booking)}
                              className="p-1.5 rounded-lg text-[#1e3a5f] hover:bg-[#1e3a5f]/10 transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>

                      {/* Expanded row */}
                      <AnimatePresence>
                        {expandedRow === booking.id && (
                          <motion.tr
                            key={`${booking.id}-expanded`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <td colSpan={11} className="px-6 pb-4 bg-gray-50/70">
                              <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {booking.catatan && (
                                  <div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Catatan Pemohon</p>
                                    <p className="text-sm text-gray-700 bg-white rounded-xl p-3 border border-gray-100">
                                      {booking.catatan}
                                    </p>
                                  </div>
                                )}
                                {booking.status === 'rescheduled' && booking.reschedule_date && (
                                  <div>
                                    <p className="text-[11px] font-bold text-violet-500 uppercase tracking-wider mb-1">Info Jadwal Ulang</p>
                                    <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
                                      <p className="text-sm font-semibold text-violet-800">
                                        Tanggal Baru: {fmtDate(booking.reschedule_date)}
                                      </p>
                                      {booking.reschedule_note && (
                                        <p className="text-xs text-violet-600 mt-1">{booking.reschedule_note}</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {!booking.catatan && booking.status !== 'rescheduled' && (
                                  <p className="text-xs text-gray-400 col-span-2 py-2">Tidak ada informasi tambahan.</p>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            Menampilkan <span className="font-semibold">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, total)}</span> dari{' '}
            <span className="font-semibold">{total}</span> booking
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {visiblePages.map((page, idx) =>
              page === '...'
                ? <span key={`dots-${idx}`} className="px-2 text-gray-400">...</span>
                : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                      currentPage === page
                        ? 'bg-[#1e3a5f] text-white shadow-sm'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS
         ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>

        {/* ── Approve Modal ──────────────────────────────────────────────── */}
        {modal.type === 'approve' && modal.booking && (
          <ModalOverlay onClose={closeModal}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Konfirmasi Persetujuan</h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              <BookingSummary booking={modal.booking} />
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Catatan / Keterangan <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  rows={3}
                  placeholder="Catatan tambahan untuk audit log..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
                />
              </div>
              <div className="mt-5 flex gap-3 justify-end">
                <button onClick={closeModal} className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button
                  onClick={() => void handleApprove()}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                  Setujui Booking
                </button>
              </div>
            </div>
          </ModalOverlay>
        )}

        {/* ── Reject Modal ───────────────────────────────────────────────── */}
        {modal.type === 'reject' && modal.booking && (
          <ModalOverlay onClose={closeModal}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Tolak Booking</h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              <BookingSummary booking={modal.booking} />
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  placeholder="Jelaskan alasan mengapa booking ini ditolak..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
                />
                {!rejectReason.trim() && (
                  <p className="text-xs text-red-400 mt-1">Alasan penolakan wajib diisi.</p>
                )}
              </div>
              <div className="mt-5 flex gap-3 justify-end">
                <button onClick={closeModal} className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button
                  onClick={() => void handleReject()}
                  disabled={isSubmitting || !rejectReason.trim()}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                  Tolak Booking
                </button>
              </div>
            </div>
          </ModalOverlay>
        )}

        {/* ── Reschedule Modal ───────────────────────────────────────────── */}
        {modal.type === 'reschedule' && modal.booking && (
          <ModalOverlay onClose={closeModal}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Usulan Jadwal Ulang</h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              <BookingSummary booking={modal.booking} />

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Tanggal Baru yang Diusulkan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      value={reschedDate}
                      onChange={(e) => setReschedDate(e.target.value)}
                      min={getTomorrow()}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Alasan / Keterangan untuk Pemohon <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reschedNote}
                    onChange={(e) => setReschedNote(e.target.value)}
                    rows={4}
                    placeholder="Jelaskan alasan perubahan jadwal dan instruksi selanjutnya untuk pemohon..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none"
                  />
                </div>

                <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3">
                  <Clock size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Email notifikasi akan dikirim ke pemohon dengan informasi tanggal baru untuk dikonfirmasi.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-3 justify-end">
                <button onClick={closeModal} className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button
                  onClick={() => void handleReschedule()}
                  disabled={isSubmitting || !reschedDate || !reschedNote.trim()}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                  Kirim Usulan
                </button>
              </div>
            </div>
          </ModalOverlay>
        )}

        {/* ── Complete Modal ─────────────────────────────────────────────── */}
        {modal.type === 'complete' && modal.booking && (
          <ModalOverlay onClose={closeModal}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Tandai Booking Selesai</h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              <BookingSummary booking={modal.booking} />
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Catatan Penyelesaian <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  rows={3}
                  placeholder="Catatan hasil layanan enkapsulasi..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                />
              </div>
              <div className="mt-5 flex gap-3 justify-end">
                <button onClick={closeModal} className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button
                  onClick={() => void handleComplete()}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                  Konfirmasi Selesai
                </button>
              </div>
            </div>
          </ModalOverlay>
        )}

        {/* ── Cancel Modal ───────────────────────────────────────────────── */}
        {modal.type === 'cancel' && modal.booking && (
          <ModalOverlay onClose={closeModal}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Batalkan Booking</h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              <BookingSummary booking={modal.booking} />
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Alasan Pembatalan <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  rows={3}
                  placeholder="Alasan pembatalan booking ini..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none"
                />
              </div>
              <div className="mt-5 flex gap-3 justify-end">
                <button onClick={closeModal} className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button
                  onClick={() => void handleCancel()}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-600 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                  Batalkan Booking
                </button>
              </div>
            </div>
          </ModalOverlay>
        )}

        {/* ── Detail Modal ───────────────────────────────────────────────── */}
        {modal.type === 'detail' && modal.booking && (
          <ModalOverlay onClose={closeModal}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Detail Booking</h2>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {modal.booking.id}</p>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Full booking info */}
              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Nama Lengkap',      value: modal.booking.nama_lengkap },
                    { label: 'WhatsApp',           value: modal.booking.whatsapp },
                    { label: 'Email',              value: modal.booking.email },
                    { label: 'Instansi',           value: modal.booking.instansi ?? '-' },
                    { label: 'Jenis Layanan',      value: modal.booking.jenis_layanan },
                    { label: 'Jumlah Dokumen',     value: modal.booking.jumlah_dokumen.toLocaleString('id-ID') },
                    { label: 'Tanggal Booking',    value: fmtDate(modal.booking.tanggal_booking) },
                    { label: 'Tanggal Dibuat',     value: fmtDateTime(modal.booking.created_at) },
                    { label: 'Terakhir Diperbarui',value: fmtDateTime(modal.booking.updated_at) },
                  ].map(({ label, value }) => (
                    <div key={label} className="col-span-1">
                      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
                      <p className="text-sm text-gray-800 font-medium mt-0.5">{value}</p>
                    </div>
                  ))}

                  {/* Status spans full */}
                  <div className="col-span-2">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Status</p>
                    <StatusBadge status={modal.booking.status} />
                  </div>
                </div>

                {modal.booking.catatan && (
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Catatan Pemohon</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{modal.booking.catatan}</p>
                  </div>
                )}

                {modal.booking.status === 'rescheduled' && modal.booking.reschedule_date && (
                  <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
                    <p className="text-[11px] text-violet-500 font-bold uppercase tracking-wider mb-1">Jadwal Ulang</p>
                    <p className="text-sm font-semibold text-violet-800">Tanggal Baru: {fmtDate(modal.booking.reschedule_date)}</p>
                    {modal.booking.reschedule_note && (
                      <p className="text-xs text-violet-600 mt-1">{modal.booking.reschedule_note}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Audit Log */}
              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Clock size={15} className="text-gray-400" />
                  Riwayat Perubahan Status
                </h3>
                {auditLoading
                  ? (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <RefreshCw size={12} className="animate-spin" />
                      Memuat riwayat...
                    </div>
                  )
                  : <AuditTimeline logs={auditLogs} />
                }
              </div>

              <div className="mt-5 flex justify-end">
                <button onClick={closeModal} className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  Tutup
                </button>
              </div>
            </div>
          </ModalOverlay>
        )}

      </AnimatePresence>

      {/* Close export dropdown when clicking outside */}
      {showExport && (
        <div className="fixed inset-0 z-10" onClick={() => setShowExport(false)} />
      )}
    </div>
  );
}
