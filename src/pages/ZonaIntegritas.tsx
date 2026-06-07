import { ChevronRight, ShieldCheck, ThumbsUp, HeartHandshake, AlertOctagon } from 'lucide-react';
import { Link } from 'react-router';
import zonaImg from '../assets/lainLain/zonaIntegritas/zonaIntegritas.webp';

// Catatan pemeliharaan:
// Halaman ini didominasi kampanye visual dan teks statis komitmen integritas.
// Pastikan redaksi slogan dan banner selaras dengan kebijakan resmi instansi.

export default function ZonaIntegritas() {
  return (
    <div className="bg-white min-h-screen pb-24">
      
      {/* Bagian hero halaman */}
      <section className="relative bg-[#0c2f3d] py-16 md:py-24 pb-28 md:pb-36 border-b-8 border-[#d6a54a] overflow-hidden">
        {/* Latar belakang gradient premium */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c2f3d] via-[#103a4b] to-[#08222b]"></div>
        
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Glow effects */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#d6a54a]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#e63946]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 relative z-10">
          {/* Navigasi jejak halaman */}
          <div className="flex items-center justify-center md:justify-start text-sm text-gray-300 mb-8 md:mb-10">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} className="mx-2 text-[#d6a54a]" />
            <span className="text-white font-medium">Zona Integritas</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            
            {/* Kolom Teks */}
            <div className="md:col-span-7 text-center md:text-left order-2 md:order-1">
              <h1 className="font-serif text-white text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Anda Memasuki <br className="hidden sm:inline" />
                <span className="text-[#d6a54a]">Zona Integritas</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                Dinas Kearsipan dan Perpustakaan Kabupaten Purwakarta berkomitmen mewujudkan reformasi birokrasi yang bersih dan melayani.
              </p>
              <div className="inline-flex items-center gap-3 bg-[#e63946] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-red-900/20 hover:bg-[#d62839] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
                <AlertOctagon size={22} className="animate-pulse" /> STOP PUNGLI !
              </div>
            </div>

            {/* Kolom Gambar/Logo */}
            <div className="md:col-span-5 flex justify-center order-1 md:order-2">
              <div className="relative group">
                {/* Decorative border/glow behind the card */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-[#d6a54a] to-[#e63946] rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                
                {/* Logo card container */}
                <div className="relative bg-white p-6 rounded-2xl shadow-2xl flex items-center justify-center w-[240px] sm:w-[300px] aspect-[4/3] overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                  <img 
                    src={zonaImg} 
                    className="w-full h-full object-contain" 
                    alt="Zona Integritas Logo" 
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bagian komitmen integritas */}
      <section className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        
        {/* Baris kartu komitmen */}
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

        {/* Pernyataan utama pada banner */}
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
