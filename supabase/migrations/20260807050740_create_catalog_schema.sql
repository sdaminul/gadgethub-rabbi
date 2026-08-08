/*
# Product Catalog Schema

Creates the full data model for a premium Product Catalog Website with an Admin Panel.

1. New Tables
- `categories`: Unlimited nested categories (self-referencing parent_id), with image_url, description, sort order.
- `products`: 1000+ product support with name, brand, model, descriptions, specs (JSONB), features (JSONB array), tags (text array), status, brochure url, featured flags, updated date.
- `product_images`: Multiple images per product with sort order (gallery).
- `site_settings`: Single-row key/value store for contact info, social links, about text.

2. Security
- Public read access on all catalog tables (anon + authenticated) so the storefront works without login.
- Write access (insert/update/delete) restricted to authenticated users (admins). The admin signs in via Supabase Auth, so `auth.uid()` is populated.
- Storage buckets `product-images` and `product-brochures` are public-read, authenticated-write.

3. Indexes
- products(category_id), products(brand), products(status), products(featured), products(created_at) for fast listing/filtering.
- categories(parent_id), categories(slug).
- product_images(product_id).
- GIN index on products.tags for tag filtering.
- Full-text search vector on name, brand, model, short_description.
- trigram index on name for fuzzy search.

4. Notes
- `specifications` stored as JSONB array of {label, value} pairs.
- `features` stored as JSONB array of strings.
- `tags` is a text[] array with GIN index for fast filtering.
- `is_featured` and `is_popular` boolean flags drive homepage sections.
- `sort_order` on categories and product_images for manual ordering.
*/

-- Enable extensions first (needed for trigram + fts indexes)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- CATEGORIES (unlimited nesting via parent_id)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  description text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  brand text,
  model text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  short_description text,
  full_description text,
  specifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags text[] NOT NULL DEFAULT '{}',
  brochure_url text,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','out_of_stock')),
  is_featured boolean NOT NULL DEFAULT false,
  is_popular boolean NOT NULL DEFAULT false,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_popular ON products(is_popular);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);

-- Full-text search support
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(brand, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(model, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(short_description, '')), 'D')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN (search_vector);

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- PRODUCT IMAGES (gallery, multiple per product)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort ON product_images(product_id, sort_order);

DROP POLICY IF EXISTS "public_read_product_images" ON product_images;
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_product_images" ON product_images;
CREATE POLICY "admin_insert_product_images" ON product_images FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_product_images" ON product_images;
CREATE POLICY "admin_update_product_images" ON product_images FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_product_images" ON product_images;
CREATE POLICY "admin_delete_product_images" ON product_images FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- SITE SETTINGS (single-row: contact, social, about)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Lumiere',
  tagline text,
  about_title text,
  about_description text,
  about_banner_url text,
  logo_url text,
  phone text,
  whatsapp text,
  email text,
  facebook_url text,
  instagram_url text,
  twitter_url text,
  linkedin_url text,
  address text,
  map_embed_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_settings" ON site_settings;
CREATE POLICY "public_read_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_settings" ON site_settings;
CREATE POLICY "admin_update_settings" ON site_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_insert_settings" ON site_settings;
CREATE POLICY "admin_insert_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (true);

-- ============================================================
-- updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_settings_updated_at ON site_settings;
CREATE TRIGGER trg_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Storage buckets
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-brochures', 'product-brochures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, authenticated write
DROP POLICY IF EXISTS "public_read_product_images_bucket" ON storage.objects;
CREATE POLICY "public_read_product_images_bucket" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('product-images', 'product-brochures'));

DROP POLICY IF EXISTS "admin_write_product_images_bucket" ON storage.objects;
CREATE POLICY "admin_write_product_images_bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('product-images', 'product-brochures'));

DROP POLICY IF EXISTS "admin_update_product_images_bucket" ON storage.objects;
CREATE POLICY "admin_update_product_images_bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id IN ('product-images', 'product-brochures'));

DROP POLICY IF EXISTS "admin_delete_product_images_bucket" ON storage.objects;
CREATE POLICY "admin_delete_product_images_bucket" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id IN ('product-images', 'product-brochures'));

-- ============================================================
-- Seed default settings row
-- ============================================================
INSERT INTO site_settings (site_name, tagline, about_title, about_description, phone, whatsapp, email, facebook_url, address)
VALUES (
  'Lumiere',
  'Premium Product Catalog',
  'About Lumiere',
  'Lumiere is a curated product catalog showcasing premium products across multiple categories. We present products with rich detail, specifications, and imagery so you can explore and discover with confidence.',
  '+1 (555) 123-4567',
  '+15551234567',
  'hello@lumiere.example',
  'https://facebook.com',
  '123 Market Street, San Francisco, CA'
)
ON CONFLICT DO NOTHING;
