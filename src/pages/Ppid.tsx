import { ChevronRight, FileDown, Search, FileText } from 'lucide-react';
import { Link } from 'react-router';

// Dummy data from screenshot for PPID documents
const docs = [
  { title: "Laporan Akuntabilitas Kinerja Pemerintah Daerah (LKjIP) Tahun 2025", category: "LAKIP" },
  { title: "Rencana Kerja (RENJA) Tahun 2026 Dinas Arsip dan Perpustakaan", category: "RENJA" },
  { title: "Perubahan Rencana Kerja (RENJA) Tahun 2025", category: "RENJA" },
  { title: "Perjanjian Kinerja (PK) Tahun 2025 Dinas Arsip dan Perpustakaan", category: "PK" },
  { title: "Rencana Strategis (RENSTRA) Tahun 2025-2029", category: "RENSTRA" },
  { title: "SK Standar Pelayanan Dinas Arsip dan Perpustakaan", category: "SK" },
  { title: "SOP Layanan Perbaikan Arsip Astrajingga", category: "SOP" },
  { title: "SOP Layanan Diorama", category: "SOP" },
  { title: "SOP Penggunaan Sistem Informasi Kearsipan SIDORA", category: "SOP" },
  { title: "SOP Penggunaan Sistem Informasi Kehadiran Pegawai SIABAH", category: "SOP" },
  { title: "Visi, Misi dan Komitmen PPID", category: "Umum" },
  { title: "Tata Cara Pemohonan Keberatan", category: "Umum" },
  { title: "Penyelesaian Sengketa Di Komisi Informasi", category: "Umum" }
];

export default function Ppid() {
  return (
    <div className="bg-[#fcfdfd] min-h-screen pt-12 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center justify-center text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#0c2f3d]">Home</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#0c2f3d] font-medium">PPID</span>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#0c2f3d] mb-4">Pejabat Pengelola Informasi dan Dokumentasi</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg mt-4">
            Akses dokumen publik, laporan kinerja, dan standar operasional prosedur secara transparan dan mudah.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari dokumen..." 
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d6a54a] focus:ring-1 focus:ring-[#d6a54a] shadow-sm"
          />
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {docs.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 md:p-6 hover:bg-[#f8f9fa] transition-colors group">
                <div className="flex items-start md:items-center gap-4">
                  <div className="hidden md:flex flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg items-center justify-center text-gray-400 group-hover:bg-[#0c2f3d] group-hover:text-[#d6a54a] transition-colors">
                     <FileText size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#d6a54a] bg-[#d6a54a]/10 px-2 py-0.5 rounded tracking-widest">{doc.category}</span>
                    <h3 className="font-semibold text-gray-800 mt-1.5 md:text-lg pr-4">{doc.title}</h3>
                  </div>
                </div>
                <button className="flex-shrink-0 flex items-center justify-center p-3 rounded-full border border-gray-200 text-gray-500 hover:border-[#0c2f3d] hover:bg-[#0c2f3d] hover:text-white transition-all shadow-sm">
                  <FileDown size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
