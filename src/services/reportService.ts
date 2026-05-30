import { v4 as uuidv4 } from 'uuid';
import { DB_KEYS } from './db';
import { supabase } from './supabase';

export interface Report {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  kategori: string;
  pesan: string;
  alamat: string;
  tanggal: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportInput {
  nama: string;
  email: string;
  telepon: string;
  kategori: string;
  pesan: string;
  alamat: string;
}

export interface ReportListResult {
  success: boolean;
  message: string;
  reports: Report[];
}

const REPORTS_TABLE = 'warga_reports';
const REPORTS_MIGRATED_FLAG = 'disipusda_reports_migrated_v1';
const LEGACY_REPORTS_KEY = DB_KEYS.REPORTS;

const normalizeReport = (
  row: Partial<Report> & { id?: number | string; created_at?: string; updated_at?: string },
): Report => {
  const createdAt = row.created_at || row.updated_at || '';

  return {
    id: String(row.id || ''),
    nama: row.nama || '',
    email: row.email || '',
    telepon: row.telepon || '',
    kategori: row.kategori || '',
    pesan: row.pesan || '',
    alamat: row.alamat || '',
    tanggal: row.tanggal || (createdAt ? new Date(createdAt).toLocaleString('id-ID') : ''),
    status: row.status || 'Baru',
    createdAt: row.createdAt || createdAt || undefined,
    updatedAt: row.updatedAt || row.updated_at || createdAt || undefined,
  };
};

const sortReports = (reports: Report[]) =>
  [...reports].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : Number.parseInt(a.id, 10) || 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : Number.parseInt(b.id, 10) || 0;
    return bTime - aTime;
  });

const readLegacyReports = (): Report[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(LEGACY_REPORTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Array<Partial<Report> & { id?: number | string }>;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeReport)
      .filter(report => Boolean(report.id && report.nama && report.pesan));
  } catch {
    return [];
  }
};

const writeLegacyReports = (reports: Report[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LEGACY_REPORTS_KEY, JSON.stringify(reports));
};

const removeLegacyReport = (id: string) => {
  if (typeof window === 'undefined') return;

  const remainingReports = readLegacyReports().filter(report => report.id !== id);
  writeLegacyReports(remainingReports);
};

const syncLegacyReports = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  if (window.localStorage.getItem(REPORTS_MIGRATED_FLAG) === 'true') return;

  const legacyReports = readLegacyReports();
  if (legacyReports.length === 0) {
    window.localStorage.setItem(REPORTS_MIGRATED_FLAG, 'true');
    return;
  }

  const { data: existingRows, error: selectError } = await supabase
    .from(REPORTS_TABLE)
    .select('id');

  if (selectError) throw selectError;

  const existingIds = new Set((existingRows || []).map(row => String(row.id)));
  const missingRows = legacyReports.filter(report => !existingIds.has(report.id));

  if (missingRows.length > 0) {
    const { error: upsertError } = await supabase
      .from(REPORTS_TABLE)
      .upsert(missingRows, { onConflict: 'id' });

    if (upsertError) throw upsertError;
  }

  window.localStorage.setItem(REPORTS_MIGRATED_FLAG, 'true');
};

export const getReports = async (): Promise<ReportListResult> => {
  try {
    await syncLegacyReports();

    const { data, error } = await supabase
      .from(REPORTS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const reports = sortReports((data || []).map(row => normalizeReport(row as Report & { created_at?: string; updated_at?: string })));
    return { success: true, message: 'Laporan berhasil dimuat dari Supabase.', reports };
  } catch (error) {
    const fallbackMessage = error instanceof Error ? error.message : 'Gagal memuat laporan dari Supabase.';
    return {
      success: false,
      message: `${fallbackMessage} Menampilkan data lokal sementara.`,
      reports: sortReports(readLegacyReports()),
    };
  }
};

export const createReport = async (input: ReportInput): Promise<{ success: boolean; message: string; report?: Report }> => {
  const report: Report = {
    id: uuidv4(),
    ...input,
    tanggal: new Date().toLocaleString('id-ID'),
    status: 'Baru',
  };

  try {
    const { data, error } = await supabase
      .from(REPORTS_TABLE)
      .insert(report)
      .select('*')
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'Laporan berhasil dikirim dan tersimpan di database.',
      report: normalizeReport(data as Report),
    };
  } catch (error) {
    const legacyReports = readLegacyReports();
    legacyReports.unshift(report);
    writeLegacyReports(legacyReports);

    const fallbackMessage = error instanceof Error ? error.message : 'Gagal menyimpan ke Supabase.';
    return {
      success: true,
      message: `${fallbackMessage} Laporan disimpan sementara di penyimpanan lokal.`,
      report,
    };
  }
};

export const deleteReport = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { error } = await supabase
      .from(REPORTS_TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;

    removeLegacyReport(id);
    return { success: true, message: 'Laporan berhasil dihapus.' };
  } catch (error) {
    removeLegacyReport(id);
    const fallbackMessage = error instanceof Error ? error.message : 'Gagal menghapus laporan dari Supabase.';
    return { success: false, message: fallbackMessage };
  }
};