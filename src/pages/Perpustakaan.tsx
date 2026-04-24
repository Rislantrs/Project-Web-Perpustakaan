import { History, Target, Landmark, Clock, ChevronRight, CheckCircle2, Quote, BookOpen, MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';

// Assets
import heroImg from '../assets/layanan/perpustakaan/diorama-purwakarta-02.webp';
import perpusImg from '../assets/layanan/perpustakaan/Perpustakaan-Purwakarta-02.webp';

export default function Perpustakaan() {
  return (
    <div className="bg-[#fcfdfd] min-h-screen pt-12 pb-24 overflow-x-hidden">

      {/* --- 1. HERO SECTION (Standardized with Kearsipan) --- */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[#d6a54a] font-bold text-sm tracking-widest uppercase mb-4 block">Layanan Kami</span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#0c2f3d] mb-6 leading-tight">
            Membangun Budaya Baca <br />di Seluruh Lapisan Masyarakat
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed border-t border-gray-200 pt-8 mt-4 font-serif italic">
            "Membangun Budaya Baca di Seluruh Lapisan Masyarakat Kabupaten Purwakarta"
          </p>
        </motion.div>
      </section>

      {/* --- 2. QUICK STATS (3 Column Grid) --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Pusat Literasi', icon: <Landmark className="text-blue-600" />, desc: 'Menjadi jantung ilmu pengetahuan masyarakat selama lebih dari 7 dekade.' },
            { title: 'Inovasi Digital', icon: <Sparkles className="text-amber-600" />, desc: 'Pelopor perpustakaan digital pertama di Jawa Barat dengan akses tanpa batas.' },
            { title: 'Koleksi Luas', icon: <BookOpen className="text-emerald-600" />, desc: 'Ribuan koleksi buku fisik dan digital untuk seluruh generasi.' }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-[#0c2f3d] mb-3">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- 3. SEJARAH 1953 (Standardized: Image Left) --- */}
      <section className="py-20 bg-gray-50 border-y border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="lg:w-1/2"
            >
               <div className="relative rounded-2xl shadow-xl overflow-hidden aspect-[4/3] group">
                <img src={heroImg} alt="Masa Awal" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute top-4 left-4 bg-[#8b1c24] text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-widest">Era 1953</div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl font-bold text-[#0c2f3d] mb-6">Masa Awal Berdiri</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                Keberadaan perpustakaan daerah di Kabupaten Purwakarta telah dimulai sejak tahun <strong>1953</strong> dengan keputusan Kepala JAPERNAS Kementrian Pendidikan, Pengajaran dan Kebudayaan tanggal 26 Nopember 1953.
              </p>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-gray-700 font-medium italic border-l-4 border-[#d6a54a] pl-4">
                  "Pada tahun 1978 didirikan Taman Pustaka Masyarakat dengan status TPM/C yang beralamat di Komplek SD Singawinata."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- 4. TRANSFORMASI (Standardized: Image Right) --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl font-bold text-[#0c2f3d] mb-6">Transformasi & Status</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-lg mb-8">
                <p>
                  Tahun 1990 statusnya berubah menjadi Unit Pelaksana Teknis Daerah (UPTD) Perpustakaan. Kemudian pada tahun 2000 kembali berubah menjadi Kantor Perpustakaan Daerah Kabupaten Purwakarta.
                </p>
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <MapPin className="text-[#d6a54a] mt-1 shrink-0" size={24} />
                  <p className="text-gray-700 font-medium">Berlokasi di kawasan wisata Situ Buleud yang ikonik berdasarkan Perda Nomor 11 Tahun 2008.</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="lg:w-1/2"
            >
               <div className="relative rounded-2xl shadow-xl overflow-hidden aspect-[4/3]">
                <img src={perpusImg} alt="Gedung Baru" className="w-full h-full object-cover" />
                <div className="absolute bottom-4 right-4 bg-[#0c2f3d] text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-widest">Era 2000-an</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- 5. MODERN QUOTE (Standardized) --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="bg-[#0c2f3d] p-12 md:p-16 rounded-[2.5rem] text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <Quote className="text-[#d6a54a]/20 w-16 h-16 absolute top-10 left-10" />
          <h2 className="relative z-10 text-2xl md:text-4xl font-serif italic text-white mb-6">
            "Perpustakaan Digital Pertama di Jawa Barat"
          </h2>
          <div className="relative z-10 w-12 h-0.5 bg-[#d6a54a] mx-auto mb-4"></div>
          <p className="text-[#d6a54a] font-bold tracking-widest uppercase text-sm">Media Indonesia (14 Februari 2019)</p>
        </motion.div>
      </section>

      {/* --- 6. MISI STRATEGIS (Standardized with Check List) --- */}
      <section className="py-20 bg-[#f8f9fa] border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
            <div className="lg:w-1/3">
              <span className="bg-[#d6a54a] text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4 inline-block">Misi Kami</span>
              <h2 className="text-3xl font-bold text-[#0c2f3d] mb-6">Misi Strategis Bidang Layanan</h2>
              <p className="text-gray-600 text-lg">Langkah nyata kami dalam mewujudkan masyarakat Purwakarta yang cerdas dan berbudaya baca.</p>
            </div>
            <div className="lg:w-2/3">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Menyelenggarakan Layanan Perpustakaan',
                  'Membina, mengembangkan minat baca',
                  'Mendayagunakan semua jenis perpustakaan',
                  'Penataan layanan ke arah Otomasi',
                  'Mengembangkan buku perpustakaan'
                ].map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-[#d6a54a]/50 transition-colors"
                  >
                    <CheckCircle2 className="text-[#d6a54a] shrink-0" size={24} />
                    <span className="font-semibold text-gray-800">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- 7. FINAL CTA --- */}
      <section className="mt-24 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <Link
            to="/katalog"
            className="inline-flex items-center gap-3 bg-[#0c2f3d] text-white px-10 py-5 rounded-full font-bold hover:bg-[#1a4254] transition-all shadow-xl hover:-translate-y-1"
          >
            Mulai Menjelajahi Katalog Buku <ChevronRight size={20} />
          </Link>
          <p className="mt-6 text-gray-400 text-sm italic">Akses koleksi fisik dan digital sekarang juga</p>
        </motion.div>
      </section>

    </div>
  );
}
