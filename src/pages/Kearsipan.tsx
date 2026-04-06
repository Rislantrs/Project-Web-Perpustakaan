import { ArrowRight, MapPin, CheckCircle2, Home, Users, BookOpen, Clock, Copy, FolderKanban, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Kearsipan() {
  return (
    <div className="bg-[#fcfdfd] min-h-screen pt-12 pb-24">
      
      {/* 1. Hero Section: Terwujudnya Tertib Arsip */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <span className="text-[#d6a54a] font-bold text-sm tracking-widest uppercase mb-4 block">Layanan Kami</span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#0c2f3d] mb-6 leading-tight">
            Terwujudnya Tertib Arsip <br/>di Kabupaten Purwakarta
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed border-t border-gray-200 pt-8 mt-4">
            Dinas Kearsipan dan Perpustakaan Kabupaten Purwakarta dibentuk berdasarkan Peraturan Daerah Kabupaten Purwakarta Nomor 9 Tahun 2016 tentang Pembentukan dan Susunan Perangkat Daerah Kabupaten Purwakarta mempunyai tugas membantu Bupati melaksanakan urusan pemerintahan bidang kearsipan dan perpustakaan yang menjadi kewenangan Daerah dan tugas pembantuan yang diberikan kepada Daerah.
          </p>
        </motion.div>
      </section>

      {/* 2. Kantor Arsip (Image Right) */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl font-bold text-[#689f92] mb-6">Kantor Arsip</h2>
              <div className="flex items-start gap-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <MapPin className="text-[#d6a54a] mt-1 shrink-0" size={24} />
                <p className="text-gray-700 font-medium">Kantor Arsip bertempat di Jl. Veteran, No. 01, Komplek Perum Griya Asri, Ciseureuh, Kec. Purwakarta, Kabupaten Purwakarta, Jawa Barat.</p>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg">
                Dinas Arsip dan Perpustakaan Kabupaten Purwakarta merupakan gabungan antara Kantor Arsip Daerah Kabupaten Purwakarta dan Kantor Perpustakaan Daerah Kabupaten Purwakarta.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="lg:w-1/2 relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-[#689f92]/20 to-transparent rounded-3xl transform rotate-3"></div>
              <img src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=1200" alt="Gedung Kantor Arsip Purwakarta" className="relative rounded-2xl shadow-xl w-full object-cover aspect-[4/3]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Depo Arsip (Image Left) */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <img src="https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=1200" alt="Fasilitas Depo Arsip" className="rounded-2xl shadow-lg w-full object-cover aspect-[4/3]" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl font-bold text-[#689f92] mb-6">Depo Arsip</h2>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Dalam melaksanakan kegiatan kearsipan, Dinas Arsip dan Perpustakaan memiliki ruang untuk melakukan pengelolaan terkait arsip, diantaranya:
              </p>
              
              <ul className="space-y-4">
                {[
                  { title: 'Depo 1 (Ruang Arsip Statis)', icon: <BookOpen size={20} className="text-[#689f92]" /> },
                  { title: 'Depo 2', icon: <Home size={20} className="text-[#689f92]" /> },
                  { title: 'Depo 3', icon: <Home size={20} className="text-[#689f92]" /> },
                  { title: 'Depo 4', icon: <Home size={20} className="text-[#689f92]" /> },
                  { title: 'Ruang Transit Arsip', icon: <Clock size={20} className="text-[#689f92]" /> },
                  { title: 'Ruang Audio Visual', icon: <Copy size={20} className="text-[#689f92]" /> },
                  { title: 'Ruang Arsip Vital', icon: <ShieldCheck size={20} className="text-[#689f92]" /> },
                ].map((item, idx) => (
                  <motion.li 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-[#689f92]/50 transition-colors"
                  >
                    <div className="bg-[#689f92]/10 p-2 rounded-lg">
                      {item.icon}
                    </div>
                    <span className="font-semibold text-gray-800">{item.title}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Asosiasi Arsiparis (Image Right) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <div className="mb-4 inline-block bg-[#0c2f3d]/10 text-[#0c2f3d] px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase">Mitra Profesional</div>
              <h2 className="text-3xl font-bold text-[#689f92] mb-6">Asosiasi Arsiparis Indonesia</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-4">
                Asosiasi Arsiparis Indonesia (AAI) cabang kabupaten Purwakarta dilantik pada tahun 2022.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg border-l-4 border-[#d6a54a] pl-4 italic bg-gray-50 py-3 pr-3 rounded-r-lg">
                Kegiatan pelantikan Asosiasi Arsiparis Indonesia cabang Purwakarta dilaksanakan di Aula Dinas Arsip dan Perpustakaan Kabupaten Purwakarta.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="lg:w-1/2 relative"
            >
               <img src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=1200" alt="Pelantikan Asosiasi Arsiparis" className="relative rounded-2xl shadow-xl w-full object-cover aspect-video" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. SDM dan Pengembangan (Image Left) */}
      <section className="py-20 bg-[#f8f9fa] border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="lg:w-1/2 grid grid-cols-2 gap-4"
            >
              <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=600" alt="SDM 1" className="rounded-xl shadow-md w-full h-48 object-cover" />
              <img src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&q=80&w=600" alt="SDM 2" className="rounded-xl shadow-md w-full h-48 object-cover mt-8" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl font-bold text-[#689f92] mb-6">Sumber Daya Manusia & Pengembangan</h2>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Jumlah Pegawai Dinas Arsip dan Perpustakaan adalah <strong>40 Orang</strong>, yang telah naik pangkat Tahun 2009 sebanyak 18 orang, dan memiliki perkumpulan yaitu AAI (Assosiasi Arsiparis Indonesia). 
              </p>
              
              <h3 className="font-bold text-gray-900 mb-4 text-xl">Fokus Pengembangan SDM:</h3>
              <ul className="space-y-4">
                {[
                  'Penambahan Arsiparis dan Pengelola Arsip Baru (disetiap OPD).',
                  'Meningkatkan pengetahuan dan keterampilan (Pendidikan Formal, Diklat, Kursus, Seminar).',
                  'Melakukan pembinaan kepada pengelola Arsip di OPD, Kelurahan dan Desa.',
                  'Peningkatan kesejahteraan Arsiparis dan Pengelola Arsip.'
                ].map((item, idx) => (
                  <li key={idx} className="flex flex-start gap-3">
                    <CheckCircle2 className="text-[#d6a54a] shrink-0 mt-1" size={20} />
                    <span className="text-gray-700 leading-relaxed font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. Tata Cara Pengajuan Arsip untuk Masyarakat */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="bg-[#0c2f3d] text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase mb-4 inline-block">Panduan Layanan Publik</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#0c2f3d] mb-6">Tata Cara Pengajuan Arsip</h2>
            <p className="text-gray-600 text-lg">
              Kami melayani masyarakat umum dan akademisi yang membutuhkan data arsip statis kesejarahan atau informasi publik yang kami kelola secara terbuka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Desktop Connector Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>

            {[
              { 
                step: '01', 
                title: 'Siapkan Identitas Diri', 
                desc: 'Bawa KTP/Kartu Pelajar yang masih berlaku dan Surat Pengantar dari Instansi/Kampus (jika ada).',
                icon: <Users size={28} />
              },
              { 
                step: '02', 
                title: 'Isi Formulir Permohonan', 
                desc: 'Datang ke loket layanan Depo Arsip untuk mengisi formulir permohonan informasi ruang baca.',
                icon: <FolderKanban size={28} />
              },
              { 
                step: '03', 
                title: 'Pencarian oleh Petugas', 
                desc: 'Arsiparis kami akan memandu penelusuran melalui katalog Sistem Informasi Kearsipan.',
                icon: <BookOpen size={28} />
              },
              { 
                step: '04', 
                title: 'Pemberian Salinan', 
                desc: 'Jika arsip bersifat terbuka, Anda dapat membaca di tempat atau meminta salinan (fotokopi/digital).',
                icon: <Copy size={28} />
              }
            ].map((step, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.15 }}
                className="bg-white z-10 border border-gray-100 shadow-lg rounded-2xl p-8 relative flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="absolute -top-6 bg-[#689f92] text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-4 border-white shadow-sm">
                  {step.step}
                </div>
                <div className="w-16 h-16 bg-[#0c2f3d]/5 text-[#d6a54a] rounded-full flex items-center justify-center mb-6 mt-4 group-hover:bg-[#d6a54a] group-hover:text-white transition-colors">
                  {step.icon}
                </div>
                <h3 className="font-bold text-xl text-[#0c2f3d] mb-4">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 text-center max-w-2xl mx-auto bg-[#f8f9fa] p-6 rounded-2xl border border-gray-200">
             <p className="text-gray-700 font-medium">Bisa juga menelusuri katalog online melalui SIKN terlebih dahulu di website <a href="#" className="text-[#d6a54a] font-bold hover:underline">JIKN (Jaringan Informasi Kearsipan Nasional)</a> sebelum berkunjung secara fisik.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
