export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Specification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  model: string | null;
  category_id: string | null;
  short_description: string | null;
  full_description: string | null;
  specifications: Specification[];
  features: string[];
  tags: string[];
  brochure_url: string | null;
  wholesale_price: number | null;
  customer_price: number | null;
  total_stock: number;
  status: 'available' | 'out_of_stock';
  is_featured: boolean;
  is_popular: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  product_images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  tagline: string | null;
  about_title: string | null;
  about_description: string | null;
  about_banner_url: string | null;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  address: string | null;
  map_embed_url: string | null;
  updated_at: string;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  product_count?: number;
}
