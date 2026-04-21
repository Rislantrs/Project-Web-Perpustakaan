import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router';
import { useEffect, Suspense, lazy } from 'react';
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
import NotFound from './pages/NotFound';
import BlogList from './pages/BlogList';
import ArticleDetail from './pages/ArticleDetail';
import Galendo from './pages/Galendo';
import Ppid from './pages/Ppid';
import ZonaIntegritas from './pages/ZonaIntegritas';
import Referensi from './pages/Referensi';
import LayananRentan from './pages/LayananRentan';
import JasaKearsipan from './pages/JasaKearsipan';
import LaporWarga from './pages/LaporWarga';
import Pabukon from './pages/Pabukon';

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
const ManageAdmins = lazy(() => import('./pages/admin/ManageAdmins'));
const ManageMembers = lazy(() => import('./pages/admin/ManageMembers'));
const ManageBorrows = lazy(() => import('./pages/admin/ManageBorrows'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const ManageReports = lazy(() => import('./pages/admin/ManageReports'));
const ManageSchedules = lazy(() => import('./pages/admin/ManageSchedules'));
const ManageStructure = lazy(() => import('./pages/admin/ManageStructure'));
const ManagePpid = lazy(() => import('./pages/admin/ManagePpid'));
import JadwalLayanan from './pages/JadwalLayanan';

import { refreshArticles } from './services/dataService';
import { refreshSettings } from './services/settingsService';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  // Global Data Sync on Startup
  useEffect(() => {
    const syncData = async () => {
      console.log('🔄 Memulai Sinkronisasi Data dengan Supabase...');
      try {
        await Promise.all([
          refreshArticles(),
          refreshSettings()
        ]);
        console.log('✅ Sinkronisasi Berhasil! Data Anda sudah aman di Cloud.');
        window.dispatchEvent(new CustomEvent('dbChange'));
      } catch (err) {
        console.error('❌ Sinkronisasi Gagal:', err);
      }
    };
    
    syncData();
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
          <Route path="layanan-rentan" element={<LayananRentan />} />
          <Route path="jasa-kearsipan" element={<JasaKearsipan />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/login-admin" element={<LoginAdmin />} />
        <Route path="/profil" element={<Profil />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
