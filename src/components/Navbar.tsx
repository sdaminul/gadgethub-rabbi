import { useState, useEffect, useRef } from 'react';
import { Link, useRouter } from '@/lib/router';
import { useCategories, useSettings } from '@/lib/hooks';
import { buildCategoryTree } from '@/lib/utils';
import type { CategoryTreeNode } from '@/lib/types';
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Phone,
  LayoutGrid,
  Info,
  Mail,
} from 'lucide-react';

export function Navbar() {
  const { route, navigate } = useRouter();
  const { categories } = useCategories();
  const { settings } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const tree = buildCategoryTree(categories);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [route.path]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue('');
    }
  };

  const isActive = (path: string) =>
    route.path === path || (path !== '/' && route.path.startsWith(path));

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-bootm border-gray-200 border-b`}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="font-display text-xl font-700 tracking-tight text-ink-900">
                <img src="/logo.png" alt="Brand Logo" style={{ height: '40px', width: 'auto' }} />
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              <NavItem to="/" active={route.path === '/'}>Home</NavItem>
              <CategoryDropdown tree={tree} />
              <NavItem to="/products" active={isActive('/products')}>All Products</NavItem>
              <NavItem to="/about" active={isActive('/about')}>About</NavItem>
              <NavItem to="/contact" active={isActive('/contact')}>Contact</NavItem>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSearchOpen((s) => !s);
                  setTimeout(() => searchRef.current?.focus(), 100);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 rounded-xl bg-ink-900 px-4 py-2 text-sm font-600 text-white hover:bg-ink-800 transition-colors"
              >
                Admin
              </Link>
              <button
                onClick={() => setMobileOpen((m) => !m)}
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-100 transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </nav>

        {searchOpen && (
          <div className="border-t border-ink-200/60 glass animate-fade-in">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
              <form onSubmit={handleSearch} className="relative">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search products, brands, models..."
                  className="w-full rounded-2xl border border-ink-200 bg-white/80 py-3.5 pl-12 pr-4 text-ink-900 placeholder-ink-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </form>
            </div>
          </div>
        )}

        {mobileOpen && (
          <div className="lg:hidden border-t border-ink-200/60 glass animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
              <MobileNavItem to="/" active={route.path === '/'}>Home</MobileNavItem>
              <MobileNavItem to="/products" active={isActive('/products')}>
                <LayoutGrid size={18} /> All Products
              </MobileNavItem>
              {tree.map((cat) => (
                <MobileCategoryItem key={cat.id} category={cat} />
              ))}
              <MobileNavItem to="/about" active={isActive('/about')}>
                <Info size={18} /> About
              </MobileNavItem>
              <MobileNavItem to="/contact" active={isActive('/contact')}>
                <Mail size={18} /> Contact
              </MobileNavItem>
              <MobileNavItem to="/admin" active={isActive('/admin')}>
                Admin Panel
              </MobileNavItem>
              {settings?.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center gap-2 px-4 py-3 text-ink-600"
                >
                  <Phone size={18} /> {settings.phone}
                </a>
              )}
            </div>
          </div>
        )}
      </header>
      <div className="h-16" />
    </>
  );
}

function NavItem({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`relative rounded-lg px-3.5 py-2 text-sm font-600 transition-colors ${
        active
          ? 'text-brand-600'
          : 'text-ink-600 hover:text-ink-900'
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-brand-500" />
      )}
    </Link>
  );
}

function CategoryDropdown({ tree }: { tree: CategoryTreeNode[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={`flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-600 transition-colors ${
          open ? 'text-brand-600' : 'text-ink-600 hover:text-ink-900'
        }`}
      >
        Categories
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full pt-2 w-64 animate-fade-in">
          <div className="rounded-2xl border border-ink-200/60 bg-white p-2 shadow-float">
            {tree.map((cat) => (
              <DropdownCategoryItem key={cat.id} category={cat} />
            ))}
            <Link
              to="/products"
              className="block rounded-xl px-3 py-2 text-sm font-600 text-brand-600 hover:bg-brand-50"
            >
              View All Products →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownCategoryItem({ category }: { category: CategoryTreeNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        to={`/category/${category.slug}`}
        className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-500 text-ink-700 hover:bg-brand-50 hover:text-brand-700"
      >
        <span className="truncate">{category.name}</span>
        {category.children.length > 0 && (
          <ChevronDown size={14} className={`transition-transform ${open ? '-rotate-90' : ''}`} />
        )}
      </Link>
      {open && category.children.length > 0 && (
        <div className="absolute left-full top-0 pt-2 w-56 animate-fade-in">
          <div className="rounded-2xl border border-ink-200/60 bg-white p-2 shadow-float">
            {category.children.map((child) => (
              <DropdownCategoryItem key={child.id} category={child} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileNavItem({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-600 transition-colors ${
        active ? 'bg-brand-50 text-brand-600' : 'text-ink-700 hover:bg-ink-100'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileCategoryItem({ category }: { category: CategoryTreeNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex items-center">
        <Link
          to={`/category/${category.slug}`}
          className="flex-1 px-4 py-3 text-sm font-600 text-ink-700 hover:bg-ink-100 rounded-l-xl"
        >
          {category.name}
        </Link>
        {category.children.length > 0 && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="px-3 py-3 text-ink-400"
          >
            <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      {open && category.children.length > 0 && (
        <div className="ml-4 border-l border-ink-200 pl-2">
          {category.children.map((child) => (
            <MobileCategoryItem key={child.id} category={child} />
          ))}
        </div>
      )}
    </div>
  );
}
