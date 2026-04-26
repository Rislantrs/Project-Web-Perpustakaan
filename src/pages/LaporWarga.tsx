import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Mail, Phone, MessageSquare, AlertCircle, CheckCircle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

export default function LaporWarga() {
  const [form, setForm] = useState({ nama: '', email: '', telepon: '', kategori: 'Layanan Perpustakaan', pesan: '', alamat: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Simpan ke LocalStorage untuk Admin (mode frontend-only).
    // Untuk produksi skala besar, disarankan pindah ke backend DB.
    const reports = JSON.parse(localStorage.getItem('disipusda_reports') || '[]');
    const newReport = { id: Date.now(), ...form, tanggal: new Date().toLocaleString('id-ID'), status: 'Baru' };
    reports.push(newReport);
    localStorage.setItem('disipusda_reports', JSON.stringify(reports));

     /* 
       KODE CADANGAN UNTUK TELEGRAM BOT:
       ---------------------------------
       PENTING: jangan hardcode TOKEN bot di frontend production.
       Lebih aman kirim lewat backend endpoint/serverless function.
       const TOKEN = "YOUR_BOT_TOKEN";
       const CHAT_ID = "YOUR_CHAT_ID";
       const message = `📢 *LAPOR WARGA BARU*\n\n👤 Pengirim: ${form.nama}\n📧 Email: ${form.email}\n📱 WA: ${form.telepon}\n📁 Kategori: ${form.kategori}\n📍 Lokasi: ${form.alamat}\n\n📝 Pesan: ${form.pesan}`;
       
       fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' })
       });
    */

    setTimeout(() => setStatus('success'), 1500);
  };

  if (status === 'success') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Laporan Terkirim!</h2>
          <p className="text-gray-500 mb-8">Terima kasih atas laporannya. Kami akan meninjau dan menindaklanjuti pesan Anda sesegera mungkin.</p>
          <button onClick={() => setStatus('idle')} className="w-full bg-[#0c2f3d] text-white py-3 rounded-xl font-bold hover:bg-[#1a4254] transition-colors flex items-center justify-center gap-2">
            Kembali ke Beranda <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0c2f3d]/5 text-[#0c2f3d] rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-[#0c2f3d]/10">
            <ShieldCheck size={14} /> Layanan Pengaduan Masyarakat
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl font-black text-gray-900 mb-4">Lapor Warga</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-gray-500 max-w-2xl mx-auto">
            Sampaikan keluhan, aspirasi, atau pengaduan Anda terkait layanan kami. Kami berkomitmen untuk terus meningkatkan kualitas pelayanan publik di Purwakarta.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Side */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#0c2f3d] text-white p-6 rounded-3xl">
              <h3 className="font-bold text-lg mb-4">Kenapa Lapor?</h3>
              <ul className="space-y-4 text-sm text-gray-300">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white font-bold text-[10px]">01</div>
                  <span>Meningkatkan kualitas layanan publik perpustakaan & arsip.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white font-bold text-[10px]">02</div>
                  <span>Transparansi penanganan keluhan warga.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white font-bold text-[10px]">03</div>
                  <span>Laporan Anda dijaga kerahasiaannya.</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Kontak Darurat</h3>
              <div className="space-y-4">
                <a href="tel:112" className="flex items-center gap-3 p-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                  <AlertCircle size={20} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Panggilan Darurat</p>
                    <p className="font-black">112</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 text-gray-600">
                  <Phone size={20} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest">WhatsApp Admin</p>
                    <p className="font-black">0812-3456-7890</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <User size={14} className="text-[#0c2f3d]" /> Nama Lengkap
                    </label>
                    <input required value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} type="text" placeholder="Masukkan nama" className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Mail size={14} className="text-[#0c2f3d]" /> Email Aktif
                    </label>
                    <input required value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" placeholder="example@mail.com" className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Phone size={14} className="text-[#0c2f3d]" /> Nomor Telepon / WA
                    </label>
                    <input required value={form.telepon} onChange={e => setForm({...form, telepon: e.target.value})} type="tel" placeholder="08xxx" className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <AlertCircle size={14} className="text-[#0c2f3d]" /> Kategori Pengaduan
                    </label>
                    <select value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none">
                      <option>Layanan Perpustakaan</option>
                      <option>Layanan Kearsipan</option>
                      <option>Fasilitas Gedung</option>
                      <option>Pegawai / SDM</option>
                      <option>Website / Sistem Digital</option>
                      <option>Lainnya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <MapPin size={14} className="text-[#0c2f3d]" /> Alamat / Lokasi Terkait
                  </label>
                  <input required value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} type="text" placeholder="Masukkan lokasi detail" className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none" />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <MessageSquare size={14} className="text-[#0c2f3d]" /> Isi Laporan / Pengaduan
                  </label>
                  <textarea required value={form.pesan} onChange={e => setForm({...form, pesan: e.target.value})} rows={5} placeholder="Jelaskan secara detail keluhan Anda..." className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#0c2f3d]/10 outline-none resize-none" />
                </div>

                <button disabled={status === 'loading'} type="submit" className="w-full bg-[#0c2f3d] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#1a4254] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {status === 'loading' ? 'Mengirim...' : (
                    <>
                      Kirim Laporan Sekarang <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
