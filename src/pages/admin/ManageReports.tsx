import { useCallback, useEffect, useState, useMemo } from 'react';
import { Mail, Phone, MapPin, Calendar, Trash2, MessageSquare, CheckCircle, Clock, Eye, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { deleteReport, getReports, type Report } from '../../services/reportService';

export default function ManageReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Search, Filter, and Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Selected report for detailed modal view
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    const result = await getReports();
    setReports(result.reports);
    setErrorMessage(result.success ? '' : result.message);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent opening detail modal
    if (!window.confirm('Apakah Anda yakin ingin menghapus laporan ini?')) return;

    const result = await deleteReport(id);
    if (!result.success) {
      setErrorMessage(result.message);
    } else {
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
    }
    void loadReports();
  };

  // Get unique categories for filter
  const categories = useMemo(() => {
    const list = new Set(reports.map(r => r.kategori));
    return ['Semua', ...Array.from(list)];
  }, [reports]);

  // Filtered and searched reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchSearch = 
        report.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.pesan.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategory = selectedCategory === 'Semua' || report.kategori === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [reports, searchTerm, selectedCategory]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage, itemsPerPage]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, itemsPerPage]);

  return (
    <div className="pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Warga</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola aspirasi dan pengaduan dari masyarakat secara real-time</p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errorMessage}
        </div>
      )}

      {/* Filter & Search Panel */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, email, isi laporan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-2xl text-xs focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none text-gray-700 font-medium cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-2 bg-gray-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none text-gray-700 font-medium cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loader */}
      {isLoading ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-center text-sm text-gray-400">
          Memuat laporan warga...
        </div>
      ) : null}

      {!isLoading && (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-6">Pengirim</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kategori</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pesan / Laporan</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center pr-6">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedReports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 pl-6">
                      <div className="font-bold text-gray-900 text-xs">{report.nama}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{report.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-amber-50 text-[#d6a54a] rounded-full text-[9px] font-black uppercase tracking-wide">
                        {report.kategori}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="text-xs text-gray-600 truncate">{report.pesan}</p>
                    </td>
                    <td className="p-4 text-xs text-gray-500 font-medium">
                      {report.tanggal}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold">
                        <CheckCircle size={10} /> {report.status}
                      </span>
                    </td>
                    <td className="p-4 text-center pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report);
                          }}
                          className="p-1.5 text-gray-400 hover:text-[#0c2f3d] hover:bg-gray-100 rounded-lg transition-all"
                          title="Lihat Detail"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, report.id)}
                          className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Hapus Laporan"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden divide-y divide-gray-100">
            {paginatedReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="p-5 hover:bg-gray-50 transition-colors cursor-pointer relative"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-xs">{report.nama}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-50 text-[#d6a54a] rounded-full text-[8px] font-black uppercase tracking-wide">
                      {report.kategori}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[8px] font-bold">
                    {report.status}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 line-clamp-2 italic mb-3">"{report.pesan}"</p>

                <div className="flex justify-between items-center text-[10px] text-gray-400">
                  <span>{report.tanggal}</span>
                  <button
                    onClick={(e) => handleDelete(e, report.id)}
                    className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredReports.length === 0 && (
            <div className="text-center py-16">
              <Clock size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 font-medium text-xs">Belum ada laporan yang sesuai.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredReports.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="text-xs text-gray-400 font-medium">
            Menampilkan <span className="text-gray-700 font-bold">{Math.min(filteredReports.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredReports.length, currentPage * itemsPerPage)}</span> dari <span className="text-gray-700 font-bold">{filteredReports.length}</span> laporan
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1 bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors rounded-lg"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                // Simple pagination truncation for many pages
                if (totalPages > 5 && Math.abs(currentPage - page) > 1 && page !== 1 && page !== totalPages) {
                  if (page === 2 || page === totalPages - 1) {
                    return <span key={page} className="px-2 text-gray-400 text-xs">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page
                        ? 'bg-[#0c2f3d] text-white'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors rounded-lg"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detailed Report Modal Popup */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden z-10 border border-gray-100"
            >
              {/* Header */}
              <div className="bg-[#0c2f3d] text-white px-6 py-5 flex items-center justify-between">
                <div>
                  <span className="px-2 py-0.5 bg-white/10 text-amber-300 rounded-full text-[9px] font-black uppercase tracking-wider">
                    {selectedReport.kategori}
                  </span>
                  <h2 className="text-sm font-bold mt-1">Detail Pengaduan Warga</h2>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1 bg-white/10 text-white hover:bg-white/20 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Pengirim & Tanggal */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-50">
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Pengirim</span>
                    <span className="text-xs font-bold text-gray-900">{selectedReport.nama}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Tanggal Masuk</span>
                    <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                      <Calendar size={12} className="text-gray-400" /> {selectedReport.tanggal}
                    </span>
                  </div>
                </div>

                {/* Kontak details */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-50">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Email</span>
                    <a href={`mailto:${selectedReport.email}`} className="text-xs text-[#d6a54a] font-semibold hover:underline flex items-center gap-1.5">
                      <Mail size={12} /> {selectedReport.email}
                    </a>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Telepon / WhatsApp</span>
                    <a href={`tel:${selectedReport.telepon}`} className="text-xs text-gray-700 font-semibold flex items-center gap-1.5 hover:text-[#0c2f3d]">
                      <Phone size={12} className="text-gray-400" /> {selectedReport.telepon}
                    </a>
                  </div>
                </div>

                {/* Alamat */}
                <div className="pb-4 border-b border-gray-50">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Lokasi Terkait / Alamat</span>
                  <span className="text-xs text-gray-600 flex items-start gap-1.5 leading-relaxed">
                    <MapPin size={12} className="text-gray-400 shrink-0 mt-0.5" /> {selectedReport.alamat}
                  </span>
                </div>

                {/* Pesan Laporan */}
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Isi Laporan / Pengaduan</span>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                      "{selectedReport.pesan}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100">
                  <CheckCircle size={12} /> Status: {selectedReport.status}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      void handleDelete(e, selectedReport.id);
                    }}
                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Trash2 size={14} /> Hapus Laporan
                  </button>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold transition-all"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
