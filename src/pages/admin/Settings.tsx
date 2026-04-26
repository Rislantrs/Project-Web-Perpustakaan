import { useState, useEffect } from 'react';
import { Save, Globe, Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Youtube, CheckCircle, AlertCircle, Plus, Trash2, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSiteSettings, updateSiteSettings, type SiteSettings } from '../../services/settingsService';
import { getCurrentAdmin } from '../../services/authService';

export default function AdminSettings() {
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [newMisi, setNewMisi] = useState('');

  useEffect(() => {
    setForm(getSiteSettings());
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    // Guard: perubahan konfigurasi global wajib lewat session admin aktif.
    const admin = getCurrentAdmin();
    if (!admin) { showToast('Akses ditolak: Sesi admin tidak valid.', 'error'); return; }
    const res = await updateSiteSettings(form, admin.id);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const addMisi = () => {
    // Tambah item misi secara immutable agar state React stabil.
    if (!newMisi.trim() || !form) return;
    setForm({ ...form, misi: [...form.misi, newMisi.trim()] });
    setNewMisi('');
  };

  const removeMisi = (index: number) => {
    if (!form) return;
    setForm({ ...form, misi: form.misi.filter((_, i) => i !== index) });
  };

  if (!form) return null;

  return (
    <div>
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border"
            style={{ background: toast.type === 'success' ? '#ecfdf5' : '#fef2f2', borderColor: toast.type === 'success' ? '#6ee7b7' : '#fca5a5' }}
          >
            {toast.type === 'success' ? <CheckCircle size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-red-600" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Umum</h1>
        <p className="text-sm text-gray-500 mt-1">Konfigurasi identitas web, kontak, dan info operasional</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8 pb-20">
        
        {/* Identitas Instansi */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Globe size={20} className="text-[#0c2f3d]" /> Identitas Utama</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nama Instansi</label>
              <input value={form.namaInstansi} onChange={e => setForm({...form, namaInstansi: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Kontak</label>
              <input value={form.emailKontak} onChange={e => setForm({...form, emailKontak: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Telepon / Fax</label>
              <input value={form.teleponKontak} onChange={e => setForm({...form, teleponKontak: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Alamat Kantor</label>
              <textarea value={form.alamatInstansi} onChange={e => setForm({...form, alamatInstansi: e.target.value})} rows={3} className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none resize-none" />
            </div>
          </div>
        </div>

        {/* Layanan & Operasional */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Clock size={20} className="text-[#0c2f3d]" /> Layanan & Operasional</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">WhatsApp Admin</label>
              <input value={form.waAdmin} onChange={e => setForm({...form, waAdmin: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Jam Operasional</label>
              <input value={form.jamOperasional} onChange={e => setForm({...form, jamOperasional: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Link Iframe Google Maps</label>
              {/* HARDCODE FIELD: expected berupa URL iframe maps dari pihak ketiga. */}
              <input value={form.linkGmaps} onChange={e => setForm({...form, linkGmaps: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none" />
            </div>
          </div>
        </div>

        {/* Media Sosial */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">🔗 Media Sosial</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl">
              <Facebook size={18} className="text-blue-600" />
              <input value={form.facebookUrl} onChange={e => setForm({...form, facebookUrl: e.target.value})} className="flex-1 bg-transparent border-none text-sm outline-none" placeholder="URL Facebook" />
            </div>
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl">
              <Instagram size={18} className="text-pink-600" />
              <input value={form.instagramUrl} onChange={e => setForm({...form, instagramUrl: e.target.value})} className="flex-1 bg-transparent border-none text-sm outline-none" placeholder="URL Instagram" />
            </div>
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl">
              <Twitter size={18} className="text-blue-400" />
              <input value={form.twitterUrl} onChange={e => setForm({...form, twitterUrl: e.target.value})} className="flex-1 bg-transparent border-none text-sm outline-none" placeholder="URL Twitter" />
            </div>
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl">
              <Youtube size={18} className="text-red-600" />
              <input value={form.youtubeUrl} onChange={e => setForm({...form, youtubeUrl: e.target.value})} className="flex-1 bg-transparent border-none text-sm outline-none" placeholder="URL Youtube" />
            </div>
          </div>
        </div>

        {/* Visi & Misi */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><List size={20} className="text-[#0c2f3d]" /> Visi & Misi</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Visi Instansi</label>
              <textarea value={form.visi} onChange={e => setForm({...form, visi: e.target.value})} rows={2} className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Daftar Misi</label>
              <div className="space-y-3 mb-4">
                {form.misi.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 pl-4 pr-2 py-2 rounded-xl group transition-all hover:bg-white hover:shadow-sm">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <span className="flex-1 text-sm text-gray-700">{m}</span>
                    <button type="button" onClick={() => removeMisi(i)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  value={newMisi} onChange={e => setNewMisi(e.target.value)}
                  placeholder="Tambah misi baru..."
                  className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMisi())}
                />
                <button type="button" onClick={addMisi} className="p-3 bg-[#0c2f3d] text-white rounded-2xl hover:bg-[#1a4254] transition-colors">
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="fixed bottom-10 right-10 z-30">
          <button type="submit" className="bg-[#0c2f3d] text-white px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform flex items-center gap-3">
            Simpan Perubahan <Save size={20} />
          </button>
        </div>

      </form>
    </div>
  );
}
