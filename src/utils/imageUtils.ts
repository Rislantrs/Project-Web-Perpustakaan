/**
 * Utility to compress images using Canvas before uploading to database.
 * This helps avoid storage limits and speeds up page loads.
 */

export const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions while maintaining aspect ratio
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            
            // Output as WebP for best compression-to-quality ratio
            const compressed = canvas.toDataURL('image/webp', quality);
            resolve(compressed);
        };
        img.onerror = (err) => reject(err);
    });
};
