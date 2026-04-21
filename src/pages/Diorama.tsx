import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayCircle, Heart, PhoneCall, CheckCircle, Smartphone, MessageCircle } from 'lucide-react';

// Import Images for Nusantara
import n1 from '../assets/layanan/dioramaNusantara/image-1.webp';
import n2 from '../assets/layanan/dioramaNusantara/image-2.webp';
import n3 from '../assets/layanan/dioramaNusantara/image-3.webp';
import n4 from '../assets/layanan/dioramaNusantara/image-4.webp';
import n5 from '../assets/layanan/dioramaNusantara/image-5.webp';
import n6 from '../assets/layanan/dioramaNusantara/image-6.webp';
import n7 from '../assets/layanan/dioramaNusantara/image-7.webp';
import n8 from '../assets/layanan/dioramaNusantara/image-8.webp';
import n9 from '../assets/layanan/dioramaNusantara/image-9.webp';
import n10 from '../assets/layanan/dioramaNusantara/image-10.webp';
import n11 from '../assets/layanan/dioramaNusantara/image-11.webp';
import n12 from '../assets/layanan/dioramaNusantara/image-12.webp';

// Import Images for Purwakarta
import p1 from '../assets/layanan/dioramaPurwakarta/image-1.webp';
import p2 from '../assets/layanan/dioramaPurwakarta/image-2.webp';
import p3 from '../assets/layanan/dioramaPurwakarta/image-3.webp';
import p4 from '../assets/layanan/dioramaPurwakarta/image-4.webp';
import p5 from '../assets/layanan/dioramaPurwakarta/image-5.webp';
import p6 from '../assets/layanan/dioramaPurwakarta/image-6.webp';
import p7 from '../assets/layanan/dioramaPurwakarta/image-7.webp';
import p8 from '../assets/layanan/dioramaPurwakarta/image-8.webp';
import p9 from '../assets/layanan/dioramaPurwakarta/image-9.webp';

// Import Hero Images
import heroPurwakarta from '../assets/layanan/perpustakaan/diorama-purwakarta-02.webp';
import heroNusantara from '../assets/layanan/dioramaNusantara/diorama-nusantara.webp';

const purwakartaSegments = [
  {
    title: 'Bale Prabu Maharaja LinggaBhuwana',
    desc: 'Menyajikan Sejarah Tatar Sunda.',
    img: p9
  },
  {
    title: 'Bale Prabu Niskala Wastukancana',
    desc: 'Hall of Fame Menampilkan Sosok Para Pemimpin Purwakarta.',
    img: p8
  },
  {
    title: 'Bale Prabu Dewaniskala',
    desc: 'Menggambarkan Purwakarta pada masa pengaruh mataram, VOC dan Hindia Belanda dalam rentang waktu tahun 1620 – 1799.',
    img: p7
  },
  {
    title: 'Bale Prabu Nigratwangi',
    desc: 'Menyajikan Purwakarta pada masa Hindia Belanda tahun 1800 – 1942.',
    img: p6
  },
  {
    title: 'Bale Prabu Jayaningrat',
    desc: 'Menampilkan gambaran Purwakarta pada masa pergerakan nasional dan masa pendudukan Jepang.',
    img: p5
  },
  {
    title: 'Bale Prabu Ratudewata',
    desc: 'Menyajikan keadaan Purwakarta pada masa kemerdekaan 1945 – 1950, dimulai dengan peristiwa Rengasdengklok, dan pada jaman Demokrasi Liberal tahun 1950 – 1959.',
    img: p4
  },
  {
    title: 'Bale Prabu Nilakendra',
    desc: 'Menampilkan Purwakarta pada masa Demokrasi terpimpin 1959 – 1967.',
    img: p3
  },
  {
    title: 'Bale Prabu Surawisesa',
    desc: 'Menyajikan Purwakarta pada masa pemerintahan 1968 – 1998 serta Era Reformasi 1998 hingga sekarang.',
    img: p2
  },
  {
    title: 'Bale Ki Pamanah Rasa',
    desc: 'Memberikan gambaran “Digjaya Purwakarta Istimewa“ 2008 – 2018.',
    img: p1
  }
];

const nusantaraSegments = [
  {
    title: 'Bale Jawa',
    desc: 'Area Lobby menyajikan virtual tour multimedia selamat datang dan penyambutan tamu.',
    img: n12
  },
  {
    title: 'Bale Madura',
    desc: 'Menyajikan peradaban manusia prasejarah, sejarah manusia purba di Indonesia dan proses terbentuknya nusantara.',
    img: n11
  },
  {
    title: 'Bale Sumatera',
    desc: 'Menyajikan multimedia zaman prasejarah, proses terbentuknya daratan bumi dan peninggalan zaman prasejarah.',
    img: n10
  },
  {
    title: 'Bale Bali',
    desc: 'Menyajikan kerajaan-kerajaan pada masa pengaruh Hindu, Budha dan Islam di Indonesia.',
    img: n9
  },
  {
    title: 'Bale NTB/Lombok',
    desc: 'Menyajikan masa kesultanan Islam dan kerajaan-kerajaan Nusantara.',
    img: n8
  },
  {
    title: 'Bale NTT / Flores',
    desc: 'Menyajikan multimedia kerajaan di Indonesia dan mural relief raja-raja Nusantara.',
    img: n7
  },
  {
    title: 'Bale Kalimantan',
    desc: 'Menyajikan pengaruh budaya barat terhadap arsitektur bangunan, sosial budaya, kesenian dan pendidikan di Nusantara.',
    img: n6
  },
  {
    title: 'Bale Sulawesi',
    desc: 'Menyajikan perkembangan pelayaran dan replika kapal-kapal laut di Nusantara.',
    img: n5
  },
  {
    title: 'Bale Papua',
    desc: 'Menyajikan keanekaragaman nusantara dan ruang multimedia kelautan.',
    img: n4
  },
  {
    title: 'Bale Maluku',
    desc: 'Menyajikan keanekaragaman budaya, kekayaan alam, adat istiadat, simbol daerah, hingga kuliner dari setiap provinsi.',
    img: n3
  },
  {
    title: 'Bale Purwakarta Istimewa',
    desc: 'Menyajikan pesona Purwakarta, capaian pembangunan dan penghargaan dari UNESCO Warisan Nusantara.',
    img: n2
  },
  {
    title: 'Plaza Nusantara',
    desc: 'Area pintu masuk menyajikan wilayah di Indonesia yang terbagi menjadi daerah dan pulau-pulau.',
    img: n1
  }
];

export default function Diorama() {
  const [activeTab, setActiveTab] = useState<'purwakarta' | 'nusantara'>('purwakarta');

  return (
    <div className="bg-white min-h-screen pt-20 pb-24">
      {/* Tab Switcher / Toggle */}
      <div className="flex justify-center mt-8 mb-12">
        <div className="bg-gray-100 p-1.5 rounded-full inline-flex relative shadow-inner">
          <button
            onClick={() => setActiveTab('purwakarta')}
            className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-colors duration-300 ${activeTab === 'purwakarta' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Diorama Purwakarta
          </button>
          <button
            onClick={() => setActiveTab('nusantara')}
            className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-colors duration-300 ${activeTab === 'nusantara' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Diorama Nusantara
          </button>

          {/* Animated Background Indicator */}
          <div
            className="absolute top-1.5 bottom-1.5 w-1/2 bg-[#0c2f3d] rounded-full shadow-md transition-transform duration-300 ease-in-out"
            style={{ transform: activeTab === 'purwakarta' ? 'translateX(0)' : 'translateX(100%)' }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === 'purwakarta' ? (
            /* =========================================================
               KONTEN DIORAMA PURWAKARTA
               ========================================================= */
            <div>
              {/* Hero Section */}
              <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20 mb-20">
                <div className="lg:w-1/2">
                  <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#0c2f3d] mb-4">
                    Bale Panyawangan <br /> Diorama Purwakarta
                  </h1>
                  <p className="text-[#d6a54a] font-serif text-xl italic mb-6">“ Neuleuman Lampah Ki Sunda ”</p>

                  <p className="text-gray-600 text-lg leading-relaxed mb-4">
                    Pembangunan Bale Panyawangan Diorama Purwakarta diprakarsai oleh Bupati Purwakarta Kang Dedi Mulyadi yang bertujuan untuk mengangkat peranan arsip sebagai bagian penting dari proses kehidupan berbangsa, bernegara dan bermasyarakat.
                  </p>
                  <p className="text-gray-600 text-lg leading-relaxed mb-4">
                    Bale Panyawangan Diorama Purwakarta merupakan ungkapan sejarah Purwakarta dan perkembangan dari masa ke masa yang di tampilkan melalui perpaduan arsip, seni, dan teknologi.
                  </p>
                  <p className="text-gray-600 text-lg leading-relaxed border-l-4 border-[#0c2f3d] pl-4">
                    Penggubahan bentuk arsip menjadi karya seni dengan sentuhan teknologi adalah untuk memperkenalkan arsip kepada masyarakat dengan cara yang mudah dipahami dan menarik.
                  </p>
                </div>
                <div className="lg:w-1/2 w-full">
                  <div className="aspect-[16/10] bg-gray-200 rounded-2xl overflow-hidden shadow-2xl relative group">
                    <img src={heroPurwakarta} alt="Bale Panyawangan Diorama Purwakarta" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                  </div>
                </div>
              </section>

              {/* Video Section (Commented out until link is ready)
              <section className="bg-[#0c2f3d] relative py-24 mb-20 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 -left-40 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 -right-40 w-96 h-96 bg-[#d6a54a] rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                  <h2 className="text-4xl font-serif font-bold mb-4">Konten Diorama</h2>
                  <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
                    Ingin tahu seperti apa isi Bale Panyawangan Diorama Purwakarta? Silakan tekan tombol “Play”
                  </p>
                  
                  <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group max-w-4xl mx-auto border-4 border-white/10">
                    <img src="https://images.unsplash.com/photo-1544321852-7e9b0682ba7b?auto=format&fit=crop&q=80&w=1200" alt="Video Thumbnail" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                    <button className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center pl-2 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <PlayCircle size={40} className="stroke-[1.5]" />
                      </div>
                    </button>
                  </div>
                </div>
              </section>
              */}

              {/* 9 Segmen Diorama Grid */}
              <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#0c2f3d] mb-4">9 Segmen Diorama</h2>
                  <p className="text-[#d6a54a] font-bold uppercase tracking-widest text-sm">Rangkaian Materi Bale Panyawangan Diorama Purwakarta</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {purwakartaSegments.map((seg, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="aspect-video overflow-hidden relative">
                        <img src={seg.img} alt={seg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                          Segmen 0{idx + 1}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-xl text-[#0c2f3d] mb-3 leading-snug group-hover:text-[#d6a54a] transition-colors">{seg.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{seg.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            /* =========================================================
               KONTEN DIORAMA NUSANTARA
               ========================================================= */
            <div>
              <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20 mb-20">
                <div className="lg:w-1/2">
                  <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#0c2f3d] mb-4">
                    Bale Panyawangan <br /> Diorama Nusantara
                  </h1>
                  <p className="text-[#d6a54a] font-serif text-xl italic mb-6">“ Menjelajah Sejarah Bangsa ”</p>

                  <p className="text-gray-600 text-lg leading-relaxed mb-4">
                    Bale Panyawangan Diorama Nusantara membawa pengunjung dalam sebuah perjalanan epik melintasi ribuan tahun sejarah kepulauan Indonesia.
                  </p>
                  <p className="text-gray-600 text-lg leading-relaxed border-l-4 border-[#0c2f3d] pl-4">
                    Penggubahan bentuk arsip menceritakan terbentuknya Nusantara, kejayaan kerajaan-kerajaan besar, hingga proklamasi kemerdekaan yang dikemas dengan teknologi digital modern kelas dunia.
                  </p>
                </div>
                <div className="lg:w-1/2 w-full">
                  <div className="aspect-[16/10] bg-gray-200 rounded-2xl overflow-hidden shadow-2xl relative group">
                    <img src={heroNusantara} alt="Bale Panyawangan Diorama Nusantara" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                  </div>
                </div>
              </section>

              {/* 12 Segmen Diorama Nusantara Grid */}
              <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#0c2f3d] mb-4">12 Segmen Diorama Nusantara</h2>
                  <p className="text-[#d6a54a] font-bold uppercase tracking-widest text-sm">Menelusuri Jejak Sejarah Kepulauan Indonesia</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {nusantaraSegments.map((seg, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="aspect-video overflow-hidden relative">
                        <img src={seg.img} alt={seg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                          Segmen 0{idx + 1}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-xl text-[#0c2f3d] mb-3 leading-snug group-hover:text-[#d6a54a] transition-colors">{seg.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{seg.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Video Section (Commented out until link is ready)
              <section className="bg-[#0c2f3d] relative py-24 mb-20 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 -left-40 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 -right-40 w-96 h-96 bg-[#d6a54a] rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                  <h2 className="text-4xl font-serif font-bold mb-4">Konten Diorama Nusantara</h2>
                  <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
                    Ingin tahu seperti apa isi Bale Panyawangan Diorama Nusantara? Silakan tekan tombol “Play”
                  </p>
                  
                  <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group max-w-4xl mx-auto border-4 border-white/10">
                    <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1200" alt="Video Thumbnail" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                    <button className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center pl-2 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <PlayCircle size={40} className="stroke-[1.5]" />
                      </div>
                    </button>
                  </div>
                </div>
              </section>
              */}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* =========================================================
          INFO PELAYANAN (DITAMPILKAN DI KEDUA TAB)
          ========================================================= */}
      <section className="bg-gray-50 border-t border-gray-200 py-20 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

            {/* Ramah Kelompok Rentan */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 text-red-50 opacity-50">
                <Heart size={180} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-[#0c2f3d] mb-4 flex items-center gap-3">
                  <Heart className="text-red-500" /> Ramah Kelompok Rentan
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Bale Panyawangan diorama saat ini telah memiliki fasilitas ramah kelompok rentan.<br />
                  Kami memberikan prioritas layanan untuk pengunjung diorama diantaranya:
                </p>
                <ul className="space-y-3">
                  {['Difabel', 'Lansia', 'Ibu Hamil', 'Ibu Menyusui'].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                      <CheckCircle size={20} className="text-[#689f92]" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Layanan Pengaduan */}
            <div className="bg-[#0c2f3d] text-white p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 text-white/5">
                <MessageCircle size={180} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <PhoneCall className="text-[#d6a54a]" /> Layanan Pengaduan
                </h3>
                <p className="text-gray-300 mb-8 leading-relaxed">
                  Sampaikan pengaduan anda berkenaan dengan layanan Bale Panyawangan Purwakarta melalui jalur yang tersedia:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a href="tel:112" className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all hover:-translate-y-1 block">
                    <p className="text-gray-300 text-xs mb-1 uppercase tracking-wider">Telepon Darurat</p>
                    <p className="font-bold text-lg">Call Center 112</p>
                  </a>
                  <a href="https://wa.me/6285624657172" target="_blank" rel="noreferrer" className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all hover:-translate-y-1 block">
                    <p className="text-gray-300 text-xs mb-1 uppercase tracking-wider">Aplikasi Chat</p>
                    <p className="font-bold text-lg flex items-center gap-2"><Smartphone size={18} /> Whatsapp</p>
                  </a>
                  <a href="https://oganlopian.purwakartakab.go.id/" target="_blank" rel="noreferrer" className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all hover:-translate-y-1 block">
                    <p className="text-gray-300 text-xs mb-1 uppercase tracking-wider">Aplikasi Resmi</p>
                    <p className="font-bold text-lg">Ogan Lopian</p>
                  </a>
                  <a href="https://span.lapor.go.id/" target="_blank" rel="noreferrer" className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all hover:-translate-y-1 block">
                    <p className="text-gray-300 text-xs mb-1 uppercase tracking-wider">Portal Nasional</p>
                    <p className="font-bold text-lg">Span LAPOR</p>
                  </a>
                </div>

                <div className="mt-4 bg-[#d6a54a] text-white p-4 rounded-xl font-bold text-center hover:bg-[#c09440] transition-colors cursor-pointer">
                  Atau Pengaduan Langsung ke Loket
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
