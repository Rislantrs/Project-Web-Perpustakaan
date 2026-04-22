import React from 'react';
import { User, QrCode } from 'lucide-react';
import type { Member } from '../services/authService';

interface Props {
  member: Member;
}

export default function MemberCardQR({ member }: Props) {
  // Generate a QR Code using an external API for simplicity.
  // In a real production app, you might want to `npm install qrcode.react` 
  // and use the <QRCodeSVG /> or <QRCodeCanvas /> component directly.
  
  const qrData = encodeURIComponent(`DISIPUSDA-MEMBER-${member.id}-${member.nomorAnggota}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

  return (
    <div className="bg-gradient-to-br from-[#0c2f3d] to-[#1a4254] p-6 rounded-3xl shadow-xl max-w-sm w-full mx-auto text-white relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#d6a54a]/10 rounded-full blur-2xl"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-[10px] text-[#d6a54a] font-black uppercase tracking-widest">Disipusda Purwakarta</p>
            <h3 className="font-bold text-lg leading-none mt-1">Kartu Anggota</h3>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <QrCode size={20} className="text-[#d6a54a]" />
          </div>
        </div>

        <div className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl backdrop-blur-md mb-6 border border-white/10">
          <div className="w-24 h-24 bg-white p-2 rounded-xl shrink-0 shadow-inner flex items-center justify-center">
            {/* The QR Code Image */}
            <img src={qrUrl} alt="QR Code Member" className="w-full h-full object-contain mix-blend-multiply" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-300 uppercase tracking-widest font-bold mb-0.5">Nama Anggota</p>
            <p className="font-bold text-sm truncate mb-3">{member.namaLengkap}</p>
            
            <p className="text-[10px] text-gray-300 uppercase tracking-widest font-bold mb-0.5">No. Anggota</p>
            <p className="font-mono font-bold text-sm text-[#d6a54a] tracking-wider">{member.nomorAnggota}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/50">
          <User size={14} /> Terdaftar sejak {member.tanggalDaftar}
        </div>
      </div>
    </div>
  );
}

/* 
=============================================================
CARA MENGAKTIFKAN KARTU ANGGOTA QR CODE DI PROFIL:
=============================================================

1. Buka file `src/pages/Profil.tsx`
2. Import komponen ini di bagian atas:
   import MemberCardQR from '../components/MemberCardQR';

3. Sisipkan komponen di dalam render Profil.tsx (misalnya di atas informasi profil):
   
   <div className="mb-8">
     <MemberCardQR member={user} />
   </div>

=============================================================
*/
