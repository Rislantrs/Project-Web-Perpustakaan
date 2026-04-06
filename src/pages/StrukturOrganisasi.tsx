import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

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
  return (
    <div className="flex flex-col items-center group">
      <div className={`overflow-hidden rounded-xl shadow-lg border-2 border-white mb-4 bg-gray-200 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:border-[#d6a54a]
        ${isLg ? 'w-full aspect-[3/4]' : 'w-full aspect-[3/4] max-w-[200px]'}`}
      >
        <img src={data.img} alt={data.name} className="w-full h-full object-cover object-center" />
      </div>
      <div className="text-center px-2">
        <h3 className={`font-bold text-[#0c2f3d] ${isLg ? 'text-xl' : 'text-sm'} mb-1`}>{data.name}</h3>
        <p className={`text-gray-500 font-medium ${isLg ? 'text-sm' : 'text-xs'}`}>{data.role}</p>
      </div>
    </div>
  );
}

export default function StrukturOrganisasi() {
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
        </div>

        <div className="space-y-16">
          {/* Top Level - Kepala & Sekretaris */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {leaders.map((leader, i) => <ProfileCard key={i} data={leader} size="lg" />)}
          </div>

          <div className="w-full border-t border-gray-200"></div>

          {/* Bidang - 4 Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bidang.map((b, i) => <ProfileCard key={i} data={b} size="md" />)}
          </div>

          <div className="w-full border-t border-gray-200"></div>

          {/* Sekretariat Section */}
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold text-[#d6a54a] mb-10">Sekretariat</h2>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {sekretariat.map((s, i) => <ProfileCard key={i} data={s} size="sm" />)}
            </div>
            
            {/* Third Row (More sub staffs) just reusing same array for visual completeness of user screenshot */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-8">
               {[...sekretariat].reverse().map((s, i) => <ProfileCard key={`sub-${i}`} data={{...s, role: 'Staf Administrasi / Teknis'}} size="sm" />)}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
