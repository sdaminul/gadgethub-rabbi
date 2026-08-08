import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from './AdminLayout';
import { Star, Search, AlertCircle, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/types';

export function AdminFeatured() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*, category:categories(name), product_images(*)')
      .order('created_at', { ascending: false });
    if (search.trim()) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
    }
    const { data } = await query.limit(100);
    setProducts((data as Product[]) || []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFeatured = async (product: Product) => {
    setUpdating(product.id);
    await supabase
      .from('products')
      .update({ is_featured: !product.is_featured })
      .eq('id', product.id);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_featured: !p.is_featured } : p)),
    );
    setUpdating(null);
  };

  const togglePopular = async (product: Product) => {
    setUpdating(product.id);
    await supabase
      .from('products')
      .update({ is_popular: !product.is_popular })
      .eq('id', product.id);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_popular: !p.is_popular } : p)),
    );
    setUpdating(null);
  };

  const featuredCount = products.filter((p) => p.is_featured).length;
  const popularCount = products.filter((p) => p.is_popular).length;

  return (
    <AdminLayout active="featured">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-700 text-ink-900">Featured & Popular</h1>
        <p className="mt-1 text-ink-500">
          {featuredCount} featured · {popularCount} popular products on your homepage
        </p>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      <div className="rounded-2xl border border-ink-200/60 bg-white shadow-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-ink-100">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-ink-50/50">
                <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-ink-100">
                  {p.product_images?.[0] ? (
                    <img src={p.product_images[0].image_url} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-600 text-ink-900">{p.name}</div>
                  <div className="text-xs text-ink-500 truncate">
                    {p.brand || 'No brand'} · {p.category?.name || 'Uncategorized'}
                  </div>
                </div>
                <button
                  onClick={() => toggleFeatured(p)}
                  disabled={updating === p.id}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-600 transition-colors ${
                    p.is_featured
                      ? 'bg-accent-500 text-white hover:bg-accent-600'
                      : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                  }`}
                >
                  {updating === p.id ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
                  Featured
                </button>
                <button
                  onClick={() => togglePopular(p)}
                  disabled={updating === p.id}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-600 transition-colors ${
                    p.is_popular
                      ? 'bg-brand-600 text-white hover:bg-brand-500'
                      : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                  }`}
                >
                  {updating === p.id ? <Loader2 size={14} className="animate-spin" /> : '🔥'}
                  Popular
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
