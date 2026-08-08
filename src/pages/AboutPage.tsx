import { useSettings } from '@/lib/hooks';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Sparkles, Target, Eye, Heart, Users, Award } from 'lucide-react';

export function AboutPage() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-ink-50 animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: 'About' }]} />

        <div className="mt-8 rounded-3xl overflow-hidden relative bg-ink-950 aspect-[21/9]">
          {settings?.about_banner_url ? (
            <img
              src={settings.about_banner_url}
              alt="About us"
              className="absolute inset-0 h-full w-full object-cover opacity-50"
            />
          ) : (
            <div className="absolute inset-0 gradient-mesh" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-16 w-16 rounded-2xl mb-4" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white font-bold text-2xl mb-4">
                {settings?.site_name?.[0] || 'L'}
              </div>
            )}
            <h1 className="font-display text-3xl sm:text-5xl font-800 text-white">
              {settings?.about_title || 'About Us'}
            </h1>
            <p className="mt-3 text-lg text-ink-300 max-w-2xl">
              {settings?.tagline || 'Premium Product Catalog'}
            </p>
          </div>
        </div>

        <div className="mt-12 max-w-3xl">
          <div className="flex items-center gap-2 text-brand-600 mb-3">
            <Sparkles size={18} />
            <span className="text-sm font-700 uppercase tracking-wider">Our Story</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-700 text-ink-900">
            {settings?.site_name || 'Lumiere'}
          </h2>
          <p className="mt-4 text-lg text-ink-600 leading-relaxed">
            {settings?.about_description ||
              'We are a curated product catalog showcasing premium products across multiple categories. We present products with rich detail, specifications, and imagery so you can explore and discover with confidence.'}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ValueCard
            icon={<Target size={24} />}
            title="Our Mission"
            description="To provide a comprehensive, beautifully presented catalog that helps you discover and understand products in detail."
          />
          <ValueCard
            icon={<Eye size={24} />}
            title="Our Vision"
            description="To be the most trusted and elegant product catalog platform, setting the standard for product presentation."
          />
          <ValueCard
            icon={<Heart size={24} />}
            title="Our Values"
            description="Quality, transparency, and attention to detail in everything we present to you."
          />
          <ValueCard
            icon={<Award size={24} />}
            title="Excellence"
            description="We curate every product with care, ensuring rich specifications and premium imagery."
          />
        </div>

        <div className="mt-16 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 sm:p-12 text-center text-white">
          <Users size={32} className="mx-auto mb-4" />
          <h2 className="font-display text-2xl sm:text-3xl font-700">
            Explore Our Catalog
          </h2>
          <p className="mt-2 text-brand-100 max-w-xl mx-auto">
            Browse thousands of premium products with detailed specifications and rich imagery.
          </p>
          <a
            href="#/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-700 text-brand-700 hover:bg-brand-50 transition-colors"
          >
            Browse Products
          </a>
        </div>
      </div>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-200/60 bg-white p-6 shadow-card hover:shadow-float transition-shadow">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-700 text-ink-900">{title}</h3>
      <p className="mt-2 text-sm text-ink-500 leading-relaxed">{description}</p>
    </div>
  );
}
