import { User as UserIcon } from 'lucide-react';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { getStructure, type StructureNode } from '../services/settingsService';
import { getInitials } from '../services/authService';

function ProfileCard({ data, size = "md", isLeader = false }: { data: any, size?: "lg" | "md" | "sm", isLeader?: boolean }) {
  const isLg = size === "lg";
  const isMd = size === "md";
  
  return (
    <div className="flex flex-col items-center group w-full">
      <div className={`overflow-hidden rounded-md transition-all duration-300 w-full bg-gray-50 flex items-center justify-center relative
        ${isLeader ? 'shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-[#0c2f3d]/10' : 'shadow-sm border border-gray-100 group-hover:shadow-md'}
        ${isLg ? 'aspect-[3/4.2]' : 'aspect-[3/4.5]'}`}
      >
        {data.img ? (
           <img src={data.img} alt={data.name} className="w-full h-full object-cover object-top filter contrast-[1.02]" />
        ) : (
           <div className="flex flex-col items-center text-center p-4">
             <div className="text-3xl font-bold text-gray-200 mb-1">{getInitials(data.name)}</div>
             <UserIcon size={isLg ? 64 : 40} className="text-gray-100" />
           </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-[#d6a54a] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center"></div>
      </div>

      <div className="text-center mt-5 w-full px-1 min-h-[100px] flex flex-col justify-start">
        <h3 className={`font-bold text-[#0c2f3d] leading-tight line-clamp-2 ${isLg ? 'text-2xl' : 'text-base lg:text-[17px] mb-1'}`}>
          {data.name}
        </h3>
        <p className={`text-gray-500 font-semibold leading-relaxed mt-1 line-clamp-3 uppercase tracking-tighter ${isLg ? 'text-sm' : 'text-[11px] lg:text-[12px]'}`}>
          {data.role}
        </p>
      </div>
    </div>
  );
}

export default function StrukturOrganisasi() {
  const [nodes, setNodes] = useState<StructureNode[]>([]);
  
  useEffect(() => {
    const data = getStructure();
    setNodes(data);
  }, []);

  const getByCategory = (cat: string) => {
    return nodes
      .filter(n => n.category === cat)
      .sort((a, b) => (a.level || 3) - (b.level || 3));
  };

  const Section = ({ title, cat, gridCols = "grid-cols-2 md:grid-cols-3 lg:grid-cols-5" }: { title: string, cat: string, gridCols?: string }) => {
    const allMembers = getByCategory(cat);
    if (allMembers.length === 0) return null;

    return (
      <div className="pt-16 border-t border-gray-100">
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#0c2f3d] mb-12 text-center tracking-tight">{title}</h2>
        
        <div className={`grid gap-8 lg:gap-12 ${gridCols}`}>
          {allMembers.map((m, i) => (
            <ProfileCard 
              key={m.id} 
              data={{ name: m.name, role: m.position, img: m.img }} 
              size={i === 0 ? "md" : "sm"}
              isLeader={i === 0}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen pt-12 pb-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-8 font-sans">
          <Link to="/" className="hover:text-[#d6a54a] transition-colors">Home</Link>
          <span className="mx-4 text-gray-200">|</span>
          <span className="text-[#d6a54a]">Struktur Organisasi</span>
        </div>

        <div className="text-center mb-16">
          <h1 className="font-serif text-6xl lg:text-8xl font-bold text-[#0c2f3d] tracking-tighter mb-6">Kepengurusan</h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto font-medium leading-relaxed italic">"Melayani dengan Hati, Menjaga Warisan Literasi."</p>
          <div className="w-32 h-1 bg-[#d6a54a] mx-auto mt-12 rounded-full opacity-40"></div>
        </div>

        <div className="space-y-24">
          <div className="flex flex-col md:flex-row justify-center gap-12 lg:gap-24 max-w-6xl mx-auto">
            {getByCategory('pimpinan').map((m) => (
              <div key={m.id} className="w-full max-w-[340px]">
                <ProfileCard data={{ name: m.name, role: m.position, img: m.img }} size="lg" isLeader={true} />
              </div>
            ))}
          </div>

          <Section title="Sekretariat" cat="sekretariat" />
          <Section title="Bidang Pembinaan & Pengembangan Kearsipan" cat="bidang_pembinaan" />
          <Section title="Bidang Pengelolaan Kearsipan" cat="bidang_pengelolaan" />
          <Section title="Bidang Layanan & Otomasi Perpustakaan" cat="bidang_layanan" />
          <Section title="Bidang Pengembangan Perpustakaan" cat="bidang_pengembangan" />
          <Section title="Bale Panyawangan Diorama" cat="diorama" />
        </div>
      </div>
    </div>
  );
}

