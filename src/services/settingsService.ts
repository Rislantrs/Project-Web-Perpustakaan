export interface SiteSettings {
  namaInstansi: string;
  alamatInstansi: string;
  emailKontak: string;
  teleponKontak: string;
  waAdmin: string;
  jamOperasional: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  linkGmaps: string;
  visi: string;
  misi: string[];
}

const SETTINGS_KEY = 'disipusda_settings';

const defaultSettings: SiteSettings = {
  namaInstansi: 'DISIPUSDA PURWAKARTA',
  alamatInstansi: 'Jl. Kusumaatmaja No.5, Cipaisan, Kec. Purwakarta, Kabupaten Purwakarta, Jawa Barat 41113',
  emailKontak: 'disipusda@purwakartakab.go.id',
  teleponKontak: '(0264) 200032',
  waAdmin: '081234567890',
  jamOperasional: 'Senin - Jumat: 08:00 - 16:00, Sabtu: 09:00 - 14:00',
  facebookUrl: 'https://facebook.com/disipusdapwk',
  instagramUrl: 'https://instagram.com/disipusdapwk',
  twitterUrl: 'https://twitter.com/disipusdapwk',
  youtubeUrl: 'https://youtube.com/disipusdapwk',
  linkGmaps: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.7056461427506!2d107.4429!3d-6.5526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMzMnMDkuNCJTIDEwN8KwMjYnMzQuNCJF!5e0!3m2!1sen!2sid!4v1620000000000!5m2!1sen!2sid',
  visi: 'Terwujudnya Masyarakat Purwakarta yang Cerdas dan Berbudaya melalui Budaya Baca dan Tertib Arsip.',
  misi: [
    'Meningkatkan kualitas pelayanan perpustakaan dan kearsipan.',
    'Menumbuhkembangkan minat dan budaya baca masyarakat.',
    'Mewujudkan sistem kearsipan yang andal dan akuntabel.',
    'Meningkatkan sarana dan prasarana penunjang layanan.'
  ]
};

export const getSiteSettings = (): SiteSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : defaultSettings;
};

export const updateSiteSettings = (newSettings: SiteSettings): { success: boolean; message: string } => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  return { success: true, message: 'Settings berhasil diperbarui!' };
};
