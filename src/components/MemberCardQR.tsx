import { type Member } from '../services/authService';
import { QrCode, Library, ShieldCheck } from 'lucide-react';
import logo from '../assets/logo/logoDisispuda.webp';

interface MemberCardQRProps {
  member: Member;
}

export default function MemberCardQR({ member }: MemberCardQRProps) {
  return (
    <div className="w-full max-w-md mx-auto relative group perspective">
      <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
        
        {/* Background Gradient & Glassmorphism */}
        <div className="absolute inset-0 bg-gradient-brand opacity-95"></div>
        
        {/* Subtle Decorative Patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 border-[20px] border-white rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 border-[15px] border-brand-accent rounded-full"></div>
        </div>

        <div className="relative z-10 p-6 text-white flex flex-col h-full min-h-[220px] justify-between">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-white/20 pb-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="h-10 object-contain bg-white/10 p-1 rounded-lg backdrop-blur-sm" />
              <div>
                <h3 className="font-serif font-bold text-sm leading-tight text-brand-accent">DISIPUSDA<br/>PURWAKARTA</h3>
                <p className="text-[9px] tracking-widest uppercase opacity-70 mt-0.5">Digital Library Card</p>
              </div>
            </div>
            <ShieldCheck size={24} className="text-brand-accent opacity-80" />
          </div>

          {/* Body */}
          <div className="flex justify-between items-end mt-6">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-wider text-brand-accent font-bold mb-1">Nama Anggota</p>
              <h2 className="text-xl font-bold tracking-wide truncate mb-4 drop-shadow-md">{member.namaLengkap.toUpperCase()}</h2>
              
              <p className="text-[10px] uppercase tracking-wider text-brand-accent font-bold mb-1">Nomor Induk Anggota (NIA)</p>
              <p className="text-lg font-mono tracking-widest bg-black/20 inline-block px-3 py-1 rounded-lg border border-white/10">
                {member.nomorAnggota}
              </p>
            </div>

            {/* QR Code Placeholder */}
              <div className="shrink-0 ml-4 bg-white p-2 rounded-xl shadow-inner flex flex-col items-center justify-center relative">
              <div className="absolute -top-3 bg-brand-accent text-brand-primary text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">SCAN ME</div>
              <QrCode size={64} className="text-brand-primary" strokeWidth={1.5} />
            </div>
          </div>

        </div>
      </div>
      
      {/* Informational Text Below Card */}
      <p className="text-center text-xs text-gray-500 mt-3 font-medium">
        Tunjukkan QR Code ini kepada petugas perpustakaan saat melakukan peminjaman buku fisik.
      </p>
    </div>
  );
}
