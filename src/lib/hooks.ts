import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import type {
  Category,
  Product,
  SiteSettings,
  ProductImage,
} from './types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order')
        .order('name');
      if (!cancelled && !error) setCategories(data as Category[]);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading };
}

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (!cancelled && !error) setSettings(data as SiteSettings);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loading };
}

export function useProducts(opts: {
  page?: number;
  perPage?: number;
  categoryId?: string | null;
  categoryIds?: string[] | null;
  search?: string;
  brand?: string | null;
  tag?: string | null;
  sort?: 'newest' | 'name' | 'popular';
  featured?: boolean;
  popular?: boolean;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const {
    page = 1,
    perPage = 12,
    categoryId,
    categoryIds,
    search,
    brand,
    tag,
    sort = 'newest',
    featured,
    popular,
  } = opts;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      let query = supabase
        .from('products')
        .select('*, category:categories(*), product_images(*)', {
          count: 'exact',
        });

      if (categoryIds && categoryIds.length > 0) {
        query = query.in('category_id', categoryIds);
      } else if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (search && search.trim()) {
        query = query.textSearch('search_vector', search.trim(), {
          type: 'websearch',
          config: 'english',
        });
      }
      if (brand) query = query.eq('brand', brand);
      if (tag) query = query.contains('tags', [tag]);
      if (featured) query = query.eq('is_featured', true);
      if (popular) query = query.eq('is_popular', true);

      if (sort === 'name') {
        query = query.order('name', { ascending: true });
      } else if (sort === 'popular') {
        query = query.order('view_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (!cancelled && !error) {
        const sorted = (data as Product[]).map((p) => ({
          ...p,
          product_images: (p.product_images || []).sort(
            (a, b) => a.sort_order - b.sort_order,
          ),
        }));
        setProducts(sorted);
        setTotal(count || 0);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    page,
    perPage,
    categoryId,
    categoryIds?.join(','),
    search,
    brand,
    tag,
    sort,
    featured,
    popular,
  ]);

  return { products, total, loading };
}

export function useProduct(slug: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!slug) {
      setProduct(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*), product_images(*)')
        .eq('slug', slug)
        .maybeSingle();
      if (!cancelled && !error) {
        if (data) {
          const p = data as Product;
          p.product_images = (p.product_images || []).sort(
            (a, b) => a.sort_order - b.sort_order,
          );
          setProduct(p);
          supabase
            .from('products')
            .update({ view_count: (p.view_count || 0) + 1 })
            .eq('id', p.id)
            .then(() => {});
        } else {
          setProduct(null);
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { product, loading };
}

export function useAllBrands() {
  const [brands, setBrands] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('brand')
        .not('brand', 'is', null);
      if (!error && data) {
        const unique = [...new Set(data.map((d) => d.brand).filter(Boolean))] as string[];
        setBrands(unique.sort());
      }
    })();
  }, []);
  return brands;
}

export function useAllTags() {
  const [tags, setTags] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('products').select('tags');
      if (!error && data) {
        const all = data.flatMap((d) => d.tags || []);
        setTags([...new Set(all)].sort());
      }
    })();
  }, []);
  return tags;
}

export function useCategoryBySlug(slug: string | null) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    if (!slug) {
      setCategory(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (!cancelled && !error) setCategory(data as Category);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return { category, loading };
}

export function useProductCountsByCategory() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category_id');
      if (!error && data) {
        const map: Record<string, number> = {};
        data.forEach((d) => {
          if (d.category_id) map[d.category_id] = (map[d.category_id] || 0) + 1;
        });
        setCounts(map);
      }
    })();
  }, []);
  return counts;
}

export function useIncrementView() {
  return useCallback(async (productId: string, currentCount: number) => {
    await supabase
      .from('products')
      .update({ view_count: currentCount + 1 })
      .eq('id', productId);
  }, []);
}

export { supabase };
export type { ProductImage };
