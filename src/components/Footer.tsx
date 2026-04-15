import { Link } from 'react-router';
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSiteSettings, type SiteSettings } from '../services/settingsService';


export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    setSettings(getSiteSettings());
  }, []);

  if (!settings) return null;

  return (
    <footer className="bg-[#0c2f3d] text-white pt-16 pb-8 border-t-4 border-[#d6a54a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-serif text-2xl font-bold text-[#d6a54a] mb-4">{settings.namaInstansi}</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Menjaga memori kolektif bangsa dan mencerdaskan kehidupan masyarakat melalui tata kelola kearsipan dan perpustakaan yang modern.
            </p>
            <div className="flex space-x-4">
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#d6a54a] transition-colors">
                  <Facebook size={16} />
                </a>
              )}
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#d6a54a] transition-colors">
                  <Instagram size={16} />
                </a>
              )}
              {settings.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#d6a54a] transition-colors">
                  <Youtube size={16} />
                </a>
              )}
            </div>
          </div>


          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="font-bold mb-4 tracking-wider text-sm uppercase text-gray-400">Akses Cepat</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-[#d6a54a] transition-colors">Beranda</Link></li>
              <li><Link to="/profil/sejarah" className="hover:text-[#d6a54a] transition-colors">Profil Instansi</Link></li>
              <li><Link to="/perpustakaan" className="hover:text-[#d6a54a] transition-colors">Layanan Perpustakaan</Link></li>
              <li><a href="#" className="hover:text-[#d6a54a] transition-colors">Layanan Kearsipan</a></li>
              <li><a href="#" className="hover:text-[#d6a54a] transition-colors">Berita Terkini</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h4 className="font-bold mb-4 tracking-wider text-sm uppercase text-gray-400">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#d6a54a] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{settings.alamatInstansi}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#d6a54a] shrink-0" />
                <span>{settings.teleponKontak}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#d6a54a] shrink-0" />
                <span className="truncate">{settings.emailKontak}</span>
              </li>
            </ul>
          </div>


          {/* Map Placeholder */}
          <div className="col-span-1">
            <h4 className="font-bold mb-4 tracking-wider text-sm uppercase text-gray-400">Lokasi</h4>
            <div className="w-full h-32 bg-gray-700 rounded-lg overflow-hidden relative border border-gray-600">
               {/* A dummy map image or simple styled div */}
               <div className="absolute inset-0 bg-[#1f3e4e] opacity-80 flex items-center justify-center">
                  <MapPin size={24} className="text-[#d6a54a] mb-2" />
               </div>
               <div className="absolute inset-0 flex items-center justify-center font-medium text-xs text-center px-4 z-10 pointer-events-none">
                 Peta Lokasi Gedung Disipusda
               </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p>© 2024 Disipusda Purwakarta. All rights reserved.</p>
          <p className="mt-2 md:mt-0 italic text-[#d6a54a]">Curated Excellence for Purwakarta</p>
        </div>
      </div>
    </footer>
  );
}
