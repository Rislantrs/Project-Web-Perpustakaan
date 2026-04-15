import { useState, useEffect } from 'react';
import { Network, Trophy, Plus, Trash2, Save, CheckCircle, AlertCircle, User, Briefcase, Image as ImageIcon, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getStructure, saveStructure, getAchievements, saveAchievements, type StructureNode, type Achievement } from '../../services/settingsService';

const CATEGORIES = [
  { id: 'pimpinan', label: 'Pimpinan' },
  { id: 'sekretariat', label: 'Sekretariat' },
  { id: 'bidang_pembinaan', label: 'Bidang Pembinaan' },
  { id: 'bidang_pengelolaan', label: 'Bidang Pengelolaan' },
  { id: 'bidang_layanan', label: 'Bidang Layanan' },
  { id: 'bidang_pengembangan', label: 'Bidang Pengembangan' },
  { id: 'diorama', label: 'Bale Panyawangan Diorama' }
];

export default function ManageStructure() {
  const [activeTab, setActiveTab] = useState<'struktur' | 'prestasi'>('struktur');
  const [nodes, setNodes] = useState<StructureNode[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    setNodes(getStructure());
    setAchievements(getAchievements());
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3500);
  };

  // --- Structure Logic ---
  const addNode = () => {
    const newNode: StructureNode = {
      id: Date.now().toString(),
      name: '',
      position: '',
      level: 3,
      category: 'sekretariat',
      img: ''
    };
    setNodes([...nodes, newNode]);
  };


  const removeNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
  };

  const updateNode = (id: string, field: keyof StructureNode, value: string | number) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, [field]: value } : n));
  };
  const handleSaveStructure = () => {
    const res = saveStructure(nodes);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  // --- Achievement Logic ---
  const addAchievement = () => {
    const newAchievement: Achievement = {
      id: Date.now().toString(),
      title: '',
      year: new Date().getFullYear().toString(),
      description: ''
    };
    setAchievements([...achievements, newAchievement]);
  };

  const removeAchievement = (id: string) => {
    setAchievements(achievements.filter(a => a.id !== id));
  };

  const updateAchievement = (id: string, field: keyof Achievement, value: string) => {
    setAchievements(achievements.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleSaveAchievements = () => {
    const res = saveAchievements(achievements);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const handleFileChange = (id: string, file: File | null) => {
    if (!file) {
      updateNode(id, 'img', '');
      return;
    }
    
    // Check file size (limit to 2MB for localStorage safety)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran file terlalu besar (Maks 2MB)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateNode(id, 'img', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAchievementFileChange = (id: string, file: File | null) => {
    if (!file) {
      updateAchievement(id, 'img', '');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran file terlalu besar (Maks 2MB)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      updateAchievement(id, 'img', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl mx-auto pb-32">
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

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Konten Profil Instansi</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data struktur organisasi dan daftar prestasi kepegawaian</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('struktur')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'struktur' ? 'bg-white text-[#0c2f3d] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Network size={16} /> Struktur
          </button>
          <button 
            onClick={() => setActiveTab('prestasi')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'prestasi' ? 'bg-white text-[#0c2f3d] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Trophy size={16} /> Prestasi
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'struktur' ? (
          <motion.div 
            key="struktur"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-[#0c2f3d]/5 p-6 rounded-3xl border border-[#0c2f3d]/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0c2f3d] flex items-center justify-center text-white shadow-lg">
                  <Briefcase size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-[#0c2f3d]">Bagan Organisasi</h3>
                  <p className="text-xs text-gray-500">Definisikan hirarki pimpinan dan staf</p>
                </div>
              </div>
              <button 
                onClick={addNode}
                className="bg-[#0c2f3d] text-white px-5 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#1a4254] transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Tambah Personel
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {nodes.map((node, i) => (
                <div key={node.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                  {/* Foto Upload */}
                  <div className="shrink-0">
                    <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Pas Foto</label>
                    <div className="relative group cursor-pointer">
                      <div className="w-24 h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center group-hover:border-[#d6a54a] transition-all">
                        {node.img ? (
                          <img src={node.img} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-gray-300">
                            <ImageIcon size={24} />
                            <span className="text-[8px] font-bold">upload</span>
                          </div>
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(node.id, e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                      {node.img && (
                        <button 
                          onClick={() => updateNode(node.id, 'img', '')}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"
>
                      <div>
                        <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1 shadow-transparent">Nama Pejabat/Staf</label>
                        <input value={node.name} onChange={e => updateNode(node.id, 'name', e.target.value)} placeholder="Nama Lengkap" className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-[#0c2f3d] focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Jabatan</label>
                        <input value={node.position} onChange={e => updateNode(node.id, 'position', e.target.value)} placeholder="Jabatan" className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-medium text-gray-600 focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Kategori Bagian</label>
                        <select value={node.category} onChange={e => updateNode(node.id, 'category', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-[10px] font-bold focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none appearance-none uppercase tracking-wider">
                          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Level Hirarki</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map((l) => (
                            <button 
                              key={l}
                              onClick={() => updateNode(node.id, 'level', l)}
                              className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all border ${node.level === l ? 'bg-[#0c2f3d] text-white border-[#0c2f3d]' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
                            >
                              LV {l}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => removeNode(node.id)} className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all self-center">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {nodes.length > 0 && (
              <div className="fixed bottom-10 right-10 z-30">
                <button onClick={handleSaveStructure} className="bg-[#0c2f3d] text-white px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform flex items-center gap-3">
                  Simpan Bagan <Save size={20} />
                </button>
              </div>
            )}
          </motion.div>

        ) : (
          <motion.div 
            key="prestasi"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
             <div className="flex justify-between items-center bg-[#d6a54a]/5 p-6 rounded-3xl border border-[#d6a54a]/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#d6a54a] flex items-center justify-center text-white shadow-lg">
                  <Trophy size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-[#b48a3d]">Papan Prestasi</h3>
                  <p className="text-xs text-gray-500">Daftar penghargaan dan apresiasi instansi</p>
                </div>
              </div>
              <button 
                onClick={addAchievement}
                className="bg-[#d6a54a] text-white px-5 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#b48a3d] transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Tambah Prestasi
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 pb-24">
              {achievements.map((item) => (
                <div key={item.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-start">
                  
                  {/* Foto Penghargaan */}
                  <div className="shrink-0">
                    <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Foto / Ikon</label>
                    <div className="relative group cursor-pointer">
                      <div className="w-24 h-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center group-hover:border-[#d6a54a] transition-all">
                        {item.img ? (
                          <img src={item.img} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-gray-300">
                            <ImageIcon size={24} />
                            <span className="text-[8px] font-bold text-center">pilih foto</span>
                          </div>
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleAchievementFileChange(item.id, e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                      {item.img && (
                        <button 
                          onClick={() => updateAchievement(item.id, 'img', '')}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Nama Penghargaan</label>
                        <input value={item.title} onChange={e => updateAchievement(item.id, 'title', e.target.value)} placeholder="Contoh: Juara 1 Perpustakaan Terbaik" className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#0c2f3d] outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Tahun</label>
                        <input value={item.year} onChange={e => updateAchievement(item.id, 'year', e.target.value)} placeholder="2024" className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-center outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Deskripsi Singkat</label>
                      <textarea value={item.description} onChange={e => updateAchievement(item.id, 'description', e.target.value)} rows={2} placeholder="Ceritakan sedikit tentang pencapaian ini..." className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm text-gray-600 outline-none resize-none" />
                    </div>
                  </div>
                  <button onClick={() => removeAchievement(item.id)} className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all self-center">
                    <Trash2 size={24} />
                  </button>
                </div>
              ))}
            </div>

            {achievements.length > 0 && (
              <div className="fixed bottom-10 right-10 z-30">
                <button onClick={handleSaveAchievements} className="bg-[#d6a54a] text-white px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform flex items-center gap-3">
                  Simpan Prestasi <Save size={20} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
