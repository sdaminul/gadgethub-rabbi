import { useState } from 'react';
import { Link, useRouter } from '@/lib/router';
import {
  useProduct,
  useProducts,
  useCategories,
} from '@/lib/hooks';
import { getDescendantCategoryIds, getCategoryPath, formatDate, formatPrice, shareUrl } from '@/lib/utils';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductCard } from '@/components/ProductCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StatusBadge } from '@/components/ProductCard';
import {
  CheckCircle2,
  XCircle,
  Tag,
  Building2,
  Box,
  Calendar,
  FileText,
  Share2,
  MessageCircle,
  Link2,
  Package,
  ListChecks,
} from 'lucide-react';
import { FacebookIcon, TwitterIcon, LinkedinIcon } from '@/components/SocialIcons';

export function ProductDetailPage({ slug }: { slug: string }) {
  const { product, loading } = useProduct(slug);
  const { categories } = useCategories();
  const { navigate } = useRouter();
  const [copied, setCopied] = useState(false);

  const categoryId = product?.category_id || null;
  const { products: related } = useProducts({
    categoryId: categoryId,
    perPage: 4,
    sort: 'newest',
  });

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="aspect-square rounded-2xl skeleton" />
          <div className="space-y-4">
            <div className="h-4 w-24 skeleton rounded" />
            <div className="h-8 w-full skeleton rounded" />
            <div className="h-4 w-2/3 skeleton rounded" />
            <div className="h-32 w-full skeleton rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <Package size={56} className="mx-auto text-ink-300" />
        <h1 className="mt-6 font-display text-2xl font-700 text-ink-900">Product not found</h1>
        <p className="mt-2 text-ink-500">The product you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-600 text-white hover:bg-brand-500"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const categoryPath = getCategoryPath(product.category_id, categories);
  const images = product.product_images?.map((img) => img.image_url) || [];
  const currentUrl = window.location.href;
  const relatedFiltered = (related || []).filter((p) => p.id !== product.id).slice(0, 4);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-ink-50 animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: 'Products', to: '/products' },
            ...categoryPath.map((c) => ({ label: c.name, to: `/category/${c.slug}` })),
            { label: product.name },
          ]}
        />

        <div className="mt-8 grid lg:grid-cols-2 gap-8 lg:gap-12">
          <ProductGallery images={images} productName={product.name} />

          <div className="space-y-6">
            <div>
              {product.brand && (
                <span className="text-sm font-700 uppercase tracking-wider text-brand-600">
                  {product.brand}
                </span>
              )}
              <h1 className="mt-1 font-display text-3xl sm:text-4xl font-800 text-ink-900 leading-tight">
                {product.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <StatusBadge status={product.status} />
                {product.model && (
                  <span className="rounded-lg bg-ink-100 px-3 py-1 text-sm font-600 text-ink-700">
                    Model: {product.model}
                  </span>
                )}
              </div>
            </div>

            {product.short_description && (
              <p className="text-lg text-ink-600 leading-relaxed">
                {product.short_description}
              </p>
            )}

            {(product.customer_price != null || product.wholesale_price != null) && (
              <div className="grid grid-cols-2 gap-3">
                {product.customer_price != null && (
                  <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
                    <div className="text-xs font-600 uppercase tracking-wider text-ink-500">Customer Price</div>
                    <div className="mt-1 font-display text-2xl font-800 text-ink-900">
                      {formatPrice(product.customer_price)}
                    </div>
                  </div>
                )}
                {product.wholesale_price != null && (
                  <div className="rounded-xl border border-ink-200 bg-white p-4">
                    <div className="text-xs font-600 uppercase tracking-wider text-ink-500">Wholesale Price</div>
                    <div className="mt-1 font-display text-2xl font-800 text-brand-600">
                      {formatPrice(product.wholesale_price)}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {product.brand && (
                <InfoRow icon={<Building2 size={16} />} label="Brand" value={product.brand} />
              )}
              {product.model && (
                <InfoRow icon={<Box size={16} />} label="Model" value={product.model} />
              )}
              {product.category && (
                <Link
                  to={`/category/${product.category.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3 hover:border-brand-300 transition-colors"
                >
                  <Tag size={16} className="text-brand-600" />
                  <div className="min-w-0">
                    <div className="text-xs text-ink-400">Category</div>
                    <div className="truncate text-sm font-600 text-ink-900">{product.category.name}</div>
                  </div>
                </Link>
              )}
              <InfoRow
                icon={<Calendar size={16} />}
                label="Updated"
                value={formatDate(product.updated_at)}
              />
            </div>

            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/products?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-ink-100 px-3 py-1.5 text-xs font-600 text-ink-600 hover:bg-brand-100 hover:text-brand-700 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="flex items-center gap-2 text-sm font-600 text-ink-700">
                <Share2 size={16} /> Share:
              </span>
              <ShareButton
                href={shareUrl('facebook', currentUrl, product.name)}
                icon={<FacebookIcon size={16} />}
                label="Facebook"
              />
              <ShareButton
                href={shareUrl('twitter', currentUrl, product.name)}
                icon={<TwitterIcon size={16} />}
                label="Twitter"
              />
              <ShareButton
                href={shareUrl('linkedin', currentUrl, product.name)}
                icon={<LinkedinIcon size={16} />}
                label="LinkedIn"
              />
              <ShareButton
                href={shareUrl('whatsapp', currentUrl, product.name)}
                icon={<MessageCircle size={16} />}
                label="WhatsApp"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-600 text-ink-700 hover:bg-ink-100 transition-colors"
              >
                <Link2 size={16} /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {product.brochure_url && (
              <a
                href={product.brochure_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-700 text-white hover:bg-accent-600 transition-colors"
              >
                <FileText size={18} /> Download Brochure (PDF)
              </a>
            )}
          </div>
        </div>

        <div className="mt-16 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {product.full_description && (
              <Section title="Description" icon={<FileText size={18} />}>
                <div className="prose prose-ink max-w-none">
                  <p className="text-ink-600 leading-relaxed whitespace-pre-line">
                    {product.full_description}
                  </p>
                </div>
              </Section>
            )}

            {product.features.length > 0 && (
              <Section title="Features" icon={<ListChecks size={18} />}>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {product.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-ink-200/60 bg-white p-4"
                    >
                      <CheckCircle2 size={18} className="text-success mt-0.5 shrink-0" />
                      <span className="text-sm text-ink-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {product.specifications.length > 0 && (
              <Section title="Specifications" icon={<Box size={18} />}>
                <div className="overflow-hidden rounded-2xl border border-ink-200/60 bg-white">
                  <table className="w-full text-sm">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr
                          key={i}
                          className={i % 2 === 0 ? 'bg-white' : 'bg-ink-50/50'}
                        >
                          <td className="px-4 py-3 font-600 text-ink-700 w-1/3 border-b border-ink-100">
                            {spec.label}
                          </td>
                          <td className="px-4 py-3 text-ink-600 border-b border-ink-100">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-ink-200/60 bg-white p-6 shadow-card lg:sticky lg:top-24">
              <h3 className="font-display text-lg font-700 text-ink-900">Quick Info</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">Status</dt>
                  <dd>
                    <StatusBadge status={product.status} />
                  </dd>
                </div>
                {product.brand && (
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500">Brand</dt>
                    <dd className="font-600 text-ink-900">{product.brand}</dd>
                  </div>
                )}
                {product.model && (
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500">Model</dt>
                    <dd className="font-600 text-ink-900">{product.model}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">Views</dt>
                  <dd className="font-600 text-ink-900">{product.view_count}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">Total Stock</dt>
                  <dd className="font-600 text-ink-900">{product.total_stock}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">Added</dt>
                  <dd className="font-600 text-ink-900">{formatDate(product.created_at)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">Updated</dt>
                  <dd className="font-600 text-ink-900">{formatDate(product.updated_at)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {relatedFiltered.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl font-700 text-ink-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedFiltered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3">
      <div className="text-brand-600">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs text-ink-400">{label}</div>
        <div className="truncate text-sm font-600 text-ink-900">{value}</div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-ink-200/60 bg-white p-6 shadow-card">
      <h2 className="flex items-center gap-2 font-display text-xl font-700 text-ink-900 mb-4">
        <span className="text-brand-600">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function ShareButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-600 text-ink-700 hover:bg-ink-100 transition-colors"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}
