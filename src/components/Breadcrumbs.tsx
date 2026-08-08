import { Link } from '@/lib/router';
import { ChevronRight, Home } from 'lucide-react';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm overflow-x-auto scrollbar-hide">
      <Link
        to="/"
        className="flex items-center gap-1 text-ink-500 hover:text-brand-600 transition-colors shrink-0"
      >
        <Home size={14} />
        <span className="hidden sm:inline">Home</span>
      </Link>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5 shrink-0">
          <ChevronRight size={14} className="text-ink-400" />
          {item.to ? (
            <Link
              to={item.to}
              className="text-ink-500 hover:text-brand-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-600 text-ink-900 truncate">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
