import { motion } from 'motion/react';
import { 
  Users, 
  Handshake, 
  BookOpen, 
  MapPin, 
  Settings, 
  ClipboardCheck, 
  Clock, 
  Award, 
  HeartHandshake,
  ShieldCheck
} from 'lucide-react';

// HARDCODE SOP CONTENT:
// langkah prosedur kelompok rentan disimpan statis untuk konsistensi tampilan.
// update list ini jika SOP pelayanan resmi berubah.

const prosedurRentan = [
  {
    step: 1,
    title: "Penyambutan",
    desc: "Petugas menyambut kedatangan tamu dari kelompok rentan dengan ramah dan sigap di pintu utama.",
    icon: <Handshake className="text-[#d6a54a]" size={32} />
  },
  {
    step: 2,
    title: "Pendampingan Resepsionis",
    desc: "Tamu didampingi petugas menuju resepsionis untuk menyampaikan kebutuhan layanan yang diperlukan.",
    icon: <Users className="text-[#d6a54a]" size={32} />
  },
  {
    step: 3,
    title: "Pengisian Buku Tamu",
    desc: "Tamu mengisi buku tamu dengan bimbingan dan bantuan penuh dari petugas kami.",
    icon: <BookOpen className="text-[#d6a54a]" size={32} />
  },
  {
    step: 4,
    title: "Akses Ruang Pelayanan",
    desc: "Petugas mendampingi tamu menuju ruang pelayanan khusus yang nyaman dan aksesibel.",
    icon: <MapPin className="text-[#d6a54a]" size={32} />
  },
  {
    step: 5,
    title: "Penerimaan Layanan",
    desc: "Tamu kelompok rentan menerima layanan prioritas sesuai dengan kebutuhan informasi atau arsip.",
    icon: <Settings className="text-[#d6a54a]" size={32} />
  },
  {
    step: 6,
    title: "Pengisian Survey",
    desc: "Mengisi Survey Kepuasan Pelanggan didampingi oleh petugas untuk memastikan masukan tersampaikan.",
    icon: <ClipboardCheck className="text-[#d6a54a]" size={32} />
  }
];

export default function LayananRentan() {
  return (
    <div className="min-h-screen bg-[#f8fafc] pt-0 pb-20">
      
      {/* Hero Header */}
      <section className="relative py-16 bg-[#0c2f3d] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#d6a54a] rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#d6a54a] mb-6 shadow-sm">
              <HeartHandshake size={18} />
              <span className="text-xs font-bold tracking-[0.2em] uppercase">Layanan Inklusif</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              Standar Pelayanan <span className="text-[#d6a54a]">Kelompok Rentan</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Komitmen kami untuk memberikan aksesibilitas penuh dan pelayanan prioritas bagi lansia, penyandang disabilitas, ibu hamil, dan anak-anak.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mekanisme Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          <div className="lg:w-1/3 lg:sticky lg:top-32">
            <h2 className="font-serif text-3xl font-bold text-[#0c2f3d] mb-6">Mekanisme & Prosedur</h2>
            <div className="w-20 h-1.5 bg-[#d6a54a] mb-8"></div>
            <p className="text-gray-600 leading-relaxed mb-8">
              Bertujuan untuk memastikan pelayanan yang adil, efektif, dan sesuai dengan kebutuhan kelompok rentan, serta menjamin pengalaman yang nyaman dan memuaskan.
            </p>
            <div className="p-6 bg-[#0c2f3d]/5 rounded-2xl border border-[#0c2f3d]/10">
              <div className="flex items-center gap-3 text-[#0c2f3d] font-bold mb-2">
                <ShieldCheck size={20} className="text-[#d6a54a]" />
                Jam Layanan Prioritas
              </div>
              <p className="text-sm text-gray-500 italic">Tersedia setiap hari kerja sesuai jam operasional kantor.</p>
            </div>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {prosedurRentan.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-full -mr-12 -mt-12 group-hover:bg-[#d6a54a]/10 transition-colors"></div>
                <div className="relative z-10">
                  <div className="mb-6">{item.icon}</div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[#d6a54a] font-serif italic text-2xl font-bold opacity-30">{item.step}.</span>
                    <h3 className="text-xl font-bold text-[#0c2f3d]">{item.title}</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Grid */}
      <section className="bg-white py-24 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Prioritas */}
            <div className="bg-[#f8fafc] p-10 rounded-3xl border border-gray-200 group hover:border-[#d6a54a] transition-all">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#d6a54a] mb-8 shadow-sm group-hover:bg-[#0c2f3d] group-hover:text-[#d6a54a] transition-all">
                <Clock size={28} />
              </div>
              <h3 className="text-2xl font-bold text-[#0c2f3d] mb-4">Prioritas Utama</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Tamu dari kelompok rentan akan diprioritaskan dalam proses antrian untuk memastikan pelayanan yang cepat dan efisien tanpa waktu tunggu lama.
              </p>
            </div>

            {/* Produk Layanan */}
            <div className="bg-[#f8fafc] p-10 rounded-3xl border border-gray-200 group hover:border-[#d6a54a] transition-all">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#d6a54a] mb-8 shadow-sm group-hover:bg-[#0c2f3d] group-hover:text-[#d6a54a] transition-all">
                <Award size={28} />
              </div>
              <h3 className="text-2xl font-bold text-[#0c2f3d] mb-4">Produk Layanan</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Menyediakan akses ke data dan informasi publik terkait bidang kearsipan dan perpustakaan secara mudah dan transparan.
              </p>
            </div>

            {/* Biaya */}
            <div className="bg-[#0c2f3d] p-10 rounded-3xl border border-[#d6a54a]/30 group hover:border-[#d6a54a] transition-all text-white">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#d6a54a] mb-8 shadow-sm group-hover:bg-[#d6a54a] group-hover:text-[#0c2f3d] transition-all">
                <span className="font-bold text-lg">Rp</span>
              </div>
              <h3 className="text-2xl font-bold text-[#d6a54a] mb-4">Biaya Gratis</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Tidak ada biaya yang dikenakan untuk semua jenis layanan yang diberikan kepada kelompok rentan. Seluruh akses informasi tersedia secara cuma-cuma.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 max-w-4xl mx-auto px-4 text-center">
        <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <HeartHandshake className="text-gray-50 opacity-10" size={120} />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#0c2f3d] mb-4">Butuh Bantuan Lebih?</h2>
          <p className="text-gray-500 mb-8">Petugas kami siap membantu kebutuhan khusus Anda di lokasi.</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-bold text-[#d6a54a]">
            <span className="px-6 py-2 rounded-full bg-gray-50">Lansia</span>
            <span className="px-6 py-2 rounded-full bg-gray-50">Disabilitas</span>
            <span className="px-6 py-2 rounded-full bg-gray-50">Ibu Hamil</span>
            <span className="px-6 py-2 rounded-full bg-gray-50">Anak-anak</span>
          </div>
        </div>
      </section>

    </div>
  );
}
