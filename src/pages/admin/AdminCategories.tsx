import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from './AdminLayout';
import { buildCategoryTree, slugify, uploadImage } from '@/lib/utils';
import type { Category, CategoryTreeNode } from '@/lib/types';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Upload,
  FolderTree,
  AlertCircle,
  ChevronRight,
  Package,
} from 'lucide-react';

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order').order('name');
    setCategories((data as Category[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tree = buildCategoryTree(categories);

  const handleDelete = async (cat: Category) => {
    const children = categories.filter((c) => c.parent_id === cat.id);
    if (children.length > 0) {
      alert(`"${cat.name}" has subcategories. Please delete or move them first.`);
      return;
    }
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    await supabase.from('categories').delete().eq('id', cat.id);
    load();
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditing(null);
    load();
  };

  if (showForm) {
    return <CategoryForm category={editing} categories={categories} onClose={handleClose} />;
  }

  return (
    <AdminLayout active="categories">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-700 text-ink-900">Categories</h1>
          <p className="mt-1 text-ink-500">{categories.length} categories · unlimited nesting supported</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-600 text-white hover:bg-brand-500"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="rounded-2xl border border-ink-200/60 bg-white shadow-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 skeleton rounded-xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderTree size={48} className="text-ink-300" />
            <h3 className="mt-4 font-display text-lg font-700 text-ink-900">No categories yet</h3>
            <p className="mt-2 text-sm text-ink-500">Create your first category to organize products.</p>
            <button
              onClick={handleNew}
              className="mt-4 flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-600 text-white hover:bg-brand-500"
            >
              <Plus size={16} /> Add Category
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-1">
            {tree.map((node) => (
              <CategoryRow
                key={node.id}
                node={node}
                depth={0}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function CategoryRow({
  node,
  depth,
  onEdit,
  onDelete,
}: {
  node: CategoryTreeNode;
  depth: number;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  return (
    <>
      <div
        className="flex items-center gap-3 rounded-xl p-3 hover:bg-ink-50 transition-colors"
        style={{ paddingLeft: `${12 + depth * 24}px` }}
      >
        <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-ink-100">
          {node.image_url ? (
            <img src={node.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-300">
              <FolderTree size={18} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-600 text-ink-900 truncate">{node.name}</div>
          <div className="text-xs text-ink-500 truncate">
            {node.description || 'No description'} · /{node.slug}
          </div>
        </div>
        <span className="text-xs text-ink-400">Order: {node.sort_order}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(node)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-600 hover:bg-brand-50"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(node)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-error hover:bg-error/10"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {node.children.map((child) => (
        <CategoryRow
          key={child.id}
          node={child}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

function CategoryForm({
  category,
  categories,
  onClose,
}: {
  category: Category | null;
  categories: Category[];
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: category?.name || '',
    parent_id: category?.parent_id || '',
    description: category?.description || '',
    image_url: category?.image_url || '',
    sort_order: category?.sort_order ?? 0,
  });

  const otherCategories = categories.filter((c) => c.id !== category?.id);

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'categories');
      setForm((f) => ({ ...f, image_url: url }));
    } catch (e: any) {
      setError(e.message);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Category name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const slug = slugify(form.name) + '-' + Math.random().toString(36).slice(2, 5);
      const payload = {
        name: form.name.trim(),
        slug,
        parent_id: form.parent_id || null,
        description: form.description || null,
        image_url: form.image_url || null,
        sort_order: form.sort_order,
      };
      if (category) {
        const { error: e } = await supabase.from('categories').update(payload).eq('id', category.id);
        if (e) throw new Error(e.message);
      } else {
        const { error: e } = await supabase.from('categories').insert(payload);
        if (e) throw new Error(e.message);
      }
      onClose();
    } catch (e: any) {
      setError(e.message);
    }
    setSaving(false);
  };

  return (
    <AdminLayout active="categories">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button onClick={onClose} className="text-sm text-ink-500 hover:text-ink-900 mb-2">
            ← Back to Categories
          </button>
          <h1 className="font-display text-2xl font-700 text-ink-900">
            {category ? 'Edit Category' : 'Add Category'}
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
            {category ? 'Update' : 'Create'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="max-w-2xl rounded-2xl border border-ink-200/60 bg-white p-6 shadow-card space-y-4">
        <label className="block">
          <span className="block text-sm font-600 text-ink-700 mb-1.5">Category Name *</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="block text-sm font-600 text-ink-700 mb-1.5">Parent Category</span>
          <select
            value={form.parent_id}
            onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
            className={inputClass}
          >
            <option value="">None (top-level)</option>
            {otherCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-sm font-600 text-ink-700 mb-1.5">Description</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="block text-sm font-600 text-ink-700 mb-1.5">Sort Order</span>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
            className={inputClass}
          />
        </label>

        <div>
          <span className="block text-sm font-600 text-ink-700 mb-1.5">Category Image</span>
          {form.image_url ? (
            <div className="relative inline-block">
              <img src={form.image_url} alt="" className="h-32 w-48 rounded-xl object-cover border border-ink-200" />
              <button
                onClick={() => setForm({ ...form, image_url: '' })}
                className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-error text-white"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 bg-ink-50 p-8 cursor-pointer hover:border-brand-400 transition-colors w-48 h-32">
              <Upload size={20} className="text-ink-400" />
              <span className="mt-2 text-sm font-600 text-ink-700">
                {uploading ? 'Uploading...' : 'Upload image'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
              />
            </label>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

const inputClass =
  'w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';
