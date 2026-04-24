import { ChevronRight, ShieldCheck, ThumbsUp, HeartHandshake, AlertOctagon } from 'lucide-react';
import { Link } from 'react-router';
import zonaImg from '../assets/lainLain/zonaIntegritas/zonaintegritas.webp';

export default function ZonaIntegritas() {
  return (
    <div className="bg-white min-h-screen pb-24">
      
      {/* Hero Section */}
      <section className="relative bg-[#0c2f3d] py-24 pb-32 border-b-8 border-[#d6a54a] overflow-hidden">
        {/* Background Pattern/Image */}
        <div className="absolute inset-0">
           <img src={zonaImg} className="w-full h-full object-cover opacity-20" alt="Background" />
        </div>
        
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center md:text-left">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center md:justify-start text-sm text-gray-300 mb-10">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-white font-medium">Zona Integritas</span>
          </div>

          <div className="md:w-3/4">
            <h1 className="font-serif text-white text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Anda Memasuki <br/>
              <span className="text-[#d6a54a]">Zona Integritas</span>
            </h1>
            <p className="text-xl text-gray-200 mb-10">
              Dinas Kearsipan dan Perpustakaan Kabupaten Purwakarta berkomitmen mewujudkan reformasi birokrasi yang bersih dan melayani.
            </p>
            <div className="inline-flex items-center gap-3 bg-[#e63946] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-red-900/20">
              <AlertOctagon size={24} /> STOP PUNGLI !
            </div>
          </div>
        </div>
      </section>

      {/* Commitments Section */}
      <section className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        
        {/* Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
           
           <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center border-t-4 border-[#0c2f3d]">
             <div className="w-16 h-16 bg-[#0c2f3d]/10 text-[#0c2f3d] rounded-full flex items-center justify-center mb-6">
               <ShieldCheck size={32} />
             </div>
             <h3 className="font-bold text-xl text-[#0c2f3d] mb-4 tracking-wide uppercase">Komitmen</h3>
             <p className="text-gray-600 leading-relaxed text-sm">
               Pimpinan dan jajaran mempunyai komitmen yang tinggi untuk mewujudkan WBK/WBBM melalui reformasi birokrasi, khususnya dalam hal pencegahan korupsi dan peningkatan kualitas layanan publik.
             </p>
           </div>

           <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center border-t-4 border-[#d6a54a]">
             <div className="w-16 h-16 bg-[#d6a54a]/10 text-[#d6a54a] rounded-full flex items-center justify-center mb-6">
               <ThumbsUp size={32} />
             </div>
             <h3 className="font-bold text-xl text-[#d6a54a] mb-4 tracking-wide uppercase">Bebas dari Korupsi</h3>
             <p className="text-gray-600 leading-relaxed text-sm">
               Terwujudnya Wilayah Bebas Korupsi (WBK). Kami memastikan instansi bebas dari praktik KKN, bebas dari gratifikasi, serta bebas dari pungutan liar (pungli).
             </p>
           </div>

           <div className="bg-[#1f3e4e] p-8 rounded-2xl shadow-xl flex flex-col items-center text-center border-t-4 border-white">
             <div className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center mb-6">
               <HeartHandshake size={32} />
             </div>
             <h3 className="font-bold text-xl text-white mb-4 tracking-wide uppercase">Pelayanan Prima</h3>
             <p className="text-gray-300 leading-relaxed text-sm">
               Terwujudnya Wilayah Birokrasi Bersih Melayani (WBBM). Terus meningkatkan kualitas pelayanan publik dan tercapainya kepuasan masyarakat terhadap pelayanan secara optimal.
             </p>
           </div>

        </div>

        {/* Big Banner Statement */}
        <div className="bg-gradient-to-r from-[#d6a54a] to-[#c09440] rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <h2 className="relative z-10 font-bold text-white text-3xl md:text-5xl leading-tight mb-4">
            SEMUA LAYANAN KEARSIPAN DAN PERPUSTAKAAN TIDAK DIPUNGUT BIAYA ATAU <span className="underline decoration-4 underline-offset-8">GRATIS !</span>
          </h2>
          <p className="relative z-10 text-[#5a3b21] font-bold tracking-widest uppercase text-sm mt-8">
            Zona Integritas Disipusda Purwakarta
          </p>
        </div>

      </section>

    </div>
  );
}
