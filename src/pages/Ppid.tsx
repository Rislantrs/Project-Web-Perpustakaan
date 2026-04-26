import { ChevronRight, FileDown, Search, FileText } from 'lucide-react';
import { Link } from 'react-router';

import { useState, useEffect } from 'react';
import { fetchArticlesPage, Article } from '../services/dataService';

export default function Ppid() {
  const [docs, setDocs] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      setIsLoading(true);
      try {
        // HARDCODE RANGE: ambil 100 data awal karena halaman ini belum pakai pagination.
        const data = await fetchArticlesPage({ from: 0, to: 99, category: 'Ppid' });
        setDocs(data);
      } catch (error) {
        console.error('Gagal memuat dokumen PPID:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocs();
    // Re-sync saat cache artikel berubah (misal setelah admin update PPID).
    window.addEventListener('dbChange', fetchDocs);
    return () => window.removeEventListener('dbChange', fetchDocs);
  }, []);

  // Search ringan client-side berdasarkan judul dokumen.
  const filteredDocs = docs.filter(doc => doc.title.toLowerCase().includes(search.toLowerCase()));

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari dokumen..." 
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d6a54a] focus:ring-1 focus:ring-[#d6a54a] shadow-sm"
          />
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {isLoading ? Array.from({ length: 6 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className="p-4 md:p-6 animate-pulse">
                <div className="h-3 w-24 bg-gray-100 rounded mb-3" />
                <div className="h-5 w-4/5 bg-gray-100 rounded" />
              </div>
            )) : filteredDocs.map((doc, idx) => (
              <div key={doc.id || idx} className="flex items-center justify-between p-4 md:p-6 hover:bg-[#f8f9fa] transition-colors group">
                <div className="flex items-start md:items-center gap-4">
                  <div className="hidden md:flex flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg items-center justify-center text-gray-400 group-hover:bg-[#0c2f3d] group-hover:text-[#d6a54a] transition-colors">
                     <FileText size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#d6a54a] bg-[#d6a54a]/10 px-2 py-0.5 rounded tracking-widest">{doc.excerpt || 'Umum'}</span>
                    <h3 className="font-semibold text-gray-800 mt-1.5 md:text-lg pr-4">{doc.title}</h3>
                  </div>
                </div>
                <a 
                  // HARDCODE MAPPING: field img dipakai sebagai URL unduhan dokumen PPID.
                  href={doc.img || '#'} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-shrink-0 flex items-center justify-center p-3 rounded-full border border-gray-200 text-gray-500 hover:border-[#0c2f3d] hover:bg-[#0c2f3d] hover:text-white transition-all shadow-sm"
                >
                  <FileDown size={20} />
                </a>
              </div>
            ))}
            {!isLoading && filteredDocs.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <FileText size={32} className="mx-auto text-gray-300 mb-3" />
                Masih mencari file arsip yang tepat? Tidak ada dokumen ditemukan.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
