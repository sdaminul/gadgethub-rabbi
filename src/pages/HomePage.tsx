import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/lib/router';
import {
  useCategories,
  useProducts,
  useSettings,
  useProductCountsByCategory,
} from '@/lib/hooks';
import { buildCategoryTree, getDescendantCategoryIds } from '@/lib/utils';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';
import {
  Search,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  Package,
  Layers,
  Zap,
} from 'lucide-react';

export function HomePage() {
  const { navigate } = useRouter();
  const { categories } = useCategories();
  const { settings } = useSettings();
  const counts = useProductCountsByCategory();
  const tree = buildCategoryTree(categories);
  const rootCategories = tree.slice(0, 6);

  const { products: featured, loading: featuredLoading } = useProducts({
    featured: true,
    perPage: 8,
    sort: 'newest',
  });
  const { products: latest, loading: latestLoading } = useProducts({
    perPage: 8,
    sort: 'newest',
  });
  const { products: popular, loading: popularLoading } = useProducts({
    popular: true,
    perPage: 4,
    sort: 'popular',
  });

  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <div className="animate-fade-in">
      <Hero
        settings={settings}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        onSearch={handleSearch}
        totalCategories={tree.length}
      />

      <CategoriesSection categories={rootCategories} counts={counts} allCategories={categories} />

      <FeaturedSection products={featured} loading={featuredLoading} />

      <PopularSection products={popular} loading={popularLoading} />

      <LatestSection products={latest} loading={latestLoading} />
    </div>
  );
}

function Hero({
  settings,
  searchValue,
  setSearchValue,
  onSearch,
  totalCategories,
}: {
  settings: any;
  searchValue: string;
  setSearchValue: (v: string) => void;
  onSearch: (e: React.FormEvent) => void;
  totalCategories: number;
}) {
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    const images = [
      'https://images.pexels.com/photos/207589/pexels-photo-207589.jpeg?auto=compress&cs=tinysrgb&w=1600',
      'https://images.pexels.com/photos/325057/pexels-photo-325057.jpeg?auto=compress&cs=tinysrgb&w=1600',
      'https://images.pexels.com/photos/15372902/pexels-photo-15372902.jpeg?auto=compress&cs=tinysrgb&w=1600',
    ];
    setHeroImage(images[Math.floor(Math.random() * images.length)]);
  }, []);

  return (
    <section className="relative overflow-hidden bg-ink-950">
      <div className="absolute inset-0">
        {heroImage && (
          <img
            src={heroImage}
            alt=""
            className="h-full w-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-ink-950/80 to-brand-950/40" />
        <div className="absolute inset-0 gradient-mesh opacity-40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full glass-dark px-4 py-2 text-sm font-600 text-white animate-fade-up">
            <Sparkles size={16} className="text-accent-400" />
            {settings?.tagline || 'Premium Product Catalog'}
          </div>

          <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-800 leading-[1.1] text-white animate-fade-up" style={{ animationDelay: '100ms' }}>
            Discover products
            <br />
            <span className="gradient-text">built to inspire</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-ink-300 leading-relaxed animate-fade-up" style={{ animationDelay: '200ms' }}>
            Explore our curated catalog of premium products across {totalCategories}+ categories.
            Detailed specifications, rich imagery, and the details you need to make informed choices.
          </p>

          <form onSubmit={onSearch} className="mt-8 max-w-xl animate-fade-up" style={{ animationDelay: '300ms' }}>
            <div className="relative flex items-center gap-2 rounded-2xl glass-dark p-2 border border-white/10">
              <Search size={20} className="ml-3 text-ink-400 shrink-0" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search products, brands, models..."
                className="flex-1 bg-transparent py-2.5 text-white placeholder-ink-400 outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-600 text-white hover:bg-brand-500 transition-colors"
              >
                Search <ArrowRight size={16} />
              </button>
            </div>
          </form>

          <div className="mt-10 flex flex-wrap gap-6 animate-fade-up" style={{ animationDelay: '400ms' }}>
            <Stat icon={<Package size={18} />} label="Products" value="1000+" />
            <Stat icon={<Layers size={18} />} label="Categories" value="Unlimited" />
            <Stat icon={<Zap size={18} />} label="Instant Search" value="Fast" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ink-50 to-transparent" />
    </section>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl glass-dark text-brand-400">
        {icon}
      </div>
      <div>
        <div className="font-display text-lg font-700 text-white">{value}</div>
        <div className="text-xs text-ink-400">{label}</div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  viewAllTo,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  viewAllTo?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2 text-brand-600 mb-2">
          {icon}
          <span className="text-sm font-700 uppercase tracking-wider">{subtitle}</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-700 text-ink-900">{title}</h2>
      </div>
      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="group flex items-center gap-1 text-sm font-600 text-brand-600 hover:text-brand-700 shrink-0"
        >
          View All
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

function CategoriesSection({
  categories,
  counts,
  allCategories,
}: {
  categories: any[];
  counts: Record<string, number>;
  allCategories: any[];
}) {
  if (categories.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <SectionHeader
        icon={<Layers size={16} />}
        subtitle="Browse"
        title="Product Categories"
        viewAllTo="/products"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, i) => {
          const descendantIds = getDescendantCategoryIds(cat.id, allCategories);
          const totalCount = descendantIds.reduce(
            (sum, id) => sum + (counts[id] || 0),
            0,
          );
          return (
            <CategoryCard
              key={cat.id}
              category={cat}
              productCount={totalCount}
              index={i}
            />
          );
        })}
      </div>
    </section>
  );
}

function FeaturedSection({
  products,
  loading,
}: {
  products: any[];
  loading: boolean;
}) {
  if (!loading && products.length === 0) return null;
  return (
    <section className="bg-white border-y border-ink-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <SectionHeader
          icon={<Sparkles size={16} />}
          subtitle="Handpicked"
          title="Featured Products"
          viewAllTo="/products?sort=newest"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}

function PopularSection({
  products,
  loading,
}: {
  products: any[];
  loading: boolean;
}) {
  if (!loading && products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <SectionHeader
        icon={<TrendingUp size={16} />}
        subtitle="Trending"
        title="Popular Products"
        viewAllTo="/products?sort=popular"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}

function LatestSection({
  products,
  loading,
}: {
  products: any[];
  loading: boolean;
}) {
  if (!loading && products.length === 0) return null;
  return (
    <section className="bg-ink-100/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <SectionHeader
          icon={<Clock size={16} />}
          subtitle="Just Added"
          title="Latest Products"
          viewAllTo="/products?sort=newest"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}
