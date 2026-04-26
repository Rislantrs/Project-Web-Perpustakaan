import { motion } from 'motion/react';
import { 
  MessageSquare, 
  Layers, 
  Cpu, 
  Workflow, 
  FileSearch, 
  FileText, 
  Shield, 
  Clock, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

// HARDCODE CONTENT:
// daftar layanan, prosedur, dan materi pemeliharaan disusun statis.
// update array di file ini ketika ada perubahan SOP resmi kearsipan.

const jasaKearsipan = [
  {
    title: "Konsultasi Kearsipan",
    desc: "Melayani konsultasi untuk membantu menyelesaikan permasalahan kearsipan, sejak dari tata persuratan, pengurusan surat, pengelolaan arsip aktif, penanganan arsip inaktif sampai dengan penyusutan (termasuk Jra).",
    icon: <MessageSquare size={24} />
  },
  {
    title: "Pembenahan / Penataan Arsip",
    desc: "Membantu merekonstruksi/menata ulang dan melaksanakan pembenahan/penataan arsip/dokumen kacau secara tepat dan benar baik fisik maupun informasinya sehingga memudahkan dalam penemuan kembali.",
    icon: <Layers size={24} />
  },
  {
    title: "Pembuatan Sistem Kearsipan",
    desc: "Sistem kearsipan yang dirancang dan dibuat sesuai dengan kondisi instansi masing-masing, membantu kelancaran kegiatan administrasi sejak arsip diciptakan sampai penyusutan.",
    icon: <Workflow size={24} />
  },
  {
    title: "Penyempurnaan Sistem",
    desc: "Menyempurnakan sistem yang telah ada dengan memperhatikan kaidah-kaidah kearsipan sehingga menempatkan sistem yang aplikatif.",
    icon: <Shield size={24} />
  },
  {
    title: "Otomasi Kearsipan",
    desc: "Penggunaan sarana elektronik guna mendukung pengelolaan arsip agar informasinya dapat diakses dengan lebih cepat dan akurat.",
    icon: <Cpu size={24} />
  }
];

const prosedurPinjam = [
  "Membuat surat permohonan peminjaman arsip dari OPD yang bersangkutan",
  "Menunjukan identitas diri",
  "Mengisi formulir yang telah disediakan",
  "Petugas mengecek keberadaan arsip",
  "Peminjaman Arsip harus mendapat pengesahan dari Kepala Kantor",
  "Arsip yang dipinjam di foto copy dan dilegalisir oleh Kasubag Tata Usaha"
];

const pemeliharaanArsip = [
  "Pemeliharaan Arsip dilakukan dengan cara melaksanakan Fumigasi minimal 2 kali dalam satu tahun.",
  "Melakukan pengecekan setiap hari kebersihan depo arsip dan pengecekan rutin sarana kearsipan.",
  "Arsip yang bernilai guna tinggi dipisahkan tempat penyimpanannya."
];

export default function JasaKearsipan() {
  return (
    <div className="min-h-screen bg-white pt-0 pb-20">
      
      {/* Hero Header */}
      <section className="relative py-20 bg-[#0c2f3d] overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#d6a54a]/5 -skew-x-12 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#d6a54a] text-xs font-bold tracking-[0.3em] uppercase mb-6">Professional Services</div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              Jasa Kearsipan & <span className="text-[#d6a54a]">Prosedur Pelayanan</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Solusi manajemen dokumen terintegrasi untuk instansi pemerintah dan swasta guna mewujudkan tata kelola arsip yang modern dan akuntabel.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Jasa Kearsipan Timeline */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="font-serif text-3xl font-bold text-[#0c2f3d] mb-4">Layanan Jasa Kearsipan</h2>
          <div className="w-16 h-1 bg-[#d6a54a] mx-auto"></div>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gray-100 md:-translate-x-1/2 pointer-events-none"></div>

          <div className="space-y-12">
            {jasaKearsipan.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`relative flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Connector Dot */}
                <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-[#d6a54a] md:-translate-x-1/2 border-4 border-white shadow-sm z-20"></div>
                
                <div className="w-full md:w-1/2">
                  <div className={`p-8 rounded-3xl border border-gray-100 bg-white transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 group ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className={`w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#d6a54a] mb-6 group-hover:bg-[#0c2f3d] group-hover:text-white transition-all ${idx % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'}`}>
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-[#0c2f3d] mb-4">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <div className="hidden md:block w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prosedur Peminjaman */}
      <section className="bg-gray-50 py-24 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            <div>
              <div className="flex items-center gap-3 text-[#d6a54a] font-bold text-sm tracking-widest uppercase mb-4">
                <FileSearch size={20} />
                Langkah Kerja
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#0c2f3d] mb-8 leading-tight">Prosedur Peminjaman Arsip</h2>
              
              <div className="space-y-4">
                {prosedurPinjam.map((step, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#d6a54a] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#0c2f3d] font-bold group-hover:bg-[#0c2f3d] group-hover:text-white transition-colors">
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{step}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-[#0c2f3d] p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:bg-[#d6a54a]/10 transition-all duration-700"></div>
                
                <h3 className="font-serif text-2xl font-bold mb-8 flex items-center gap-3">
                   <Clock className="text-[#d6a54a]" />
                   Pemeliharaan Arsip
                </h3>
                
                <div className="space-y-6">
                  {pemeliharaanArsip.map((text, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="p-1 px-3 bg-white/10 rounded-lg text-[#d6a54a] text-xs font-bold mt-1">
                        0{i+1}
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-200 transition-colors">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div className="text-sm font-medium">Standar Operasional Disipusda</div>
                  <FileText className="text-[#d6a54a]" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pt-24 max-w-3xl mx-auto px-4 text-center">
        <h3 className="font-serif text-2xl font-bold text-[#0c2f3d] mb-4">Informasi Lebih Lanjut?</h3>
        <p className="text-gray-500 mb-8">Kunjungi kantor kami untuk konsultasi langsung terkait manajemen kearsipan instansi Anda.</p>
        <button className="px-10 py-4 bg-[#d6a54a] text-[#0c2f3d] font-bold rounded-2xl hover:bg-[#0c2f3d] hover:text-white transition-all shadow-lg hover:shadow-[#d6a54a]/30 flex items-center gap-2 mx-auto">
          Hubungi Layanan Kearsipan <ChevronRight size={20} />
        </button>
      </section>

    </div>
  );
}
