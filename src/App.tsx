import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router';
import { useEffect, useRef, Suspense, lazy } from 'react';
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
import ArticleDetail from './pages/ArticleDetail';
import Galendo from './pages/Galendo';
import Ppid from './pages/Ppid';
import ZonaIntegritas from './pages/ZonaIntegritas';
import Referensi from './pages/Referensi';
import JasaKearsipan from './pages/JasaKearsipan';
import KatalogBuku from './pages/KatalogBuku';
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

import { refreshHomeArticles, migrateLegacyArticleImages, refreshCategories } from './services/dataService';
import { refreshSettings } from './services/settingsService';
import { refreshBooks, migrateLegacyBookCovers } from './services/bookService';
import { refreshMembersFromSupabase } from './services/supabaseAuthService';

// Scroll to top on route change
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

  // Global Data Sync on Startup
  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    // 1. Initial background sync
    refreshHomeArticles();
    refreshCategories();
    refreshSettings();
    refreshBooks();
    void refreshMembersFromSupabase();
    migrateLegacyArticleImages();
    migrateLegacyBookCovers();
    
    // 2. ACTIVATE REAL-TIME (optional): Listen for any changes in Supabase
    const channel = realtimeEnabled
      ? supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public' },
            (payload) => {
              // React intelligently to what changed
              const table = payload.table;
              console.log(`Real-time change detected in ${table}:`, payload.eventType);
              
              if (table === 'articles') refreshHomeArticles();
              else if (['settings', 'schedules', 'achievements', 'structure'].includes(table)) refreshSettings();
              else if (table === 'categories') refreshCategories();
              else if (table === 'members') void refreshMembersFromSupabase();
              else if (['books', 'borrows', 'queue'].includes(table)) refreshBooks();
              
              // Trigger global UI update
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
          <Route path="artikel/:slug" element={<ArticleDetail />} />
          <Route path="galendo" element={<Galendo />} />
          <Route path="ppid" element={<Ppid />} />
          <Route path="zona-integritas" element={<ZonaIntegritas />} />
          <Route path="riwayat-pinjaman" element={<RiwayatPinjaman />} />
          <Route path="pabukon" element={<Pabukon />} />
          <Route path="lapor-warga" element={<LaporWarga />} />
          <Route path="jadwal" element={<JadwalLayanan />} />
          <Route path="referensi" element={<Referensi />} />
          <Route path="katalog" element={<KatalogBuku />} />
          <Route path="jasa-kearsipan" element={<JasaKearsipan />} />
          <Route path="layanan-rentan" element={<LayananRentan />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/verify" element={<AuthVerifyCode />} />
        <Route path="/auth/update-password" element={<AuthUpdatePassword />} />
        <Route path="/login-admin" element={<LoginAdmin />} />
        <Route path="/profil" element={<Profil />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center p-6 bg-white overflow-hidden overflow-y-auto">
              <div className="w-10 h-10 border-4 border-[#0c2f3d]/10 border-t-[#d6a54a] rounded-full animate-spin"></div>
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
          <Route path="books" element={<ManageBooks />} />
          <Route path="books/new" element={<BookEditor />} />
          <Route path="books/edit/:id" element={<BookEditor />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="admins" element={<ManageAdmins />} />
          <Route path="members" element={<ManageMembers />} />
          <Route path="borrows" element={<ManageBorrows />} />
          <Route path="reports" element={<ManageReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="schedules" element={<ManageSchedules />} />
          <Route path="structure" element={<ManageStructure />} />
          <Route path="ppid" element={<ManagePpid />} />
        </Route>

        {/* 404 Generic Error Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
