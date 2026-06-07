import { useState, useRef } from 'react';
import { Search, ExternalLink, Archive, Info, ArrowRight, ChevronRight, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ARSIP_CONFIG, buildJiknSearchUrl } from '../config/arsipConfig';

// ─────────────────────────────────────────────────────────────────────────────
// Halaman: Cari Arsip Purwakarta
// Modul: src/modules/arsip/
// Arsitektur: Smart Search Redirect → JIKN (Deep Linking)
//
// Tidak ada koneksi ke Supabase. Tidak ada data yang disimpan.
// Hanya merangkai URL dan mengarahkan pengguna ke portal JIKN ANRI.
// ─────────────────────────────────────────────────────────────────────────────

export default function CariArsip() {
  const [keyword, setKeyword] = useState('');
  const [filterInstansi, setFilterInstansi] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastKeyword, setToastKeyword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (kw?: string) => {
    const q = (kw ?? keyword).trim();
    if (!q) {
      inputRef.current?.focus();
      return;
    }
    setIsSearching(true);

    // Salin kata kunci ke clipboard
    try {
      await navigator.clipboard.writeText(q);
      setToastKeyword(q);
      setShowToast(true);
    } catch (err) {
      console.error('Gagal menyalin kata kunci:', err);
    }

    const url = buildJiknSearchUrl(q, filterInstansi);
    // Buka di tab baru agar pengguna tidak kehilangan halaman ini
    window.open(url, '_blank', 'noopener,noreferrer');
    
    setTimeout(() => {
      setIsSearching(false);
    }, 1200);

    // Hilangkan toast setelah 7 detik
    setTimeout(() => {
      setShowToast(false);
    }, 7000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleChipClick = (topic: string) => {
    setKeyword(topic);
    handleSearch(topic);
  };

  return (
    <div className="bg-[#fcfdfd] min-h-screen">

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0c2f3d] via-[#0f3a4d] to-[#1a4f63] py-24 px-4 sm:px-6 lg:px-8">
        {/* Background decorative */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#d6a54a]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#689f92]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-[#d6a54a]/20 text-[#d6a54a] border border-[#d6a54a]/30 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
              <Archive size={14} />
              Layanan Arsip Digital
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Cari Arsip{' '}
              <span className="text-[#d6a54a]">Purwakarta</span>
            </h1>

            <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              Telusuri koleksi arsip digital Kabupaten Purwakarta secara langsung
              melalui portal resmi{' '}
              <strong className="text-white">JIKN</strong>{' '}
              (Jaringan Informasi Kearsipan Nasional) milik ANRI.
            </p>
          </motion.div>

          {/* ── KOTAK PENCARIAN UTAMA ── */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl"
          >
            {/* Input bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  ref={inputRef}
                  id="arsip-search-input"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Cari arsip... (misal: Bupati Pertama Purwakarta)"
                  className="w-full bg-white text-gray-800 placeholder-gray-400 pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d6a54a]/50 focus:border-[#d6a54a] text-base shadow-sm transition-all"
                  aria-label="Kolom pencarian arsip"
                  autoComplete="off"
                />
              </div>
              <button
                id="arsip-search-btn"
                onClick={() => handleSearch()}
                disabled={isSearching}
                className="flex items-center justify-center gap-2 bg-[#d6a54a] hover:bg-[#c49540] text-white font-bold px-6 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#d6a54a]/30 disabled:opacity-70 whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]"
                aria-label="Cari arsip di JIKN"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ExternalLink size={18} />
                )}
                {isSearching ? 'Membuka...' : 'Cari di JIKN'}
              </button>
            </div>

            {/* Toggle filter instansi */}
            <div className="flex items-center gap-3 text-sm text-white/70 mb-2">
              <button
                id="arsip-filter-toggle"
                type="button"
                onClick={() => setFilterInstansi((v) => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#d6a54a]/50 ${
                  filterInstansi ? 'bg-[#d6a54a]' : 'bg-white/30'
                }`}
                aria-label={filterInstansi ? 'Filter instansi Purwakarta aktif' : 'Filter instansi Purwakarta nonaktif'}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    filterInstansi ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span>
                Filter khusus{' '}
                <strong className="text-white">Instansi Purwakarta</strong>{' '}
                {filterInstansi ? '(aktif)' : '(nonaktif — cari semua instansi nasional)'}
              </span>
            </div>

            {/* Penjelasan singkat */}
            <p className="text-white/50 text-xs mt-2">
              Pencarian akan membuka portal JIKN di tab baru. Tidak ada data yang disimpan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── QUICK SEARCH CHIPS ── */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">
            Topik Pencarian Populer
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {ARSIP_CONFIG.SUGGESTED_TOPICS.map((topic) => (
              <button
                key={topic}
                id={`chip-${topic.replace(/\s+/g, '-').toLowerCase()}`}
                type="button"
                onClick={() => handleChipClick(topic)}
                className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-[#0c2f3d] text-gray-700 hover:text-white border border-gray-200 hover:border-[#0c2f3d] px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 group"
              >
                <Search size={12} className="text-gray-400 group-hover:text-[#d6a54a]" />
                {topic}
                <ChevronRight size={12} className="text-gray-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── BAGAIMANA CARA KERJANYA ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#fcfdfd]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="bg-[#0c2f3d]/8 text-[#0c2f3d] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 inline-block">
              Panduan Singkat
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#0c2f3d] mb-4">
              Bagaimana Cara Kerjanya?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Cari arsip Purwakarta kini bisa dilakukan dalam 3 langkah mudah
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line desktop */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-[#d6a54a]/40 to-transparent" />

            {[
              {
                step: '01',
                title: 'Ketik Kata Kunci',
                desc: 'Masukkan topik yang ingin Anda cari, misalnya nama tokoh, tahun peristiwa, atau jenis dokumen.',
                color: 'bg-[#689f92]/10 text-[#689f92]',
                border: 'border-[#689f92]/20',
                icon: <Search size={28} />,
              },
              {
                step: '02',
                title: 'Klik "Cari di JIKN"',
                desc: 'Website kami akan membuka portal JIKN di tab baru dan otomatis menyalin kata kunci pencarian Anda ke clipboard.',
                color: 'bg-[#d6a54a]/10 text-[#d6a54a]',
                border: 'border-[#d6a54a]/20',
                icon: <ExternalLink size={28} />,
              },
              {
                step: '03',
                title: 'Tempel & Filter',
                desc: 'Tempel kata kunci (Ctrl+V) di kolom pencarian JIKN. Jika opsi filter instansi aktif, centang instansi Purwakarta pada panel kiri JIKN.',
                color: 'bg-[#0c2f3d]/10 text-[#0c2f3d]',
                border: 'border-[#0c2f3d]/20',
                icon: <Archive size={28} />,
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
                className={`relative bg-white border ${item.border} rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 text-center`}
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#0c2f3d] text-white rounded-full flex items-center justify-center font-bold text-sm border-4 border-white shadow-md">
                  {item.step}
                </div>
                <div className={`${item.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 mt-3`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg text-[#0c2f3d] mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATISTIK ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0c2f3d]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {ARSIP_CONFIG.STATS.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="text-4xl font-bold text-[#d6a54a] mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-xs mt-8">
            *Data statistik bersumber dari laporan publik ANRI. Diperbarui secara berkala.
          </p>
        </div>
      </section>

      {/* ── TENTANG JIKN & DISCLAIMER ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Tentang JIKN */}
            <div className="flex-1 bg-gradient-to-br from-[#f0f7f5] to-white border border-[#689f92]/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-[#689f92]/15 text-[#689f92] p-2.5 rounded-xl">
                  <Globe size={22} />
                </div>
                <h3 className="font-bold text-xl text-[#0c2f3d]">Tentang JIKN</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>JIKN (Jaringan Informasi Kearsipan Nasional)</strong> adalah platform
                nasional milik ANRI yang mengintegrasikan data arsip dari seluruh instansi
                pemerintah di Indonesia, termasuk Kabupaten Purwakarta.
              </p>
              <p className="text-gray-600 leading-relaxed mb-5">
                Masyarakat dapat mengakses berbagai jenis arsip: dokumen kedinasan, foto
                historis, peta wilayah, video dokumenter, dan rekaman audio — semuanya
                dalam satu portal terpadu.
              </p>
              <a
                href={ARSIP_CONFIG.JIKN.BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                id="jikn-external-link"
                className="inline-flex items-center gap-2 bg-[#689f92] hover:bg-[#578a7f] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
              >
                <ExternalLink size={16} />
                Kunjungi Portal JIKN
              </a>
            </div>

            {/* Disclaimer */}
            <div className="flex-1 bg-gradient-to-br from-[#fffbf0] to-white border border-[#d6a54a]/25 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-[#d6a54a]/15 text-[#d6a54a] p-2.5 rounded-xl">
                  <Info size={22} />
                </div>
                <h3 className="font-bold text-xl text-[#0c2f3d]">
                  {ARSIP_CONFIG.DISCLAIMER.TITLE}
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                {ARSIP_CONFIG.DISCLAIMER.BODY}
              </p>

              {/* Tombol tampilkan/sembunyikan detail teknis */}
              <button
                type="button"
                id="disclaimer-toggle-btn"
                onClick={() => setShowDisclaimer((v) => !v)}
                className="text-sm text-[#d6a54a] hover:text-[#c49540] font-semibold flex items-center gap-1 transition-colors"
              >
                {showDisclaimer ? 'Sembunyikan' : 'Lihat detail teknis'}
                <ChevronRight
                  size={14}
                  className={`transition-transform ${showDisclaimer ? 'rotate-90' : ''}`}
                />
              </button>

              <AnimatePresence>
                {showDisclaimer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-2 border border-gray-100">
                      <p>
                        <strong className="text-gray-700">Arsitektur:</strong> Smart Search
                        Redirect (Deep Linking) — Microservice Lite
                      </p>
                      <p>
                        <strong className="text-gray-700">Database digunakan:</strong> Tidak ada
                      </p>
                      <p>
                        <strong className="text-gray-700">API JIKN:</strong> Tidak ada (redirect
                        URL langsung)
                      </p>
                      <p>
                        <strong className="text-gray-700">Data pengguna disimpan:</strong> Tidak
                      </p>
                      <p>
                        <strong className="text-gray-700">Ketergantungan:</strong> Hanya
                        membutuhkan koneksi internet dan browser
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#0c2f3d] to-[#1a4f63]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Butuh Bantuan Menemukan Arsip?
          </h2>
          <p className="text-gray-300 mb-8">
            Kunjungi langsung Depo Arsip Disipusda Purwakarta. Tim arsiparis kami siap
            membantu penelusuran arsip statis secara langsung.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/kearsipan"
              id="cta-kearsipan-link"
              className="inline-flex items-center justify-center gap-2 bg-[#d6a54a] hover:bg-[#c49540] text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#d6a54a]/20"
            >
              Layanan Kearsipan
              <ArrowRight size={18} />
            </a>
            <a
              href="https://jikn.anri.go.id"
              target="_blank"
              rel="noopener noreferrer"
              id="cta-jikn-link"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-8 py-3.5 rounded-xl transition-all duration-200"
            >
              <Globe size={18} />
              Portal JIKN Nasional
            </a>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-white border border-[#d6a54a]/30 rounded-2xl shadow-2xl p-5 flex gap-4 backdrop-blur-md"
          >
            <div className="bg-[#d6a54a]/10 text-[#d6a54a] w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
              <Archive size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#0c2f3d] text-sm mb-1">Halaman JIKN Dibuka!</h4>
              <p className="text-gray-600 text-xs leading-relaxed mb-2">
                Kata kunci <strong className="text-[#0c2f3d]">"{toastKeyword}"</strong> telah disalin ke clipboard Anda.
              </p>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-[11px] text-gray-500 font-medium flex flex-col items-start gap-2">
                <div className="flex items-center gap-1.5">
                  <kbd className="bg-white border border-gray-200 shadow-sm px-1.5 py-0.5 rounded text-[10px] text-gray-600 font-semibold font-sans">Ctrl + V</kbd>
                  <span>Tempel di kolom pencarian JIKN.</span>
                </div>
                {filterInstansi && (
                  <div className="text-[10px] text-[#c49540] font-semibold leading-normal border-t border-gray-200/60 pt-1.5 w-full">
                    💡 Centang filter "Dinas Kearsipan dan Perpustakaan Kabupaten Purwakarta" di panel kiri JIKN.
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-gray-400 hover:text-gray-600 self-start text-xs p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Tutup petunjuk"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
