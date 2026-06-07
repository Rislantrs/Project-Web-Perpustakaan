import DOMPurify from 'dompurify';

/**
 * Security Utilities for Disipusda Purwakarta
 * Digunakan untuk mencegah serangan XSS dan pembersihan data input.
 */

export const sanitize = (text: string | undefined | null): string => {
  if (!text) return '';
  
  return DOMPurify.sanitize(text.toString(), {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'pre', 'code', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel', 'width', 'height', 'style']
  });
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
