import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_BUCKET = 'articles';

const dataUrlToFile = (dataUrl: string, filename: string): File => {
  const parts = dataUrl.split(',');
  if (parts.length < 2) {
    throw new Error('Format data URL tidak valid.');
  }

  const mimeMatch = parts[0].match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] || 'image/webp';
  const binary = atob(parts[1]);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new File([bytes], filename, { type: mime });
};

interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxWidth?: number;
  quality?: number;
}

const resizeImageFile = async (
  file: File,
  maxWidth: number,
  quality: number
): Promise<File> => {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gagal memuat gambar untuk kompresi.'));
    img.src = dataUrl;
  });

  if (image.width <= maxWidth) {
    return file;
  }

  const targetWidth = maxWidth;
  const targetHeight = Math.round((image.height * targetWidth) / image.width);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return file;
  }

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/webp', quality);
  });

  if (!blob) {
    return file;
  }

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
};

/**
 * Upload file ke Supabase Storage (Bucket: 'articles')
 * Mengembalikan URL publik file tersebut
 */
export const uploadImage = async (file: File, options: UploadOptions = {}): Promise<string> => {
  const bucket = options.bucket || DEFAULT_BUCKET;
  const folder = options.folder ? `${options.folder.replace(/^\/|\/$/g, '')}/` : '';
  const maxWidth = options.maxWidth || 1200;
  const quality = options.quality || 0.82;
  const optimizedFile = await resizeImageFile(file, maxWidth, quality);
  const fileExt = optimizedFile.name.split('.').pop() || 'webp';
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${folder}${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, optimizedFile);

  if (uploadError) {
    throw new Error(`Upload gambar ke Storage gagal: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const uploadDataUrlImage = async (
  dataUrl: string,
  options: UploadOptions = {}
): Promise<string> => {
  const filename = `${uuidv4()}.webp`;
  const file = dataUrlToFile(dataUrl, filename);
  return uploadImage(file, options);
};

