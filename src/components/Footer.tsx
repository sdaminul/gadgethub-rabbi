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
    <footer className="bg-white text-ink-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Brand Logo" style={{ height: '40px', width: 'auto' }} />
            </Link>
            <p className="text-sm leading-relaxed text-ink-700">
              {settings?.tagline || '1000+ Premium Product Catalog'}
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
            <h3 className="font-display text-sm font-700 uppercase tracking-wider text-black mb-4">
              Categories
            </h3>
            <ul className="space-y-2">
              {tree.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="text-sm text-ink-700 hover:text-black transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-700 uppercase tracking-wider text-black mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-sm text-ink-700 hover:text-black transition-colors">All Products</Link></li>
              <li><Link to="/about" className="text-sm text-ink-700 hover:text-black transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-sm text-ink-700 hover:text-black transition-colors">Contact</Link></li>
              <li><Link to="/admin" className="text-sm text-ink-700 hover:text-black transition-colors">Admin Panel</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-700 uppercase tracking-wider text-black mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              {settings?.phone && (
                <li>
                  <a href={`tel:${settings.phone}`} className="flex items-center gap-3 text-sm text-ink-700 hover:text-black transition-colors">
                    <Phone size={16} className="text-brand-400" />
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings?.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-sm text-ink-700 hover:text-black transition-colors">
                    <Mail size={16} className="text-brand-400" />
                    {settings.email}
                  </a>
                </li>
              )}
              {settings?.address && (
                <li className="flex items-start gap-3 text-sm text-ink-700">
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

        <div className="mt-12 pt-8 border-t border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-ink-700">
            © {new Date().getFullYear()} {settings?.site_name || 'Lumiere'}. All rights reserved.
          </p>
          <p className="text-sm text-ink-700">Developed by <a href="https://codeamar.com" className="text-brand-700" target="_blank" rel="noopener noreferrer">CodeAmar.Com</a></p>
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
