import { Link } from '@/lib/router';
import type { Product } from '@/lib/types';
import { ImageWithFallback } from './ImageWithFallback';
import { CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const primaryImage = product.product_images?.[0]?.image_url;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-200/60 bg-white shadow-card hover:shadow-float transition-all duration-300 hover:-translate-y-1 animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
        <ImageWithFallback
          src={primaryImage}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {product.is_featured && (
            <span className="rounded-full bg-brand-600/95 px-2.5 py-1 text-xs font-700 text-white backdrop-blur-sm">
              Featured
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge status={product.status} />
        </div>
        <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-ink-900 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <ArrowUpRight size={18} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.brand && (
          <span className="text-xs font-600 uppercase tracking-wider text-brand-600">
            {product.brand}
          </span>
        )}
        <h3 className="mt-1 font-display text-base font-600 text-ink-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>
        {product.short_description && (
          <p className="mt-1.5 text-sm text-ink-500 line-clamp-2">
            {product.short_description}
          </p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-3">
          {product.customer_price != null && (
            <span className="font-display text-base font-700 text-brand-700">
              {formatPrice(product.customer_price)}
            </span>
          )}
          {product.model && (
            <span className="rounded-lg bg-ink-100 px-2 py-1 text-xs font-500 text-ink-600">
              {product.model}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function StatusBadge({ status }: { status: 'available' | 'out_of_stock' }) {
  if (status === 'available') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-success/90 px-2.5 py-1 text-xs font-600 text-white backdrop-blur-sm">
        <CheckCircle2 size={12} /> In Stock
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 rounded-full bg-error/90 px-2.5 py-1 text-xs font-600 text-white backdrop-blur-sm">
      <XCircle size={12} /> Out of Stock
    </span>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200/60 bg-white shadow-card">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-20 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-4 w-2/3 skeleton rounded" />
        <div className="h-6 w-16 skeleton rounded mt-2" />
      </div>
    </div>
  );
}
