import { ChevronRight, Calendar } from 'lucide-react';
import { Link } from 'react-router';

export default function Sejarah() {
  // HARDCODE CONTENT:
  // Timeline sejarah disusun statis di frontend.
  // Jika ada revisi narasi resmi, update array ini.
  const timelineData = [
    {
      period: "1992 – 1996",
      content: "Pada Periode 1992-1996 kantor arsip masih dikelola oleh Sekretariat Daerah Pemerintah Kabupaten Purwakarta, tepatnya di Bagian Umum Sub Bagian Tata Usaha dan Keuangan."
    },
    {
      period: "1996 – 1999",
      content: "Pada Periode 1996-1999 kantor arsip masih dikelola oleh Sekretariat Daerah Pemerintah Kabupaten Purwakarta, tepatnya di Bagian Umum Sub Bagian Tata Usaha dan Keuangan."
    },
    {
      period: "1999 – Sekarang",
      content: "Tanggal 1 April 1999 Kantor Arsip Daerah Kabupaten Purwakarta beroperasi secara penuh / mandiri. Dengan keluarnya PP Nomor 41 tahun 2007 tentang Organisasi Perangkat Daerah menimbulkan perubahan susunan organisasi di lingkungan Pemerintah Kabupaten Purwakarta. Berdasarkan peraturan Daerah kabupaten Purwakarta Nomor 11 tahun 2008 tentang Pembentukan Lembaga Teknis Daerah maka ditetapkannya Kantor Arsip Daerah kabupaten Purwakarta adalah salah satu pendukung tugas Bupati yang kemudian ditindaklanjuti dengan Peraturan Bupati Nomor 57 Tahun 2008 tentang Rincian Tugas, Fungsi dan Tata Kerja kantor Arsip Daerah, dengan tugas pokok melaksanakan penyusunan dan pelaksanaan kebijakan daerah di bidang Kearsipan."
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-12">
          <Link to="/" className="hover:text-[#0c2f3d]">Beranda</Link>
          <ChevronRight size={14} className="mx-2" />
          <span>Profil</span>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#0c2f3d] font-medium">Sejarah Instansi</span>
        </div>

        {/* Header */}
        <div className="text-center mb-20 max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#0c2f3d] mb-6">Sejarah Pembentukan Kearsipan Daerah</h1>
          <p className="text-lg text-gray-600 font-medium italic">
            Perjalanan transformasi dari Sub Bagian Tata Usaha menuju Dinas Kearsipan terpadu.
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-[#d6a54a]/30 -translate-x-1/2 z-0 hidden md:block"></div>
          
          <div className="space-y-16">
            {timelineData.map((item, index) => (
              <div key={index} className="relative flex flex-col md:flex-row items-start md:justify-between group">
                
                {/* Timeline Node */}
                <div className="absolute left-4 md:left-1/2 top-6 md:top-8 w-6 h-6 bg-white border-4 border-[#d6a54a] rounded-full -translate-x-1/2 z-10 transition-transform group-hover:scale-125 hidden md:block"></div>
                
                {/* Content Left / Right depending on odd/even */}
                <div className={`w-full md:w-[45%] flex flex-col pt-2 ${index % 2 === 0 ? 'md:items-end md:text-right pr-0 md:pr-10' : 'md:items-start md:text-left pl-0 md:pl-10 md:ml-auto'}`}>
                  <div className="bg-[#f8f9fa] shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-8 rounded-2xl w-full">
                    <div className={`flex items-center gap-2 mb-4 text-[#d6a54a] font-bold tracking-widest text-sm uppercase ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                      <Calendar size={18} />
                      <span>Periode {item.period}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-left">
                      {item.content}
                    </p>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
