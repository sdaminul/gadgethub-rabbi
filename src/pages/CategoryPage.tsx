import { useMemo } from 'react';
import { useCategoryBySlug, useProducts, useCategories, useProductCountsByCategory } from '@/lib/hooks';
import { getDescendantCategoryIds, buildCategoryTree, getCategoryPath } from '@/lib/utils';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useRouter } from '@/lib/router';
import { Package, ChevronRight } from 'lucide-react';
import { Link } from '@/lib/router';

export function CategoryPage({ slug }: { slug: string }) {
  const { category, loading } = useCategoryBySlug(slug);
  const { categories } = useCategories();
  const counts = useProductCountsByCategory();
  const { route, navigate } = useRouter();
  const tree = buildCategoryTree(categories);

  const childCategories = useMemo(() => {
    if (!category) return [];
    return categories.filter((c) => c.parent_id === category.id).sort((a, b) => a.sort_order - b.sort_order);
  }, [category, categories]);

  const descendantIds = useMemo(() => {
    if (!category) return [];
    return getDescendantCategoryIds(category.id, categories);
  }, [category, categories]);

  const sort = (route.query.get('sort') as 'newest' | 'name' | 'popular') || 'newest';
  const page = parseInt(route.query.get('page') || '1', 10);
  const perPage = 12;

  const { products, total, loading: productsLoading } = useProducts({
    categoryIds: descendantIds,
    page,
    perPage,
    sort,
  });

  const totalPages = Math.ceil(total / perPage);
  const categoryPath = category ? getCategoryPath(category.id, categories) : [];

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-6 w-48 skeleton rounded" />
        <div className="h-10 w-64 skeleton rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <Package size={56} className="mx-auto text-ink-300" />
        <h1 className="mt-6 font-display text-2xl font-700 text-ink-900">Category not found</h1>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-600 text-white hover:bg-brand-500"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  const updateSort = (newSort: string) => {
    const params = new URLSearchParams(route.query.toString());
    params.set('sort', newSort);
    navigate(`/category/${slug}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-ink-50 animate-fade-in">
      <div
        className="relative h-48 sm:h-64 overflow-hidden bg-ink-900"
      >
        {category.image_url && (
          <img
            src={category.image_url}
            alt={category.name}
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-6">
          <Breadcrumbs
            items={[
              { label: 'Products', to: '/products' },
              ...categoryPath.map((c) => ({ label: c.name, to: `/category/${c.slug}` })),
              { label: category.name },
            ]}
          />
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-800 text-white">
            {category.name}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {category.description && (
          <p className="text-lg text-ink-600 leading-relaxed max-w-3xl mb-8">
            {category.description}
          </p>
        )}

        {childCategories.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-xl font-700 text-ink-900 mb-4">Subcategories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {childCategories.map((child, i) => {
                const childDescendants = getDescendantCategoryIds(child.id, categories);
                const count = childDescendants.reduce((sum, id) => sum + (counts[id] || 0), 0);
                return (
                  <CategoryCard
                    key={child.id}
                    category={child}
                    productCount={count}
                    index={i}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-700 text-ink-900">
            Products {total > 0 && <span className="text-ink-400 font-500">({total})</span>}
          </h2>
          <select
            value={sort}
            onChange={(e) => updateSort(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-600 text-ink-700 outline-none focus:border-brand-500"
          >
            <option value="newest">Newest</option>
            <option value="name">Name (A-Z)</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-300 bg-white py-20 text-center">
            <Package size={48} className="text-ink-300" />
            <h3 className="mt-4 font-display text-lg font-700 text-ink-900">No products in this category yet</h3>
            <p className="mt-2 text-sm text-ink-500">Check back soon or browse other categories</p>
            <Link
              to="/products"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-600 text-white hover:bg-brand-500"
            >
              All Products <ChevronRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => {
                    const params = new URLSearchParams(route.query.toString());
                    params.set('page', String(page - 1));
                    navigate(`/category/${slug}?${params.toString()}`);
                  }}
                  className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-600 text-ink-700 hover:bg-ink-100 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm font-600 text-ink-700">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => {
                    const params = new URLSearchParams(route.query.toString());
                    params.set('page', String(page + 1));
                    navigate(`/category/${slug}?${params.toString()}`);
                  }}
                  className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-600 text-ink-700 hover:bg-ink-100 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
