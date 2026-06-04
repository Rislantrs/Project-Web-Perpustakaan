import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router';
import { useEffect, useRef, Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorBoundaryFallback from './components/ErrorBoundaryFallback';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Kearsipan from './pages/Kearsipan';
import Diorama from './pages/Diorama';
import Perpustakaan from './pages/Perpustakaan';
import Sejarah from './pages/Sejarah';
import StrukturOrganisasi from './pages/StrukturOrganisasi';
import Prestasi from './pages/Prestasi';
import Login from './pages/Login';
import Register from './pages/Register';
import RiwayatPinjaman from './pages/RiwayatPinjaman';
import Profil from './pages/Profil';
import ForgotPassword from './pages/ForgotPassword';
import AuthCallback from './pages/AuthCallback';
import AuthVerifyCode from './pages/AuthVerifyCode';
import AuthUpdatePassword from './pages/AuthUpdatePassword';
import NotFound from './pages/NotFound';
import BlogList from './pages/BlogList';
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
import Galendo from './pages/Galendo';
import Ppid from './pages/Ppid';
import ZonaIntegritas from './pages/ZonaIntegritas';
import Referensi from './pages/Referensi';
import JasaKearsipan from './pages/JasaKearsipan';
const KatalogBuku = lazy(() => import('./pages/KatalogBuku'));
import LaporWarga from './pages/LaporWarga';
import Pabukon from './pages/Pabukon';
import LayananRentan from './pages/LayananRentan';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import LoginAdmin from './pages/admin/LoginAdmin';

// Admin Pages (Lazy Loaded for Performance)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageArticles = lazy(() => import('./pages/admin/ManageArticles'));
const ArticleEditor = lazy(() => import('./pages/admin/ArticleEditor'));
const ManageMedia = lazy(() => import('./pages/admin/ManageMedia'));
const MediaEditor = lazy(() => import('./pages/admin/MediaEditor'));
const ManageBooks = lazy(() => import('./pages/admin/ManageBooks'));
const BookEditor = lazy(() => import('./pages/admin/BookEditor'));
const ManageCategories = lazy(() => import('./pages/admin/ManageCategories'));
const ManageAdmins = lazy(() => import('./pages/admin/ManageAdmins'));
const ManageMembers = lazy(() => import('./pages/admin/ManageMembers'));
const ManageBorrows = lazy(() => import('./pages/admin/ManageBorrows'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const ManageReports = lazy(() => import('./pages/admin/ManageReports'));
const ManageSchedules = lazy(() => import('./pages/admin/ManageSchedules'));
const ManageStructure = lazy(() => import('./pages/admin/ManageStructure'));
const ManagePpid = lazy(() => import('./pages/admin/ManagePpid'));
import JadwalLayanan from './pages/JadwalLayanan';
import { SITE_CONFIG } from './config/siteConfig';

// Booking Module (Lazy Loaded — Modul Mandiri)
const BookingPage = lazy(() => import('./modules/booking/pages/BookingPage'));
const RescheduleConfirm = lazy(() => import('./modules/booking/pages/RescheduleConfirm'));
const AdminBookings = lazy(() => import('./modules/booking/pages/admin/AdminBookings'));

import { refreshHomeArticles, migrateLegacyArticleImages, refreshCategories } from './services/dataService';
import { refreshSettings } from './services/settingsService';
import { refreshBooks, migrateLegacyBookCovers } from './services/bookService';
import { refreshMembersFromSupabase } from './services/supabaseAuthService';

// Otomatis menggulirkan halaman ke atas saat rute berpindah
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

import { supabase } from './services/supabase';

const realtimeEnabled = import.meta.env.VITE_ENABLE_REALTIME === 'true';

function App() {
  const hasInitialized = useRef(false);

  // Sinkronisasi data global saat aplikasi pertama kali dijalankan
  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    // 1. Sinkronisasi awal di latar belakang
    refreshHomeArticles();
    refreshCategories();
    refreshSettings();
    refreshBooks();
    void refreshMembersFromSupabase();
    migrateLegacyArticleImages();
    migrateLegacyBookCovers();
    
    // 2. Mengaktifkan fitur real-time untuk mendengarkan perubahan data di Supabase
    const channel = realtimeEnabled
      ? supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public' },
            (payload) => {
              // Memperbarui data lokal secara cerdas berdasarkan tabel yang berubah
              const table = payload.table;
              console.log(`Perubahan real-time terdeteksi pada tabel ${table}:`, payload.eventType);
              
              if (table === 'articles') refreshHomeArticles();
              else if (['settings', 'schedules', 'achievements', 'structure'].includes(table)) refreshSettings();
              else if (table === 'categories') refreshCategories();
              else if (table === 'members') void refreshMembersFromSupabase();
              else if (['books', 'borrows', 'queue'].includes(table)) refreshBooks();
              
              // Memicu pembaruan antarmuka secara global
              window.dispatchEvent(new CustomEvent('dbChange', { detail: { key: table } }));
            }
          )
          .subscribe()
      : null;

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorBoundaryFallback}
      onReset={() => {
        window.location.href = '/';
      }}
    >
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="kearsipan" element={<Kearsipan />} />
            <Route path="bale-panyawangan" element={<Diorama />} />
            <Route path="perpustakaan" element={<Perpustakaan />} />
            <Route path="profil/sejarah" element={<Sejarah />} />
            <Route path="profil/struktur" element={<StrukturOrganisasi />} />
            <Route path="profil/prestasi" element={<Prestasi />} />
            <Route path="artikel" element={<BlogList />} />
            <Route path="artikel/:slug" element={
              <Suspense fallback={<div className="py-20 flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-primary-10 border-t-brand-accent rounded-full animate-spin"/></div>}>
                <ArticleDetail />
              </Suspense>
            } />
            <Route path="galendo" element={<Galendo />} />
            <Route path="ppid" element={<Ppid />} />
            <Route path="zona-integritas" element={<ZonaIntegritas />} />
            <Route path="riwayat-pinjaman" element={
               SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <RiwayatPinjaman /> : <Navigate to="/" replace />
             } />
            <Route path="pabukon" element={<Pabukon />} />
            <Route path="lapor-warga" element={<LaporWarga />} />
            <Route path="jadwal" element={<JadwalLayanan />} />
            <Route path="referensi" element={<Referensi />} />
            <Route path="katalog" element={
               SITE_CONFIG.FEATURES.ENABLE_CATALOG ? (
                 <Suspense fallback={<div className="py-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-primary-10 border-t-brand-accent rounded-full animate-spin"/></div>}>
                   <KatalogBuku />
                 </Suspense>
               ) : <Navigate to="/" replace />
             } />
            <Route path="jasa-kearsipan" element={<JasaKearsipan />} />
            <Route path="layanan-rentan" element={<LayananRentan />} />
            {/* Booking Enkapsulasi Arsip — Modul Mandiri */}
            <Route path="booking-enkapsulasi" element={
              SITE_CONFIG.FEATURES.ENABLE_BOOKING ? (
                <Suspense fallback={<div className="py-20 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-200 border-t-[#1e3a5f] rounded-full animate-spin"/></div>}>
                  <BookingPage />
                </Suspense>
              ) : <Navigate to="/" replace />
            } />
            <Route path="booking-enkapsulasi/konfirmasi-reschedule" element={
              SITE_CONFIG.FEATURES.ENABLE_BOOKING ? (
                <Suspense fallback={<div className="py-20 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-200 border-t-[#1e3a5f] rounded-full animate-spin"/></div>}>
                  <RescheduleConfirm />
                </Suspense>
              ) : <Navigate to="/" replace />
            } />
          </Route>

          {/* Rute Autentikasi Anggota */}
          <Route path="/login" element={
            SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <Login /> : <Navigate to="/" replace />
          } />
          <Route path="/register" element={
            SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <Register /> : <Navigate to="/" replace />
          } />
          <Route path="/forgot-password" element={
            SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <ForgotPassword /> : <Navigate to="/" replace />
          } />
          <Route path="/auth/callback" element={
            SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <AuthCallback /> : <Navigate to="/" replace />
          } />
          <Route path="/auth/verify" element={
            SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <AuthVerifyCode /> : <Navigate to="/" replace />
          } />
          <Route path="/auth/update-password" element={
            SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <AuthUpdatePassword /> : <Navigate to="/" replace />
          } />
          <Route path="/login-admin" element={<LoginAdmin />} />
          <Route path="/profil" element={
            SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <Profil /> : <Navigate to="/" replace />
          } />

          {/* Rute Panel Admin */}
          <Route path="/admin" element={
            <Suspense fallback={
              <div className="h-screen w-full flex items-center justify-center p-6 bg-white overflow-hidden overflow-y-auto">
                <div className="w-10 h-10 border-4 border-brand-primary-10 border-t-brand-accent rounded-full animate-spin"></div>
              </div>
            }>
              <AdminLayout />
            </Suspense>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="articles" element={<ManageArticles />} />
            <Route path="articles/new" element={<ArticleEditor />} />
            <Route path="articles/edit/:id" element={<ArticleEditor />} />
            <Route path="media" element={<ManageMedia />} />
            <Route path="media/new" element={<MediaEditor />} />
            <Route path="media/edit/:id" element={<MediaEditor />} />
            <Route path="books" element={
              SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <ManageBooks /> : <Navigate to="/admin" replace />
            } />
            <Route path="books/new" element={
              SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <BookEditor /> : <Navigate to="/admin" replace />
            } />
            <Route path="books/edit/:id" element={
              SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <BookEditor /> : <Navigate to="/admin" replace />
            } />
            <Route path="categories" element={
              SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <ManageCategories /> : <Navigate to="/admin" replace />
            } />
            <Route path="admins" element={<ManageAdmins />} />
            <Route path="members" element={
              SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <ManageMembers /> : <Navigate to="/admin" replace />
            } />
            <Route path="borrows" element={
              SITE_CONFIG.FEATURES.ENABLE_CATALOG ? <ManageBorrows /> : <Navigate to="/admin" replace />
            } />
            <Route path="reports" element={<ManageReports />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="schedules" element={<ManageSchedules />} />
            <Route path="structure" element={<ManageStructure />} />
            <Route path="ppid" element={<ManagePpid />} />
            {/* Admin Booking Enkapsulasi Arsip */}
            <Route path="bookings" element={
              SITE_CONFIG.FEATURES.ENABLE_BOOKING ? (
                <Suspense fallback={<div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-200 border-t-[#1e3a5f] rounded-full animate-spin"/></div>}>
                  <AdminBookings />
                </Suspense>
              ) : <Navigate to="/admin" replace />
            } />
          </Route>

          {/* Rute penanganan error 404 halaman tidak ditemukan */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
