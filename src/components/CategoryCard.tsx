import { Link } from '@/lib/router';
import type { Category } from '@/lib/types';
import { ImageWithFallback } from './ImageWithFallback';
import { ChevronRight, Package } from 'lucide-react';

export function CategoryCard({
  category,
  productCount,
  index = 0,
}: {
  category: Category;
  productCount?: number;
  index?: number;
}) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-ink-200/60 bg-white shadow-card hover:shadow-float transition-all duration-300 hover:-translate-y-1 animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-100">
        <ImageWithFallback
          src={category.image_url}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-lg font-700 text-white">{category.name}</h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-ink-200">
            <Package size={14} />
            <span>{productCount !== undefined ? `${productCount} products` : 'Browse'}</span>
            <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
