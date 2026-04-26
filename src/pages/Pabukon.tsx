import { BookOpen, BarChart3, UserPlus, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';

export default function Pabukon() {
  // HARDCODE FEATURE MAP:
  // setiap kartu punya route CTA sendiri.
  // jika struktur menu berubah, update link di sini.
  const pabukonFeatures = [
    {
      id: 'opac',
      title: 'Pabukon OPAC',
      subtitle: 'Online Public Access Catalog',
      description: 'Sarana bagi pemustaka untuk mencari koleksi yang dibutuhkan di perpustakaan secara digital dan seketika.',
      icon: <BookOpen size={48} className="text-[#d6a54a]" />,
      link: '/perpustakaan',
      color: 'from-[#0c2f3d] to-[#15465c]',
      btnText: 'Cari Buku Sekarang'
    },
    {
      id: 'statistik',
      title: 'Pabukon Statistik',
      subtitle: 'Data & Laporan Kunjungan',
      description: 'Statistik perkembangan seputar perpustakaan meliputi grafik anggota, jumlah kunjungan, dan bahan pustaka yang dikelola.',
      icon: <BarChart3 size={48} className="text-[#0c2f3d]" />,
      link: '/artikel?kategori=Statistik',
      color: 'from-[#eef2f3] to-[#e0e7e9]',
      textColor: 'text-[#0c2f3d]',
      descColor: 'text-gray-600',
      btnBg: 'bg-white text-[#0c2f3d] border border-[#0c2f3d]',
      btnText: 'Lihat Statistik'
    },
    {
      id: 'daftar',
      title: 'Pabukon Daftar',
      subtitle: 'Registrasi Anggota Online',
      description: 'Layanan pendaftaran keanggotaan perpustakaan secara online yang cepat, mudah, dan terintegrasi.',
      icon: <UserPlus size={48} className="text-white" />,
      link: '/register',
      color: 'from-[#d6a54a] to-[#c09440]',
      btnBg: 'bg-white text-[#d6a54a]',
      btnText: 'Daftar Anggota'
    }
  ];

  return (
    <div className="bg-[#f8f9fa] min-h-screen pt-12 pb-24">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0c2f3d]/5 text-[#0c2f3d] mb-6"
        >
          <BookOpen size={16} />
          <span className="text-sm font-bold tracking-widest uppercase">Portal Layanan</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-serif font-bold text-[#1a1a1a] mb-6"
        >
          Pabukon Purwakarta
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 max-w-3xl mx-auto italic font-serif"
        >
          "Membangun Budaya Baca di Seluruh Lapisan Masyarakat Kabupaten Purwakarta melalui integrasi sistem digital terpadu."
        </motion.p>
      </div>

      {/* Cards Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pabukonFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (index * 0.1) }}
              className={`relative overflow-hidden rounded-3xl p-8 shadow-xl bg-gradient-to-br ${feature.color} flex flex-col h-full group hover:-translate-y-2 transition-transform duration-300`}
            >
              {/* Background Decoration */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10 flex-grow">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-8 shadow-inner ${feature.textColor ? 'bg-white' : 'bg-white/10 backdrop-blur-md'}`}>
                  {feature.icon}
                </div>
                
                <h2 className={`text-2xl font-bold mb-2 ${feature.textColor || 'text-white'}`}>
                  {feature.title}
                </h2>
                <h3 className={`text-sm tracking-wider uppercase font-bold mb-6 opacity-80 ${feature.textColor || 'text-white'}`}>
                  {feature.subtitle}
                </h3>
                
                <p className={`leading-relaxed mb-10 ${feature.descColor || 'text-white/80'}`}>
                  {feature.description}
                </p>
              </div>

              <div className="relative z-10 mt-auto">
                <Link 
                  to={feature.link}
                  className={`inline-flex items-center justify-center w-full gap-2 px-6 py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg ${
                    feature.btnBg || 'bg-[#d6a54a] text-white hover:bg-[#c09440]'
                  }`}
                >
                  {feature.btnText}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
