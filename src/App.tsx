import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router';
import { useEffect } from 'react';
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

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageArticles from './pages/admin/ManageArticles';
import ArticleEditor from './pages/admin/ArticleEditor';
import ManageMedia from './pages/admin/ManageMedia';
import MediaEditor from './pages/admin/MediaEditor';
import ManageBooks from './pages/admin/ManageBooks';
import BookEditor from './pages/admin/BookEditor';
import ManageAdmins from './pages/admin/ManageAdmins';
import ManageMembers from './pages/admin/ManageMembers';
import ManageBorrows from './pages/admin/ManageBorrows';
import LaporWarga from './pages/LaporWarga';
import AdminSettings from './pages/admin/Settings';
import LoginAdmin from './pages/admin/LoginAdmin';
import ManageReports from './pages/admin/ManageReports';
import ManageSchedules from './pages/admin/ManageSchedules';
import ManageStructure from './pages/admin/ManageStructure';
import JadwalLayanan from './pages/JadwalLayanan';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
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
        <Route path="/admin" element={<AdminLayout />}>
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
        </Route>

        {/* 404 Generic Error Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
