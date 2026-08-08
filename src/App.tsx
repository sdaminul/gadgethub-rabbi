import { AuthProvider, useAuth } from '@/lib/auth';
import { useRouter } from '@/lib/router';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CategoryPage } from '@/pages/CategoryPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { AdminLogin } from '@/pages/admin/AdminLogin';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminProducts } from '@/pages/admin/AdminProducts';
import { AdminCategories } from '@/pages/admin/AdminCategories';
import { AdminFeatured } from '@/pages/admin/AdminFeatured';
import { AdminSettings } from '@/pages/admin/AdminSettings';
import { Loader2 } from 'lucide-react';

function AppRoutes() {
  const { route } = useRouter();
  const { session, loading: authLoading } = useAuth();
  const path = route.path;

  // Admin routes — require auth (except login)
  if (path === '/admin' || path.startsWith('/admin/')) {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-ink-950">
          <Loader2 size={32} className="animate-spin text-brand-500" />
        </div>
      );
    }
    if (!session) {
      return <AdminLogin />;
    }

    if (path === '/admin' || path === '/admin/') return <AdminDashboard />;
    if (path === '/admin/products') return <AdminProducts />;
    if (path === '/admin/categories') return <AdminCategories />;
    if (path === '/admin/featured') return <AdminFeatured />;
    if (path === '/admin/settings') return <AdminSettings />;
    return <AdminDashboard />;
  }

  // Storefront routes
  const productMatch = path.match(/^\/product\/(.+)$/);
  const categoryMatch = path.match(/^\/category\/(.+)$/);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        {path === '/' && <HomePage />}
        {path === '/products' && <ProductsPage />}
        {productMatch && <ProductDetailPage slug={productMatch[1]} />}
        {categoryMatch && <CategoryPage slug={categoryMatch[1]} />}
        {path === '/about' && <AboutPage />}
        {path === '/contact' && <ContactPage />}
        {!(
          path === '/' ||
          path === '/products' ||
          productMatch ||
          categoryMatch ||
          path === '/about' ||
          path === '/contact'
        ) && <NotFound />}
      </div>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-32 text-center">
      <h1 className="font-display text-6xl font-800 text-ink-300">404</h1>
      <p className="mt-4 text-lg text-ink-500">Page not found</p>
      <a
        href="#/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-600 text-white hover:bg-brand-500"
      >
        Go Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
