import { ChevronRight, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { getStructure, type StructureNode } from '../services/settingsService';
import { getInitials } from '../services/authService';


// Dummy data using Unsplash portraits for illustration
const leaders = [
  { name: 'AAN, S.Pd.I., K.P., M.Si.', role: 'Kepala Dinas', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400' },
  { name: 'Dr. Kusnandar, S.Pd, M.T', role: 'Sekretaris Dinas', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400' }
];

const bidang = [
  { name: 'Desi Handayani, STP, MP', role: 'Kepala Bidang Pembinaan, Pelestarian dan Pengembangan Kearsipan', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400' },
  { name: 'Iyus Jayusman, S.T., M.M', role: 'Kepala Bidang Pengembangan dan Pelestarian Perpustakaan', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400' },
  { name: 'Minar R.S, S.E, M.AP', role: 'Kepala Bidang Pengelolaan dan Pemeliharaan Kearsipan', img: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&q=80&w=400' },
  { name: 'Dra. Hj. Uce Marlina, A.P.,M.P', role: 'Kepala Bidang Layanan dan Otomasi Perpustakaan', img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400' }
];

const sekretariat = [
  { name: 'Dr. Kusnandar, S.Pd, M.T', role: 'Sekretaris Dinas', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400' },
  { name: 'Leoni R., S.E', role: 'Kepala Sub Bagian Keuangan', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400' },
  { name: 'Hj. Elly Zuliadewi, S.T., M.M', role: 'Analis Sumber Daya Manusia Aparatur', img: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=400' },
  { name: 'Abdul Gani, S.E., M.M', role: 'Perencana Ahli Muda', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400' },
  { name: 'Edi Komala Kurniawan, S.T', role: 'Bendahara Pengeluaran', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400' },
  { name: 'Ika Puspita Sari', role: 'Pengelola Kepegawaian', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
];

function ProfileCard({ data, size = "md" }: { data: any, size?: "lg" | "md" | "sm" }) {
  const isLg = size === "lg";
  const avatarColor = ['#0c2f3d', '#d6a54a', '#1f3e4e', '#8b1c24'][Math.floor(Math.random() * 4)];
  
  return (
    <div className="flex flex-col items-center group">
      <div className={`overflow-hidden rounded-2xl shadow-lg border-4 border-white mb-4 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:border-[#d6a54a] flex items-center justify-center
        ${isLg ? 'w-48 h-64' : (size === "md" ? 'w-36 h-48' : 'w-24 h-32')}`}
        style={{ backgroundColor: avatarColor + '20' }}
      >
        {data.img ? (
           <img src={data.img} alt={data.name} className="w-full h-full object-cover object-center" />
        ) : (
           <div className="flex flex-col items-center text-center p-4">
             <div className="text-2xl font-black mb-2" style={{ color: avatarColor }}>{getInitials(data.name)}</div>
             <UserIcon size={isLg ? 40 : 24} style={{ color: avatarColor, opacity: 0.3 }} />
           </div>
        )}
      </div>
      <div className="text-center px-2">
        <h3 className={`font-bold text-[#0c2f3d] ${isLg ? 'text-lg' : 'text-sm'} mb-1`}>{data.name}</h3>
        <p className={`text-gray-500 font-bold uppercase tracking-widest ${isLg ? 'text-[10px]' : 'text-[8px]'}`}>{data.role}</p>
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

  const hasData = nodes.length > 0;
  
  // Use current data or fallbacks
  const level1 = hasData ? nodes.filter(n => n.level === 1) : leaders;
  const level2 = hasData ? nodes.filter(n => n.level === 2) : bidang;
  const others = hasData ? nodes.filter(n => n.level >= 3) : sekretariat;

  return (
    <div className="bg-[#f8f9fa] min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center justify-center text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#0c2f3d]">Home</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#0c2f3d] font-medium">Struktur Organisasi</span>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl font-bold text-[#0c2f3d]">Struktur Organisasi</h1>
          <p className="text-xs font-black text-[#d6a54a] uppercase tracking-[0.3em] mt-4">Disipusda Kabupaten Purwakarta</p>
        </div>

        <div className="space-y-20">
          {/* Top Level */}
          <div className="flex flex-wrap justify-center gap-12 max-w-5xl mx-auto">
            {level1.map((leader, i) => (
              <ProfileCard key={i} data={{ name: leader.name || (leader as any).name, role: leader.position || (leader as any).role, img: (leader as any).img }} size="lg" />
            ))}
          </div>

          <div className="max-w-px h-16 bg-gray-200 mx-auto"></div>

          {/* Level 2 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {level2.map((b, i) => (
              <ProfileCard key={i} data={{ name: b.name || (b as any).name, role: b.position || (b as any).role, img: (b as any).img }} size="md" />
            ))}
          </div>

          <div className="w-full h-px bg-gray-100"></div>

          {/* Others */}
          <div className="text-center">
             <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
               {others.map((s, i) => (
                 <ProfileCard key={i} data={{ name: s.name || (s as any).name, role: s.position || (s as any).role, img: (s as any).img }} size="sm" />
               ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

