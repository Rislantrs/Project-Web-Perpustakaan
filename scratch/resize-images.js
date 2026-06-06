import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imagesToOptimize = [
  {
    src: 'src/assets/layanan/dioramaPurwakarta/image-1.webp',
    width: 600,
  },
  {
    src: 'src/assets/layanan/kearsipan/Gedung_Arsip.webp',
    width: 600,
  },
  {
    src: 'src/assets/image/lib-hero.webp',
    width: 1200,
  },
  {
    src: 'src/assets/image/lib-indoor.webp',
    width: 1200,
  },
  {
    src: 'src/assets/image/lib-room.webp',
    width: 1200,
  },
  {
    src: 'src/assets/image/lib-books.webp',
    width: 1200,
  }
];

async function optimize() {
  for (const imgInfo of imagesToOptimize) {
    const filePath = path.resolve(imgInfo.src);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }
    
    try {
      const originalBuffer = fs.readFileSync(filePath);
      const metadata = await sharp(originalBuffer).metadata();
      
      // Only optimize if the image is wider than the target width
      if (metadata.width > imgInfo.width) {
        console.log(`Original ${imgInfo.src}: ${metadata.width}x${metadata.height}`);
        const optimizedBuffer = await sharp(originalBuffer)
          .resize({ width: imgInfo.width })
          .webp({ quality: 75 })
          .toBuffer();
          
        fs.writeFileSync(filePath, optimizedBuffer);
        
        const newMetadata = await sharp(optimizedBuffer).metadata();
        console.log(`Optimized ${imgInfo.src}: ${newMetadata.width}x${newMetadata.height} (${(optimizedBuffer.length / 1024).toFixed(2)} KB)`);
      } else {
        console.log(`Skipped ${imgInfo.src} (already ${metadata.width}x${metadata.height}, smaller than target ${imgInfo.width})`);
      }
    } catch (err) {
      console.error(`Failed to optimize ${imgInfo.src}:`, err);
    }
  }
}

optimize();
