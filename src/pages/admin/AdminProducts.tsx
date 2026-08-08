import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from './AdminLayout';
import { Link, useRouter } from '@/lib/router';
import { useCategories } from '@/lib/hooks';
import { slugify, uploadImage, uploadPdf, formatDate } from '@/lib/utils';
import type { Product, Category, Specification, ProductImage } from '@/lib/types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Upload,
  FileText,
  Star,
  Package,
  AlertCircle,
  Image as ImageIcon,
  GripVertical,
  Eye,
} from 'lucide-react';

export function AdminProducts() {
  const { route, navigate } = useRouter();
  const editId = route.query.get('edit');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*, category:categories(*), product_images(*)')
      .order('created_at', { ascending: false });
    if (search.trim()) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`);
    }
    const { data } = await query;
    setProducts((data as Product[]) || []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (editId) {
      (async () => {
        const { data } = await supabase
          .from('products')
          .select('*, category:categories(*), product_images(*)')
          .eq('id', editId)
          .maybeSingle();
        if (data) {
          const p = data as Product;
          p.product_images = (p.product_images || []).sort((a, b) => a.sort_order - b.sort_order);
          setEditingProduct(p);
          setShowForm(true);
        }
      })();
    }
  }, [editId]);

  const handleNew = () => {
    setEditingProduct(null);
    setShowForm(true);
    navigate('/admin/products');
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    await supabase.from('products').delete().eq('id', product.id);
    loadProducts();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    navigate('/admin/products');
    loadProducts();
  };

  if (showForm) {
    return <ProductForm product={editingProduct} onClose={handleFormClose} />;
  }

  return (
    <AdminLayout active="products">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-700 text-ink-900">Products</h1>
          <p className="mt-1 text-ink-500">{products.length} products in your catalog</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-600 text-white hover:bg-brand-500 transition-colors"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="mb-6 relative max-w-md">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name, brand, model..."
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
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package size={48} className="text-ink-300" />
            <h3 className="mt-4 font-display text-lg font-700 text-ink-900">No products yet</h3>
            <p className="mt-2 text-sm text-ink-500">Get started by adding your first product.</p>
            <button
              onClick={handleNew}
              className="mt-4 flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-600 text-white hover:bg-brand-500"
            >
              <Plus size={16} /> Add Product
            </button>
          </div>
        ) : (
          <div className="divide-y divide-ink-100">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-ink-50/50 transition-colors">
                <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-ink-100">
                  {p.product_images?.[0] ? (
                    <img src={p.product_images[0].image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-300">
                      <ImageIcon size={20} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-600 text-ink-900">{p.name}</span>
                    {p.is_featured && <Star size={14} className="text-accent-500 fill-accent-500 shrink-0" />}
                  </div>
                  <div className="text-xs text-ink-500 truncate">
                    {p.brand || 'No brand'} · {p.category?.name || 'Uncategorized'} · {formatDate(p.updated_at)}
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-600 ${
                  p.status === 'available' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}>
                  {p.status === 'available' ? 'Available' : 'Out'}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    to={`/product/${p.slug}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
                    title="View"
                  >
                    <Eye size={16} />
                  </Link>
                  <button
                    onClick={() => handleEdit(p)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-600 hover:bg-brand-50"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-error hover:bg-error/10"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function ProductForm({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { categories } = useCategories();
  const flatCats = categories as Category[];
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [form, setForm] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    model: product?.model || '',
    category_id: product?.category_id || '',
    short_description: product?.short_description || '',
    full_description: product?.full_description || '',
    status: product?.status || 'available',
    is_featured: product?.is_featured || false,
    is_popular: product?.is_popular || false,
    tags: product?.tags?.join(', ') || '',
    brochure_url: product?.brochure_url || '',
    wholesale_price: product?.wholesale_price?.toString() || '',
    customer_price: product?.customer_price?.toString() || '',
    total_stock: product?.total_stock?.toString() || '',
  });
  const [specifications, setSpecifications] = useState<Specification[]>(
    product?.specifications || [],
  );
  const [features, setFeatures] = useState<string[]>(product?.features || []);
  const [images, setImages] = useState<ProductImage[]>(product?.product_images || []);
  const [newFeature, setNewFeature] = useState('');

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    setError(null);
    try {
      const uploaded: ProductImage[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadImage(file);
        uploaded.push({
          id: `temp-${Date.now()}-${Math.random()}`,
          product_id: product?.id || '',
          image_url: url,
          sort_order: images.length + uploaded.length,
          created_at: new Date().toISOString(),
        });
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (e: any) {
      setError(e.message);
    }
    setUploadingImages(false);
  };

  const handlePdfUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingPdf(true);
    setError(null);
    try {
      const url = await uploadPdf(file);
      setForm((f) => ({ ...f, brochure_url: url }));
    } catch (e: any) {
      setError(e.message);
    }
    setUploadingPdf(false);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx).map((img, i) => ({ ...img, sort_order: i })));
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((img, i) => ({ ...img, sort_order: i }));
    });
  };

  const addSpec = () => setSpecifications((s) => [...s, { label: '', value: '' }]);
  const updateSpec = (i: number, field: 'label' | 'value', val: string) =>
    setSpecifications((s) => s.map((sp, idx) => (idx === i ? { ...sp, [field]: val } : sp)));
  const removeSpec = (i: number) => setSpecifications((s) => s.filter((_, idx) => idx !== i));

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures((f) => [...f, newFeature.trim()]);
      setNewFeature('');
    }
  };
  const removeFeature = (i: number) => setFeatures((f) => f.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Product name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const slug = slugify(form.name) + '-' + Math.random().toString(36).slice(2, 6);
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const payload = {
        name: form.name.trim(),
        slug,
        brand: form.brand || null,
        model: form.model || null,
        category_id: form.category_id || null,
        short_description: form.short_description || null,
        full_description: form.full_description || null,
        specifications: specifications.filter((s) => s.label && s.value),
        features,
        tags,
        brochure_url: form.brochure_url || null,
        wholesale_price: form.wholesale_price ? parseFloat(form.wholesale_price) : null,
        customer_price: form.customer_price ? parseFloat(form.customer_price) : null,
        total_stock: form.total_stock ? parseInt(form.total_stock, 10) : 0,
        status: form.status,
        is_featured: form.is_featured,
        is_popular: form.is_popular,
      };

      let productId = product?.id;
      if (product) {
        const { error: e } = await supabase.from('products').update(payload).eq('id', product.id);
        if (e) throw new Error(e.message);
        await supabase.from('product_images').delete().eq('product_id', product.id);
      } else {
        const { data, error: e } = await supabase.from('products').insert(payload).select().single();
        if (e) throw new Error(e.message);
        productId = data.id;
      }

      if (productId && images.length > 0) {
        const imgInserts = images.map((img, i) => ({
          product_id: productId,
          image_url: img.image_url,
          sort_order: i,
        }));
        const { error: imgErr } = await supabase.from('product_images').insert(imgInserts);
        if (imgErr) throw new Error(imgErr.message);
      }

      onClose();
    } catch (e: any) {
      setError(e.message);
    }
    setSaving(false);
  };

  return (
    <AdminLayout active="products">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button onClick={onClose} className="text-sm text-ink-500 hover:text-ink-900 mb-2 flex items-center gap-1">
            ← Back to Products
          </button>
          <h1 className="font-display text-2xl font-700 text-ink-900">
            {product ? 'Edit Product' : 'Add Product'}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-600 text-ink-700 hover:bg-ink-100"
          >
            <X size={16} /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-600 text-white hover:bg-brand-500 disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {product ? 'Update' : 'Create'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FormSection title="Basic Information">
            <Field label="Product Name *">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Brand">
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Model">
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Category">
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className={inputClass}
              >
                <option value="">Uncategorized</option>
                {flatCats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parent_id ? '— ' : ''}{c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Short Description">
              <textarea
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                rows={2}
                className={inputClass}
              />
            </Field>
            <Field label="Full Description">
              <textarea
                value={form.full_description}
                onChange={(e) => setForm({ ...form, full_description: e.target.value })}
                rows={5}
                className={inputClass}
              />
            </Field>
          </FormSection>

          <FormSection title="Product Images">
            <div className="space-y-3">
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 bg-ink-50 p-8 cursor-pointer hover:border-brand-400 transition-colors">
                <Upload size={24} className="text-ink-400" />
                <span className="mt-2 text-sm font-600 text-ink-700">
                  {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                </span>
                <span className="text-xs text-ink-400">Multiple images supported</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files)}
                />
              </label>
              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-ink-200">
                      <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-ink-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <button
                          onClick={() => moveImage(i, -1)}
                          disabled={i === 0}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-ink-900 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveImage(i, 1)}
                          disabled={i === images.length - 1}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-ink-900 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeImage(i)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-error text-white"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {i === 0 && (
                        <span className="absolute top-1 left-1 rounded bg-brand-600 px-1.5 py-0.5 text-xs font-600 text-white">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormSection>

          <FormSection title="Specifications">
            <div className="space-y-2">
              {specifications.map((spec, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Label (e.g. Weight)"
                    value={spec.label}
                    onChange={(e) => updateSpec(i, 'label', e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 1.5 kg)"
                    value={spec.value}
                    onChange={(e) => updateSpec(i, 'value', e.target.value)}
                    className={inputClass}
                  />
                  <button
                    onClick={() => removeSpec(i)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-error hover:bg-error/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={addSpec}
                className="flex items-center gap-2 text-sm font-600 text-brand-600 hover:text-brand-700"
              >
                <Plus size={16} /> Add Specification
              </button>
            </div>
          </FormSection>

          <FormSection title="Features">
            <div className="space-y-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2">
                  <span className="flex-1 text-sm text-ink-700">{f}</span>
                  <button
                    onClick={() => removeFeature(i)}
                    className="text-error hover:bg-error/10 rounded-lg p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="Add a feature..."
                  className={inputClass}
                />
                <button
                  onClick={addFeature}
                  className="flex items-center gap-1 rounded-xl bg-ink-100 px-4 text-sm font-600 text-ink-700 hover:bg-ink-200"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
          </FormSection>
        </div>

        <div className="space-y-6">
          <FormSection title="Status & Flags">
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className={inputClass}
              >
                <option value="available">Available</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </Field>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="h-5 w-5 rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-600 text-ink-700 flex items-center gap-1.5">
                <Star size={16} className="text-accent-500" /> Featured on homepage
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_popular}
                onChange={(e) => setForm({ ...form, is_popular: e.target.checked })}
                className="h-5 w-5 rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-600 text-ink-700">Show as Popular</span>
            </label>
          </FormSection>

          <FormSection title="Pricing & Stock">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Customer Price ($)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.customer_price}
                  onChange={(e) => setForm({ ...form, customer_price: e.target.value })}
                  placeholder="0.00"
                  className={inputClass}
                />
              </Field>
              <Field label="Wholesale Price ($)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.wholesale_price}
                  onChange={(e) => setForm({ ...form, wholesale_price: e.target.value })}
                  placeholder="0.00"
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Total Stock">
              <input
                type="number"
                min="0"
                step="1"
                value={form.total_stock}
                onChange={(e) => setForm({ ...form, total_stock: e.target.value })}
                placeholder="0"
                className={inputClass}
              />
            </Field>
          </FormSection>

          <FormSection title="Tags">
            <Field label="Tags (comma-separated)">
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="wireless, premium, portable"
                className={inputClass}
              />
            </Field>
          </FormSection>

          <FormSection title="PDF Brochure">
            <div className="space-y-3">
              {form.brochure_url && (
                <div className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2.5">
                  <FileText size={18} className="text-success" />
                  <span className="flex-1 text-sm font-600 text-success truncate">Brochure uploaded</span>
                  <button
                    onClick={() => setForm({ ...form, brochure_url: '' })}
                    className="text-error hover:bg-error/10 rounded p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 bg-ink-50 p-6 cursor-pointer hover:border-brand-400 transition-colors">
                <FileText size={20} className="text-ink-400" />
                <span className="mt-2 text-sm font-600 text-ink-700">
                  {uploadingPdf ? 'Uploading...' : 'Upload PDF brochure'}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => handlePdfUpload(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </FormSection>
        </div>
      </div>
    </AdminLayout>
  );
}

const inputClass =
  'w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-200/60 bg-white p-6 shadow-card">
      <h2 className="font-display text-lg font-700 text-ink-900 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-600 text-ink-700 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
