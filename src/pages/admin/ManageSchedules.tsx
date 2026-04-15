import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSchedules, saveSchedules, type Schedule } from '../../services/settingsService';

export default function ManageSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    setSchedules(getSchedules());
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3500);
  };

  const handleAdd = () => {
    const newSchedule: Schedule = {
      id: Date.now().toString(),
      day: '',
      hours: '',
      note: ''
    };
    setSchedules([...schedules, newSchedule]);
  };

  const handleRemove = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const handleChange = (id: string, field: keyof Schedule, value: string) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSave = () => {
    const res = saveSchedules(schedules);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  return (
    <div className="max-w-4xl mx-auto">
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

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Jadwal</h1>
          <p className="text-sm text-gray-500 mt-1">Atur jam operasional layanan perpustakaan & arsip</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#0c2f3d] text-white px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#1a4254] transition-all"
        >
          <Plus size={16} /> Tambah Jadwal
        </button>
      </div>

      <div className="space-y-4 mb-20">
        {schedules.map((item, index) => (
          <motion.div 
            layout
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 font-bold text-xs shrink-0">
              {index + 1}
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Hari / Rentang</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    value={item.day} onChange={e => handleChange(item.id, 'day', e.target.value)}
                    placeholder="Contoh: Senin - Kamis"
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Jam Layanan</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    value={item.hours} onChange={e => handleChange(item.id, 'hours', e.target.value)}
                    placeholder="Contoh: 08:00 - 15:30"
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Keterangan</label>
                <input 
                  value={item.note} onChange={e => handleChange(item.id, 'note', e.target.value)}
                  placeholder="Opsional: Layanan Peminjaman"
                  className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none"
                />
              </div>
            </div>

            <button 
              onClick={() => handleRemove(item.id)}
              className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
            >
              <Trash2 size={18} />
            </button>
          </motion.div>
        ))}

        {schedules.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Clock size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">Belum ada jadwal yang diatur</p>
            <button onClick={handleAdd} className="mt-4 text-[#0c2f3d] font-bold text-sm">Tambah Jadwal Pertama</button>
          </div>
        )}
      </div>

      {/* Floating Save Button */}
      {schedules.length > 0 && (
        <div className="fixed bottom-10 right-10 z-30">
          <button 
            onClick={handleSave}
            className="bg-[#0c2f3d] text-white px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform flex items-center gap-3"
          >
            Simpan Jadwal <Save size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
