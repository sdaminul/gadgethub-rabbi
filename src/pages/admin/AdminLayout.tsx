import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Link, useRouter } from '@/lib/router';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

export function AdminLayout({ children, active }: { children: React.ReactNode; active: string }) {
  const { signOut, user } = useAuth();
  const { navigate } = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, to: '/admin' },
    { id: 'products', label: 'Products', icon: <Package size={20} />, to: '/admin/products' },
    { id: 'categories', label: 'Categories', icon: <FolderTree size={20} />, to: '/admin/categories' },
    { id: 'featured', label: 'Featured', icon: <Sparkles size={20} />, to: '/admin/featured' },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, to: '/admin/settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-ink-100 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-ink-950 text-ink-300 flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-ink-800">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white font-bold">
              L
            </div>
            <span className="font-display text-lg font-700 text-white">Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-ink-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-600 transition-colors ${
                active === item.id
                  ? 'bg-brand-600 text-white'
                  : 'text-ink-400 hover:bg-ink-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-ink-800 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-600 text-ink-400 hover:bg-ink-800 hover:text-white transition-colors"
          >
            <ExternalLink size={20} />
            View Website
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-600 text-error hover:bg-error/10 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 glass border-b border-ink-200/60 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100"
            >
              <Menu size={20} />
            </button>
            <span className="font-display text-lg font-700 text-ink-900 capitalize">
              {active === 'dashboard' ? 'Dashboard' : active}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-ink-500">Signed in as</div>
              <div className="text-sm font-600 text-ink-900 truncate max-w-[200px]">
                {user?.email}
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white font-700 text-sm">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export { ArrowLeft };
