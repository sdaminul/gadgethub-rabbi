import { useState, useRef } from 'react';
import { ImageWithFallback } from './ImageWithFallback';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';

export function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const displayImages = images.length > 0 ? images : [];
  const activeImage = displayImages[activeIndex];

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const next = () => setActiveIndex((i) => (i + 1) % displayImages.length);
  const prev = () =>
    setActiveIndex((i) => (i - 1 + displayImages.length) % displayImages.length);

  if (displayImages.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-ink-200/60 bg-white shadow-card">
        <div className="aspect-square">
          <ImageWithFallback src={null} alt={productName} className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onClick={() => setZoomOpen(true)}
          className="group relative aspect-square overflow-hidden rounded-2xl border border-ink-200/60 bg-white shadow-card cursor-zoom-in"
        >
          <div
            className="absolute inset-0 transition-transform duration-200"
            style={{
              backgroundImage: `url(${activeImage})`,
              backgroundSize: '200%',
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
            }}
          >
            <img
              src={activeImage}
              alt={productName}
              className="h-full w-full object-cover group-hover:opacity-0 transition-opacity duration-200"
            />
          </div>
          <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl glass-dark text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn size={20} />
          </div>
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-xl glass-dark text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ink-900/80"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-xl glass-dark text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ink-900/80"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {displayImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative shrink-0 h-20 w-20 overflow-hidden rounded-xl border-2 transition-all ${
                  i === activeIndex
                    ? 'border-brand-500 ring-2 ring-brand-500/20'
                    : 'border-ink-200 hover:border-ink-300'
                }`}
              >
                <img src={img} alt={`${productName} ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {zoomOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/90 backdrop-blur-sm animate-fade-in"
          onClick={() => setZoomOpen(false)}
        >
          <button className="absolute top-6 right-6 flex h-11 w-11 items-center justify-center rounded-xl glass-dark text-white hover:bg-ink-900/80">
            <X size={22} />
          </button>
          <img
            src={activeImage}
            alt={productName}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-xl glass-dark text-white hover:bg-ink-900/80"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-xl glass-dark text-white hover:bg-ink-900/80"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
