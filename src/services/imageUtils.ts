export const compressImage = (file: File, maxSizeMB: number = 10, maxWidthOrHeight: number = 1024): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Guard awal ukuran file sebelum proses canvas.
    if (file.size > maxSizeMB * 1024 * 1024) {
      reject(new Error(`Ukuran file terlalu besar (Maks ${maxSizeMB}MB)`));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = Math.round((height *= maxWidthOrHeight / width));
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = Math.round((width *= maxWidthOrHeight / height));
            height = maxWidthOrHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string); // fallback
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        // HARDCODE OUTPUT:
        // format webp kualitas 80% untuk keseimbangan kualitas dan ukuran file.
        const dataUrl = canvas.toDataURL('image/webp', 0.8);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
