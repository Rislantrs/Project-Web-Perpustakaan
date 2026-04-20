import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

import { fileToBase64 } from './dataService';

/**
 * Upload file ke Supabase Storage (Bucket: 'articles')
 * Mengembalikan URL publik file tersebut
 */
export const uploadImage = async (file: File): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 1. Upload ke Bucket 'articles'
    const { error: uploadError } = await supabase.storage
      .from('articles')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Ambil URL Publiknya
    const { data } = supabase.storage
      .from('articles')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error('Upload failed, falling back to compressed base64:', err);
    // Jika upload gagal, baru kita gunakan kompresi Base64 dari dataService
    return await fileToBase64(file);
  }
};

