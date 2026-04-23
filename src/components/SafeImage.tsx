import { ImgHTMLAttributes, useMemo, useState } from 'react';

const SVG_PLACEHOLDER = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#f3f4f6"/><g fill="#9ca3af" font-family="Arial, sans-serif" text-anchor="middle"><text x="300" y="190" font-size="20">Gambar tidak tersedia</text><text x="300" y="220" font-size="13">Periksa koneksi atau tautan gambar</text></g></svg>'
);

const DEFAULT_PLACEHOLDER_SRC = `data:image/svg+xml;charset=utf-8,${SVG_PLACEHOLDER}`;

type SafeImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

export default function SafeImage({ src, fallbackSrc, alt, ...rest }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  const resolvedFallback = useMemo(
    () => fallbackSrc || DEFAULT_PLACEHOLDER_SRC,
    [fallbackSrc]
  );

  const resolvedSrc = failed || !src ? resolvedFallback : src;

  return (
    <img
      {...rest}
      src={resolvedSrc}
      alt={alt || 'Gambar'}
      onError={() => setFailed(true)}
    />
  );
}
