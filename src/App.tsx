import { BrowserRouter as Router, Routes, Route } from 'react-router';
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

import BlogList from './pages/BlogList';
import ArticleDetail from './pages/ArticleDetail';
import Galendo from './pages/Galendo';
import Ppid from './pages/Ppid';
import ZonaIntegritas from './pages/ZonaIntegritas';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageArticles from './pages/admin/ManageArticles';
import ArticleEditor from './pages/admin/ArticleEditor';
import ManageMedia from './pages/admin/ManageMedia';
import MediaEditor from './pages/admin/MediaEditor';

function App() {
  return (
    <Router>
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
        </Route>
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="articles" element={<ManageArticles />} />
          <Route path="articles/new" element={<ArticleEditor />} />
          <Route path="articles/edit/:id" element={<ArticleEditor />} />
          <Route path="media" element={<ManageMedia />} />
          <Route path="media/new" element={<MediaEditor />} />
          <Route path="media/edit/:id" element={<MediaEditor />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
