import { useState, useEffect, useMemo } from 'react';
import { useProducts, useCategories, useAllBrands, useAllTags } from '@/lib/hooks';
import { buildCategoryTree, getDescendantCategoryIds } from '@/lib/utils';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useRouter } from '@/lib/router';
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Package,
} from 'lucide-react';

export function ProductsPage() {
  const { route, navigate } = useRouter();
  const { categories } = useCategories();
  const brands = useAllBrands();
  const tags = useAllTags();
  const tree = buildCategoryTree(categories);

  const search = route.query.get('search') || '';
  const initialSort = (route.query.get('sort') as 'newest' | 'name' | 'popular') || 'newest';
  const initialBrand = route.query.get('brand') || '';
  const initialTag = route.query.get('tag') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [sort, setSort] = useState<'newest' | 'name' | 'popular'>(initialSort);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const perPage = 12;

  useEffect(() => {
    setSearchInput(search);
    setSort(initialSort as any);
    setSelectedBrand(initialBrand);
    setSelectedTag(initialTag);
    setPage(1);
  }, [search, initialSort, initialBrand, initialTag]);

  const { products, total, loading } = useProducts({
    page,
    perPage,
    search,
    brand: selectedBrand || null,
    tag: selectedTag || null,
    sort,
  });

  const totalPages = Math.ceil(total / perPage);

  const updateUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(route.query.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val) params.set(key, val);
      else params.delete(key);
    });
    navigate(`/products?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: searchInput.trim() || null });
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedTag('');
    setSearchInput('');
    navigate('/products');
  };

  const hasFilters = search || selectedBrand || selectedTag;

  return (
    <div className="min-h-screen bg-ink-50 animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: 'All Products' }]} />

        <div className="mt-6 mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-800 text-ink-900">
            All Products
          </h1>
          <p className="mt-2 text-ink-500">
            {loading ? 'Loading...' : `${total} product${total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="rounded-2xl border border-ink-200/60 bg-white p-4 shadow-card">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-xl border border-ink-200 bg-ink-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </form>
              </div>

              <FilterPanel
                title="Sort By"
                icon={<SlidersHorizontal size={16} />}
              >
                <div className="space-y-1">
                  {[
                    { val: 'newest', label: 'Newest' },
                    { val: 'name', label: 'Name (A-Z)' },
                    { val: 'popular', label: 'Most Popular' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setSort(opt.val as any)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                        sort === opt.val
                          ? 'bg-brand-50 text-brand-700 font-600'
                          : 'text-ink-600 hover:bg-ink-100'
                      }`}
                    >
                      {opt.label}
                      {sort === opt.val && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </FilterPanel>

              {brands.length > 0 && (
                <FilterPanel title="Brand" icon={<Package size={16} />}>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedBrand('');
                        updateUrl({ brand: null });
                      }}
                      className={`flex w-full rounded-lg px-3 py-2 text-sm transition-colors ${
                        !selectedBrand
                          ? 'bg-brand-50 text-brand-700 font-600'
                          : 'text-ink-600 hover:bg-ink-100'
                      }`}
                    >
                      All Brands
                    </button>
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => {
                          setSelectedBrand(brand);
                          updateUrl({ brand });
                          setPage(1);
                        }}
                        className={`flex w-full rounded-lg px-3 py-2 text-sm transition-colors ${
                          selectedBrand === brand
                            ? 'bg-brand-50 text-brand-700 font-600'
                            : 'text-ink-600 hover:bg-ink-100'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </FilterPanel>
              )}

              {tags.length > 0 && (
                <FilterPanel title="Tags">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTag(selectedTag === tag ? '' : tag);
                          updateUrl({ tag: selectedTag === tag ? null : tag });
                          setPage(1);
                        }}
                        className={`rounded-full px-3 py-1.5 text-xs font-600 transition-colors ${
                          selectedTag === tag
                            ? 'bg-brand-600 text-white'
                            : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </FilterPanel>
              )}

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white py-2.5 text-sm font-600 text-ink-600 hover:bg-ink-100 transition-colors"
                >
                  <X size={16} /> Clear Filters
                </button>
              )}
            </div>
          </aside>

          <div className="flex-1">
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="lg:hidden mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white py-2.5 text-sm font-600 text-ink-700"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-300 bg-white py-24 text-center">
                <Package size={48} className="text-ink-300" />
                <h3 className="mt-4 font-display text-lg font-700 text-ink-900">No products found</h3>
                <p className="mt-2 text-sm text-ink-500">Try adjusting your search or filters</p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-600 text-white hover:bg-brand-500"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <PaginationButton
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </PaginationButton>
                    <span className="px-4 py-2 text-sm font-600 text-ink-700">
                      {page} / {totalPages}
                    </span>
                    <PaginationButton
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </PaginationButton>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl border border-ink-200/60 bg-white p-4 shadow-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-700 text-ink-900"
      >
        <span className="flex items-center gap-2">
          {icon} {title}
        </span>
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function PaginationButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-600 text-ink-700 hover:bg-ink-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}
