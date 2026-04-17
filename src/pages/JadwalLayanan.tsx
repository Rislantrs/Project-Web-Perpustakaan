import { Clock, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { getSchedules, type Schedule } from '../services/settingsService';

function ScheduleCard({ schedule }: { schedule: Schedule }) {
  return (
    <div className="flex flex-col group w-full bg-[#1f3e4e] rounded-2xl shadow-lg border border-[#0c2f3d] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-[#d6a54a]/50 p-8 relative overflow-hidden h-full">
      {/* Header Card: Day & Icon */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-[#d6a54a] font-bold text-xs uppercase tracking-widest">
          <Calendar size={16} />
          {schedule.day}
        </div>
        {/* Optional: 'TERDEKAT' Tag if we want to add logic later, for now just matching UI look */}
      </div>
      
      {/* Title / Note */}
      <h3 className="font-serif text-3xl font-bold text-white mb-8 leading-tight">
        {schedule.note || 'Layanan Disipusda'}
      </h3>
      
      {/* Time Capsule - Matching Image Style */}
      <div className="mt-auto">
        <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-white shadow-inner">
          <Clock size={16} className="text-[#d6a54a]" />
          <span className="text-base font-bold tracking-tight">{schedule.hours}</span>
        </div>
      </div>

      {/* Subtle Gold Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#d6a54a]/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[#d6a54a]/10 transition-colors"></div>
    </div>
  );
}

export default function JadwalLayanan() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  
  useEffect(() => {
    const data = getSchedules();
    setSchedules(data);
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#f8f9fa] min-h-screen pt-12 pb-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb - Clean & Constant */}
        <div className="flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 font-sans">
          <Link to="/" className="hover:text-[#d6a54a] transition-colors">Beranda</Link>
          <span className="mx-4 text-gray-300">|</span>
          <span className="text-[#d6a54a]">Jadwal Layanan</span>
        </div>

        {/* Header - Consistent with Structure Page */}
        <div className="text-center mb-24">
          <h1 className="font-serif text-6xl lg:text-7xl font-bold text-[#0c2f3d] tracking-tighter mb-6">Waktu Layanan</h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto font-medium leading-relaxed italic">"Pintu Literasi Selalu Terbuka Menanti Kehadiran Anda."</p>
          <div className="w-24 h-1 bg-[#d6a54a] mx-auto mt-10 rounded-full"></div>
        </div>

        {/* Schedule Grid - Dark Mode Cards (Consistent with Image) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {schedules.map((s) => (
            <ScheduleCard key={s.id} schedule={s} />
          ))}
        </div>

        {/* Footer Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-24 border-t border-gray-200">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="font-serif text-3xl font-bold text-[#0c2f3d] mb-8">Lokasi Fisik</h2>
            <div className="flex gap-4 mb-8">
              <div className="w-12 h-12 bg-[#f8f9fa] rounded-2xl flex items-center justify-center text-[#d6a54a] shrink-0 border border-gray-100">
                <MapPin size={24} />
              </div>
              <p className="text-gray-600 font-bold leading-relaxed text-sm">
                Jl. Veteran No. 46, Nagri Kaler, Kec. Purwakarta, Kabupaten Purwakarta, Jawa Barat 41115
              </p>
            </div>
            <a 
              href="https://www.google.com/maps/place/Dinas+Arsip+Dan+Perpustakaan+Kabupaten+Purwakarta/@-6.5517454,107.4431872,17z" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#0c2f3d] text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#d6a54a] transition-all shadow-lg shadow-[#0c2f3d]/20"
            >
              Navigasi Google Maps <ArrowRight size={16} />
            </a>
          </div>

          <div className="flex flex-col justify-center p-4">
            <h2 className="font-serif text-3xl font-bold text-[#0c2f3d] mb-8">Ketentuan Umum</h2>
            <div className="space-y-6">
              {[
                'Layanan ditutup pada hari libur nasional dan cuti bersama.',
                'Disarankan melakukan pendaftaran anggota secara online sebelum berkunjung.',
                'Jam layanan dapat menyesuaikan dengan agenda kedinasan tertentu.'
              ].map((note, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div className="w-2 h-2 bg-[#d6a54a] rounded-full mt-2.5 shrink-0"></div>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
