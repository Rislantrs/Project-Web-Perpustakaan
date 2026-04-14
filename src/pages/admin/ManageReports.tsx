import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Calendar, Trash2, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Report {
  id: number;
  nama: string;
  email: string;
  telepon: string;
  kategori: string;
  pesan: string;
  alamat: string;
  tanggal: string;
  status: string;
}

export default function ManageReports() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('disipusda_reports') || '[]');
    setReports(data.sort((a: any, b: any) => b.id - a.id));
  }, []);

  const handleDelete = (id: number) => {
    const filtered = reports.filter(r => r.id !== id);
    setReports(filtered);
    localStorage.setItem('disipusda_reports', JSON.stringify(filtered));
  };

  return (
    <div className="pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Warga</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola aspirasi dan pengaduan dari masyarakat</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reports.map((report) => (
          <motion.div 
            layout 
            key={report.id}
            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0c2f3d]/5 flex items-center justify-center text-[#0c2f3d]">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{report.nama}</h3>
                  <p className="text-xs text-[#d6a54a] font-bold uppercase tracking-wider">{report.kategori}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-[10px] font-bold">
                  <Calendar size={12} /> {report.tanggal}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">
                  <CheckCircle size={12} /> {report.status}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <p className="text-sm text-gray-600 leading-relaxed italic">"{report.pesan}"</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Mail size={14} className="text-gray-300" /> {report.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Phone size={14} className="text-gray-300" /> {report.telepon}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <MapPin size={14} className="text-gray-300" /> {report.alamat}
                </div>
              </div>
              <button 
                onClick={() => handleDelete(report.id)}
                className="p-2.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Clock size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">Belum ada laporan yang masuk.</p>
          </div>
        )}
      </div>
    </div>
  );
}
