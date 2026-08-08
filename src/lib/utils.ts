import type { Category, CategoryTreeNode } from './types';
import { supabase } from './supabase';

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  categories.forEach((c) => map.set(c.id, { ...c, children: [] }));

  categories.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortRecursive = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    nodes.forEach((n) => sortRecursive(n.children));
  };
  sortRecursive(roots);

  return roots;
}

export function getDescendantCategoryIds(
  categoryId: string,
  categories: Category[],
): string[] {
  const ids = [categoryId];
  const children = categories.filter((c) => c.parent_id === categoryId);
  children.forEach((child) => {
    ids.push(...getDescendantCategoryIds(child.id, categories));
  });
  return ids;
}

export function getCategoryPath(
  categoryId: string | null,
  categories: Category[],
): Category[] {
  if (!categoryId) return [];
  const path: Category[] = [];
  let current = categories.find((c) => c.id === categoryId);
  while (current) {
    path.unshift(current);
    current = current.parent_id
      ? categories.find((c) => c.id === current!.parent_id)
      : undefined;
  }
  return path;
}

export function getPublicImageUrl(path: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${path}`;
}

export async function uploadImage(
  file: File,
  folder: string = 'products',
): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { upsert: false });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  return getPublicImageUrl(`product-images/${fileName}`);
}

export async function uploadPdf(file: File): Promise<string> {
  const fileName = `brochures/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.pdf`;

  const { error } = await supabase.storage
    .from('product-brochures')
    .upload(fileName, file, { upsert: false });

  if (error) throw new Error(`PDF upload failed: ${error.message}`);

  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-brochures/${fileName}`;
}

export function shareUrl(platform: string, url: string, text: string): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case 'whatsapp':
      return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
    default:
      return url;
  }
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
