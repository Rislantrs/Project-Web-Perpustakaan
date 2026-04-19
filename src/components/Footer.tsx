import { Link } from 'react-router';
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSiteSettings, type SiteSettings } from '../services/settingsService';

// Import Logo
import logo from '../assets/logo/logoDisispuda.webp';

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    setSettings(getSiteSettings());
  }, []);

  if (!settings) return null;

  return (
    <footer className="bg-[#0c2f3d] text-white pt-20 pb-10 border-t-4 border-[#d6a54a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Info */}
          <div className="col-span-1">
            <div className="mb-6">
              <img src={logo} alt="Logo Disipusda" className="h-16 w-auto object-contain" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#d6a54a] mb-4">{settings.namaInstansi}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Mewujudkan layanan kearsipan dan perpustakaan yang modern, akuntabel, dan berbasis teknologi untuk masyarakat Purwakarta.
            </p>
            <div className="flex space-x-3">
              {[
                { icon: <Facebook size={18} />, url: settings.facebookUrl },
                { icon: <Instagram size={18} />, url: settings.instagramUrl },
                { icon: <Youtube size={18} />, url: settings.youtubeUrl },
                { icon: <Mail size={18} />, url: `mailto:${settings.emailKontak}` }
              ].map((social, i) => social.url && (
                <a key={i} href={social.url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-[#d6a54a] hover:text-[#0c2f3d] transition-all duration-300 border border-white/10 group">
                  <span className="group-hover:scale-110 transition-transform">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Tentang Kami */}
          <div className="col-span-1">
            <h4 className="font-bold mb-6 tracking-wider text-sm uppercase text-[#d6a54a] border-b border-[#d6a54a]/20 pb-2 w-fit">Tentang Kami</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/profil/sejarah" className="hover:text-[#d6a54a] transition-colors flex items-center gap-2 group"><div className="w-1 h-1 bg-[#d6a54a] opacity-0 group-hover:opacity-100 transition-opacity"></div> Sejarah Kantor</Link></li>
              <li><Link to="/profil/struktur" className="hover:text-[#d6a54a] transition-colors flex items-center gap-2 group"><div className="w-1 h-1 bg-[#d6a54a] opacity-0 group-hover:opacity-100 transition-opacity"></div> Struktur Organisasi</Link></li>
              <li><Link to="/profil/prestasi" className="hover:text-[#d6a54a] transition-colors flex items-center gap-2 group"><div className="w-1 h-1 bg-[#d6a54a] opacity-0 group-hover:opacity-100 transition-opacity"></div> Prestasi</Link></li>
              <li><Link to="/referensi" className="hover:text-[#d6a54a] transition-colors flex items-center gap-2 group"><div className="w-1 h-1 bg-[#d6a54a] opacity-0 group-hover:opacity-100 transition-opacity"></div> Referensi</Link></li>
              <li><a href="https://docs.google.com/forms/d/e/1FAIpQLSe2S9Ck-DAPbISSJcDLRiHg6d3aoiCU7xu7bYoLjbLY-gFGhg/viewform" target="_blank" rel="noreferrer" className="hover:text-[#d6a54a] transition-colors flex items-center gap-2 group"><div className="w-1 h-1 bg-[#d6a54a] opacity-0 group-hover:opacity-100 transition-opacity"></div> Pengaduan dan Saran</a></li>
              <li><a href="https://api.whatsapp.com/send/?phone=6288971405196&text&type=phone_number&app_absent=0" target="_blank" rel="noreferrer" className="hover:text-[#d6a54a] transition-colors flex items-center gap-2 group"><div className="w-1 h-1 bg-[#d6a54a] opacity-0 group-hover:opacity-100 transition-opacity"></div> Helpdesk SRIKANDI</a></li>
            </ul>
          </div>

          {/* Column 3: Layanan Utama */}
          <div className="col-span-1">
            <h4 className="font-bold mb-6 tracking-wider text-sm uppercase text-[#d6a54a] border-b border-[#d6a54a]/20 pb-2 w-fit">Layanan Utama</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/perpustakaan" className="hover:text-[#d6a54a] transition-colors flex items-center gap-2 group"><div className="w-1 h-1 bg-[#d6a54a] opacity-0 group-hover:opacity-100 transition-opacity"></div> Perpustakaan Daerah</Link></li>
              <li><Link to="/diorama" className="hover:text-[#d6a54a] transition-colors flex items-center gap-2 group"><div className="w-1 h-1 bg-[#d6a54a] opacity-0 group-hover:opacity-100 transition-opacity"></div> Diorama Purwakarta</Link></li>
              <li><Link to="/diorama" className="hover:text-[#d6a54a] transition-colors flex items-center gap-2 group"><div className="w-1 h-1 bg-[#d6a54a] opacity-0 group-hover:opacity-100 transition-opacity"></div> Diorama Nusantara</Link></li>
              <li><Link to="/kearsipan" className="hover:text-[#d6a54a] transition-colors flex items-center gap-2 group"><div className="w-1 h-1 bg-[#d6a54a] opacity-0 group-hover:opacity-100 transition-opacity"></div> Kearsipan</Link></li>
              <li><Link to="/jasa-kearsipan" className="hover:text-[#d6a54a] transition-colors flex items-center gap-2 group"><div className="w-1 h-1 bg-[#d6a54a] opacity-0 group-hover:opacity-100 transition-opacity"></div> Jasa Kearsipan & Prosedur</Link></li>
              <li><Link to="/layanan-rentan" className="hover:text-[#d6a54a] transition-colors flex items-center gap-2 group"><div className="w-1 h-1 bg-[#d6a54a] opacity-0 group-hover:opacity-100 transition-opacity"></div> Layanan Kelompok Rentan</Link></li>
            </ul>
          </div>

          {/* Column 4: Kontak Kami */}
          <div className="col-span-1">
            <h4 className="font-bold mb-6 tracking-wider text-sm uppercase text-[#d6a54a] border-b border-[#d6a54a]/20 pb-2 w-fit">Kontak Kami</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3 group">
                <MapPin size={20} className="text-[#d6a54a] shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                <span className="leading-relaxed">
                  {settings.alamatInstansi}
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail size={18} className="text-[#d6a54a] shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">{settings.emailKontak}</span>
              </li>
              <li className="flex items-center gap-3 group">
                <Phone size={18} className="text-[#d6a54a] shrink-0 group-hover:scale-110 transition-transform" />
                <span>{settings.teleponKontak}</span>
              </li>
            </ul>
            
            {/* Mini Map Preview */}
            <a 
              href={settings.linkGmaps || "https://www.google.com/maps/search/?api=1&query=Disipusda+Purwakarta"} 
              target="_blank" 
              rel="noreferrer"
              className="mt-6 w-full h-32 bg-white/5 rounded-xl border border-white/10 block overflow-hidden relative group transition-all hover:border-[#d6a54a]/50"
            >
               <iframe 
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15860.84!2d107.44!3d-6.55!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e690e66699b7751%3A0x6b864a7c067e203c!2sDinas%20Arsip%20dan%20Perpustakaan%20Kabupaten%20Purwakarta!5e0!3m2!1sid!2sid!4v1713500000000!5m2!1sid!2sid"
                 className="absolute inset-0 w-full h-full grayscale opacity-50 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700 pointer-events-none"
                 style={{ border: 0 }}
                 loading="lazy"
               ></iframe>
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] sm:text-xs text-gray-500 font-medium tracking-widest uppercase">
          <p>© 2024 DISIPUSDA PURWAKARTA. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6 mt-4 md:mt-0 italic">
            <span className="text-[#d6a54a]">Memory of the Nation</span>
            <span className="text-gray-600">|</span>
            <span className="text-[#d6a54a]">Center of Literacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
