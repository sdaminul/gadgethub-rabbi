import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from './AdminLayout';
import { Link } from '@/lib/router';
import { Package, FolderTree, Sparkles, TrendingUp, Eye, ArrowRight, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Product, Category } from '@/lib/types';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    featuredCount: 0,
    totalViews: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [topCategories, setTopCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [products, categories, featured, views, recent, catCounts] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_featured', true),
        supabase.from('products').select('view_count'),
        supabase.from('products').select('*, category:categories(name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('products').select('category_id, category:categories(name)'),
      ]);

      const totalViews = (views.data || []).reduce((sum, p) => sum + (p.view_count || 0), 0);

      const catMap: Record<string, { name: string; count: number }> = {};
      (catCounts.data || []).forEach((p: any) => {
        if (p.category_id && p.category?.name) {
          if (!catMap[p.category_id]) {
            catMap[p.category_id] = { name: p.category.name, count: 0 };
          }
          catMap[p.category_id].count++;
        }
      });
      const top = Object.values(catMap).sort((a, b) => b.count - a.count).slice(0, 5);

      setStats({
        totalProducts: products.count || 0,
        totalCategories: categories.count || 0,
        featuredCount: featured.count || 0,
        totalViews,
      });
      setRecentProducts((recent.data as Product[]) || []);
      setTopCategories(top);
      setLoading(false);
    })();
  }, []);

  return (
    <AdminLayout active="dashboard">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-700 text-ink-900">Welcome back</h1>
        <p className="mt-1 text-ink-500">Here's an overview of your product catalog.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Package size={22} />}
          label="Total Products"
          value={stats.totalProducts}
          color="brand"
          to="/admin/products"
        />
        <StatCard
          icon={<FolderTree size={22} />}
          label="Total Categories"
          value={stats.totalCategories}
          color="accent"
          to="/admin/categories"
        />
        <StatCard
          icon={<Sparkles size={22} />}
          label="Featured Products"
          value={stats.featuredCount}
          color="success"
          to="/admin/featured"
        />
        <StatCard
          icon={<Eye size={22} />}
          label="Total Views"
          value={stats.totalViews}
          color="ink"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-ink-200/60 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-700 text-ink-900 flex items-center gap-2">
              <Clock size={18} className="text-brand-600" /> Recent Products
            </h2>
            <Link to="/admin/products" className="text-sm font-600 text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 skeleton rounded-xl" />
              ))}
            </div>
          ) : recentProducts.length === 0 ? (
            <p className="text-sm text-ink-500 py-8 text-center">No products yet. Add your first product!</p>
          ) : (
            <div className="space-y-2">
              {recentProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/admin/products?edit=${p.id}`}
                  className="flex items-center gap-3 rounded-xl p-2 hover:bg-ink-50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-100 text-ink-400 shrink-0">
                    <Package size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-600 text-ink-900">{p.name}</div>
                    <div className="text-xs text-ink-500">
                      {p.brand || 'No brand'} · {formatDate(p.created_at)}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-600 ${
                    p.status === 'available' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}>
                    {p.status === 'available' ? 'Available' : 'Out of Stock'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-ink-200/60 bg-white p-6 shadow-card">
          <h2 className="font-display text-lg font-700 text-ink-900 flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-brand-600" /> Top Categories
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 skeleton rounded-xl" />
              ))}
            </div>
          ) : topCategories.length === 0 ? (
            <p className="text-sm text-ink-500 py-8 text-center">No categories with products yet.</p>
          ) : (
            <div className="space-y-3">
              {topCategories.map((cat, i) => {
                const maxCount = topCategories[0].count;
                const pct = (cat.count / maxCount) * 100;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-600 text-ink-700">{cat.name}</span>
                      <span className="text-ink-500">{cat.count} products</span>
                    </div>
                    <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'brand' | 'accent' | 'success' | 'ink';
  to?: string;
}) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    accent: 'bg-accent-50 text-accent-600',
    success: 'bg-success/10 text-success',
    ink: 'bg-ink-100 text-ink-700',
  };
  const content = (
    <div className="rounded-2xl border border-ink-200/60 bg-white p-5 shadow-card hover:shadow-float transition-shadow">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors[color]}`}>
        {icon}
      </div>
      <div className="mt-4">
        <div className="font-display text-3xl font-800 text-ink-900">{value.toLocaleString()}</div>
        <div className="text-sm text-ink-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}
