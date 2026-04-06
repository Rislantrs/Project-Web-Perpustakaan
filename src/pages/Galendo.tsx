import { ChevronRight, FileText, Upload } from 'lucide-react';
import { Link } from 'react-router';

export default function Galendo() {
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
          <button className="bg-[#fc6c52] text-white px-8 py-3 rounded-md font-bold hover:bg-[#e0563e] transition-colors shadow-lg flex items-center justify-center mx-auto gap-2 text-lg">
            <Upload size={20} /> Kirim Informasi Keberadaan Naskah
          </button>
        </div>

        {/* Content Alternating */}
        <div className="space-y-24">
          
          {/* Section 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-xl h-80">
              <img src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80" alt="Pelestarian Naskah" className="w-full h-full object-cover" />
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
              <img src="https://images.unsplash.com/photo-1577563908411-50cb98976fea?auto=format&fit=crop&q=80" alt="Manfaat GALENDO" className="w-full h-full object-cover" />
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
              <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80" alt="Alur Kegiatan" className="w-full h-full object-cover" />
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="font-serif text-3xl font-bold text-[#0c2f3d] mb-6">Alur Kegiatan</h3>
              <ul className="text-gray-600 leading-relaxed space-y-4 list-disc pl-5">
                <li>Hunting keberadaan Naskah kuno yang dimiliki oleh Masyarakat pada 17 Kecamatan di Kabupaten Purwakarta</li>
                <li>Pembinaan dengan cara memberikan informasi secara rinci tata cara merawat, menyimpan, melestarikan dan Pendaftaran Naskah Kuno kepada Pemilik Naskah yang baik dan benar</li>
                <li>Pendataan, Pemberian Nomor Klasifikasi dan Alih Media Naskah (Scan dan foto)</li>
                <li>Mendaftarkan Naskah Kuno yang dimiliki oleh masyarakat ke Perpustakaan Nasional RI melalui Website <a href="#" className="text-[#d6a54a] font-bold">pernaskahan.perpusnas.go.id</a></li>
                <li>Pemberian Penghargaan kepada Masyarakat yang sudah melestarikan, menyimpan dan mendaftarkan naskah kuno.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
