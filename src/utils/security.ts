/**
 * Security Utilities for Disipusda Purwakarta
 * Digunakan untuk mencegah serangan XSS dan pembersihan data input.
 */

export const sanitize = (text: string | undefined | null): string => {
  if (!text) return '';
  
  return text
    .toString()
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "") // Buang script tags
    .replace(/on\w+="[^"]*"/gmi, "") // Buang inline event handlers (onclick, dsb)
    .replace(/javascript:/gmi, "") // Buang link javascript
    .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gmi, "") // Buang iframe liar
    .replace(/<object\b[^>]*>([\s\S]*?)<\/object>/gmi, ""); // Buang object liar
};

/**
 * Memasangkan sanitization ke seluruh object secara rekursif
 */
export const sanitizeObject = <T extends object>(obj: T): T => {
  const newObj = { ...obj } as any;
  for (const key in newObj) {
    if (typeof newObj[key] === 'string') {
      newObj[key] = sanitize(newObj[key]);
    } else if (Array.isArray(newObj[key])) {
      newObj[key] = newObj[key].map((item: any) => 
        typeof item === 'string' ? sanitize(item) : (typeof item === 'object' ? sanitizeObject(item) : item)
      );
    } else if (typeof newObj[key] === 'object' && newObj[key] !== null) {
      newObj[key] = sanitizeObject(newObj[key]);
    }
  }
  return newObj;
};
