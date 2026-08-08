import { useState } from 'react';

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackText,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackText?: string;
}) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-ink-100 to-ink-200 ${className}`}
      >
        <div className="flex flex-col items-center gap-2 text-ink-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          {fallbackText && <span className="text-xs font-500">{fallbackText}</span>}
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      className={className}
    />
  );
}
