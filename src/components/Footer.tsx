import { Link } from '@/lib/router';
import { useSettings, useCategories } from '@/lib/hooks';
import { buildCategoryTree } from '@/lib/utils';
import { Phone, Mail, MapPin, MessageCircle, ArrowUpRight } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TwitterIcon, LinkedinIcon } from '@/components/SocialIcons';

export function Footer() {
  const { settings } = useSettings();
  const { categories } = useCategories();
  const tree = buildCategoryTree(categories).slice(0, 6);

  return (
    <footer className="bg-ink-950 text-ink-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white font-bold text-lg">
                L
              </div>
              <span className="font-display text-xl font-700 text-white">
                {settings?.site_name || 'Lumiere'}
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-ink-400">
              {settings?.tagline || 'Premium Product Catalog'}
            </p>
            <div className="flex gap-2 pt-2">
              {settings?.facebook_url && (
                <SocialLink href={settings.facebook_url} icon={<FacebookIcon size={18} />} />
              )}
              {settings?.instagram_url && (
                <SocialLink href={settings.instagram_url} icon={<InstagramIcon size={18} />} />
              )}
              {settings?.twitter_url && (
                <SocialLink href={settings.twitter_url} icon={<TwitterIcon size={18} />} />
              )}
              {settings?.linkedin_url && (
                <SocialLink href={settings.linkedin_url} icon={<LinkedinIcon size={18} />} />
              )}
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-700 uppercase tracking-wider text-white mb-4">
              Categories
            </h3>
            <ul className="space-y-2">
              {tree.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="text-sm text-ink-400 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-700 uppercase tracking-wider text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-sm text-ink-400 hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/about" className="text-sm text-ink-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-sm text-ink-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/admin" className="text-sm text-ink-400 hover:text-white transition-colors">Admin Panel</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-700 uppercase tracking-wider text-white mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              {settings?.phone && (
                <li>
                  <a href={`tel:${settings.phone}`} className="flex items-center gap-3 text-sm text-ink-400 hover:text-white transition-colors">
                    <Phone size={16} className="text-brand-400" />
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings?.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-sm text-ink-400 hover:text-white transition-colors">
                    <Mail size={16} className="text-brand-400" />
                    {settings.email}
                  </a>
                </li>
              )}
              {settings?.address && (
                <li className="flex items-start gap-3 text-sm text-ink-400">
                  <MapPin size={16} className="text-brand-400 mt-0.5 shrink-0" />
                  {settings.address}
                </li>
              )}
              {settings?.whatsapp && (
                <li>
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-success/15 px-3 py-2 text-sm font-600 text-success hover:bg-success/25 transition-colors"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-ink-500">
            © {new Date().getFullYear()} {settings?.site_name || 'Lumiere'}. All rights reserved.
          </p>
          <p className="text-sm text-ink-500">Product Catalog — Not an online store</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-800 text-ink-300 hover:bg-brand-600 hover:text-white transition-all hover:scale-105"
    >
      {icon}
    </a>
  );
}

export { ArrowUpRight };
