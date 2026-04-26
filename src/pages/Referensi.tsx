import { motion } from 'motion/react';
import { Book, CheckCircle2, Info, ChevronRight } from 'lucide-react';

// HARDCODE REFERENCE DATA:
// glosarium regulasi disimpan statis agar halaman cepat diakses.
// saat ada perubahan regulasi resmi, perbarui object ini.
const referensiData = {
  pengertian: [
    {
      title: "Arsip",
      desc: "Rekaman kegiatan atau peristiwa dalam berbagai bentuk dan media sesuai dengan perkembangan teknologi informasi dan komunikasi yang dibuat dan diterima oleh lembaga negara, pemerintahan daerah, lembaga pendidikan, perusahaan, organisasi politik, organisasi kemasyarakatan, dan perseorangan dalam pelaksanaan kehidupan bermasyarakat, berbangsa dan bernegara. (Undang-Undang No.43 Tahun 2009)"
    },
    {
      title: "Arsip Dinamis",
      desc: "Arsip yang digunakan secara langsung dalam kegiatan pencipta arsip dan disimpan selama jangka waktu tertentu."
    },
    {
      title: "Arsip Aktif",
      desc: "Arsip yang frekuensi penggunaannya tinggi dan/atau terus menerus."
    },
    {
      title: "Arsip In-Aktif",
      desc: "Arsip yang frekuensi penggunaannya telah menurun."
    },
    {
      title: "Arsip Statis",
      desc: "Arsip yang dihasilkan oleh pencipta arsip karena memiliki kategori permanen dalam jadwal retensi arsip yang telah diverifikasi oleh ANRI dan/atau lembaga kearsipan, kemudian ditetapkan masuk sebagai kategori arsip statis sesuai dengan peraturan per Undang-Undangan."
    },
    {
      title: "Arsip Vital",
      desc: "Arsip yang keberadaannya merupakan persyaratan dasar bagi kelangsungan operasional pencipta arsip, tidak dapat diperbaharui, dan tidak tergantikan apabila rusak atau hilang."
    },
    {
      title: "Arsip Terjaga",
      desc: "Arsip negara yang berkaitan dengan keberadaan dan kelangsungan hidup bangsa dan negara yang harus dijaga keutuhan, keamanan, dan keselamatannya."
    },
    {
      title: "Arsip Umum",
      desc: "Arsip yang tidak termasuk dalam kategori arsip terjaga."
    },
    {
      title: "Arsiparis",
      desc: "Seseorang yang memiliki kompetensi di bidang kearsipan yang diperoleh melalui pendidikan dan pelatihan kearsipan serta mempunyai fungsi, tugas, dan tanggung jawab melaksanakan kegiatan kearsipan."
    }
  ],
  dinamis: [
    "Penciptaan arsip",
    "Penggunaan dan pemeliharaan arsip",
    "Penyusutan arsip"
  ],
  statis: [
    "Akuisisi arsip statis",
    "Pengolahan arsip statis",
    "Preservasi arsip statis",
    "Akses arsip statis"
  ]
};

export default function Referensi() {
  return (
    <div className="min-h-screen bg-[#fcfafc] pt-0 pb-20">
      {/* Header Section */}
      <section className="relative py-12 bg-[#0c2f3d] overflow-hidden -mt-0 mb-16">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#d6a54a]/10 skew-x-12 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-2 text-[#d6a54a] mb-4">
                <Book size={20} />
                <span className="text-sm font-bold tracking-widest uppercase">Pusat Informasi</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-2">Referensi & Glosarium</h1>
              <p className="text-gray-400 max-w-2xl">
                Kumpulan terminologi dan pedoman regulasi kearsipan berdasarkan standar nasional untuk memudahkan pemahaman dalam pengelolaan dokumen negara.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Pengertian Arsip Section */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-gray-200"></div>
            <h2 className="font-serif text-3xl font-bold text-[#0c2f3d] px-4 text-center">Pengertian Dasar Kearsipan</h2>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {referensiData.pengertian.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#0c2f3d] group-hover:text-white transition-colors">
                  <Info size={24} className="text-[#d6a54a]" />
                </div>
                <h3 className="text-xl font-bold text-[#0c2f3d] mb-4 group-hover:text-[#d6a54a] transition-colors line-clamp-1">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Process Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Dinamis */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#f3f5f8] p-10 rounded-3xl border border-gray-200/50"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#0c2f3d] rounded-full flex items-center justify-center text-[#d6a54a]">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#0c2f3d]">Pengelolaan Arsip Dinamis</h3>
            </div>
            <div className="space-y-4">
              {referensiData.dinamis.map((item, idx) => (
                <div key={idx} className="bg-white px-6 py-5 rounded-xl flex items-center gap-4 border border-gray-100 shadow-sm transition-all group">
                  <div className="w-6 h-6 rounded-full bg-[#d6a54a]/10 flex items-center justify-center text-[#d6a54a] shrink-0 font-bold text-xs">
                    {idx + 1}
                  </div>
                  <span className="font-semibold text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Statis */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#0c2f3d] p-10 rounded-3xl border border-white/10 text-white"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-[#d6a54a]">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-white">Pengelolaan Arsip Statis</h3>
            </div>
            <div className="space-y-4">
              {referensiData.statis.map((item, idx) => (
                <div key={idx} className="bg-white/5 px-6 py-5 rounded-xl flex items-center gap-4 border border-white/10 transition-all group">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[#d6a54a] shrink-0 font-bold text-xs">
                    {idx + 1}
                  </div>
                  <span className="font-semibold text-gray-100">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Note Footer */}
        <div className="mt-20 p-8 bg-white rounded-2xl border-2 border-dashed border-gray-100 text-center">
          <p className="text-gray-500 text-sm italic">
            Sumber: Undang-Undang Republik Indonesia Nomor 43 Tahun 2009 tentang Kearsipan.
          </p>
        </div>

      </div>
    </div>
  );
}
