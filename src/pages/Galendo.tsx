import { ChevronRight, FileText, Upload, ArrowRight, PenTool } from 'lucide-react';
import { Link } from 'react-router';
import galendo1 from '../assets/lainLain/galendo/galendo1.webp';
import galendo2 from '../assets/lainLain/galendo/galendo2.webp';
import galendo3 from '../assets/lainLain/galendo/galendo3.webp';
import naskahKuno from '../assets/lainLain/galendo/naskahKuno.webp';

export default function Galendo() {
  // HARDCODE EXTERNAL URL: form publik GALENDO.
  // Jika form diganti, update URL ini.
  const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLScmEHkT9TF292LBObgTAS_RMZJbSlVxLsxzu4IG7Z0Hf9Yn2g/viewform?pli=1";

  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-12">
          <Link to="/" className="hover:text-[#0c2f3d]">Beranda</Link>
          <ChevronRight size={14} className="mx-2" />
          <span>Lain-Lain</span>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#0c2f3d] font-medium">GALENDO</span>
        </div>

        {/* Header Section */}
        <div className="text-center mb-20 max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#0c2f3d] mb-6 leading-tight">
            Gerakan Literasi Masyarakat Peduli Naskah Kuno
          </h1>
          <p className="text-xl text-gray-600 mb-8 italic">
            "Hayu urang sadayana ngalastarikeun sareng ngamumulé Naskah Kuno nu aya di wewengkon Purwakarta"
          </p>
          <a 
            href={googleFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-[#fc6c52] text-white px-10 py-4 rounded-xl font-black hover:bg-[#e0563e] transition-all shadow-xl hover:shadow-[#fc6c52]/30 active:scale-95 text-lg"
          >
            <Upload size={22} /> Kirim Informasi Keberadaan Naskah
          </a>
        </div>

        {/* Content Alternating */}
        <div className="space-y-24">
          
          {/* Section 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-xl h-80">
              <img src={galendo1} alt="Pelestarian Naskah" className="w-full h-full object-cover" />
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="font-serif text-3xl font-bold text-[#0c2f3d] mb-6">Pelestarian Naskah</h3>
              <div className="text-gray-600 leading-relaxed space-y-4">
                <p>
                  Dalam ruang lingkup perpustakaan, pelestarian (preservasi) merupakan suatu pekerjaan untuk memelihara dan melindungi koleksi atau bahan pustaka sehingga tidak mengalami penurunan nilai dan bisa dimanfaatkan oleh masyarakat dalam jangka waktu lama.
                </p>
                <p>
                  Tujuan utama pelestarian bahan pustaka adalah untuk melestarikan kandungan informasi yang direkam dalam bentuk fisiknya, atau dialihkan pada media lain, agar dapat dimanfaatkan oleh pengguna perpustakaan.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-xl h-80">
              <img src={galendo2} alt="Manfaat GALENDO" className="w-full h-full object-cover" />
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="font-serif text-3xl font-bold text-[#0c2f3d] mb-6">Manfaat GALENDO</h3>
              <p className="text-gray-600 leading-relaxed">
                Mempermudah pemilik naskah kuno dalam melakukan merawat, menyimpan, melestarikan dan mendaftarkan kepemilikan Naskah kuno yang tersebar di Kabupaten Purwakarta.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-xl h-[400px]">
              <img src={galendo3} alt="Alur Kegiatan" className="w-full h-full object-cover" />
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="font-serif text-3xl font-bold text-[#0c2f3d] mb-6">Alur Kegiatan</h3>
              <ul className="text-gray-600 leading-relaxed space-y-4 list-disc pl-5">
                <li>Hunting keberadaan Naskah kuno yang dimiliki oleh Masyarakat pada 17 Kecamatan di Kabupaten Purwakarta</li>
                <li>Pembinaan dengan cara memberikan informasi secara rinci tata cara merawat, menyimpan, melestarikan dan Pendaftaran Naskah Kuno kepada Pemilik Naskah yang baik dan benar</li>
                <li>Pendataan, Pemberian Nomor Klasifikasi dan Alih Media Naskah (Scan dan foto)</li>
                <li>Mendaftarkan Naskah Kuno yang dimiliki oleh masyarakat ke Perpustakaan Nasional RI melalui Website <a href="https://pernaskahan.perpusnas.go.id" target="_blank" className="text-[#d6a54a] font-bold">pernaskahan.perpusnas.go.id</a></li>
                <li>Pemberian Penghargaan kepada Masyarakat yang sudah melestarikan, menyimpan dan mendaftarkan naskah kuno.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Hasil GALENDO Section */}
      <section className="py-24 bg-[#0c2f3d] relative overflow-hidden mt-32">
        {/* Subtle decorative elements restored */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#d6a54a]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Text Content */}
            <div className="w-full lg:w-1/2 text-white">
              <p className="text-[#d6a54a] font-bold text-sm tracking-[0.3em] uppercase mb-6">Hasil Digitalisasi</p>
              <h2 className="font-serif text-5xl md:text-6xl font-bold mb-8 leading-tight text-white border-l-4 border-[#d6a54a] pl-8">
                Hasil GALENDO
              </h2>
              
              <div className="space-y-8 pl-8">
                <div>
                  <h3 className="text-[#d6a54a] font-bold text-xl mb-3">Manuskrip Perang Cina di Tanjung Pura</h3>
                  <p className="text-xl text-gray-300 font-medium">(Ranca Darah)</p>
                </div>

                <blockquote className="text-2xl font-serif italic text-gray-100 leading-relaxed border-t border-gray-100/10 pt-8">
                  "Berkisah peristiwa pemberontakan Cina di wilayah Purwakarta dan sekitarnya hingga ke Tanjungpura dan Karawang serta Dawuan"
                </blockquote>

                <div className="pt-4 text-xs">
                  <p className="font-bold text-lg text-white">Disipusda Purwakarta</p>
                  <p className="text-[#d6a54a]">Bidang Pengembangan dan Pelestarian Perpustakaan</p>
                </div>

                <div className="pt-6">
                  <a href="https://pernaskahan.perpusnas.go.id" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[#d6a54a] hover:text-white transition-colors group">
                    TELUSURI NASKAH DI PERPUSNAS <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            {/* Visual Image - Made SLIMMER */}
            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="relative w-full max-w-[420px] h-[550px] md:h-[650px] rounded-[30px] overflow-hidden flex items-center justify-center border border-white/5 bg-white/5 backdrop-blur-sm p-4">
                 <img 
                  src={naskahKuno} 
                  alt="Manuskrip Ranca Darah" 
                  className="w-full h-full object-contain shadow-2xl rounded-sm" 
                 />
                 <div className="absolute top-6 right-6 bg-[#d6a54a] text-[#0c2f3d] px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-xl">
                    NASKAH ASLI
                 </div>
                 
                 {/* Decorative tight corners */}
                 <div className="absolute top-2 left-2 w-6 h-6 border-t border-l border-white/20 rounded-tl-lg"></div>
                 <div className="absolute bottom-2 right-2 w-6 h-6 border-b border-r border-white/20 rounded-br-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
