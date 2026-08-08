import { useEffect, useState, useCallback } from 'react';

export type RouteParams = Record<string, string>;

export interface Route {
  path: string;
  params: RouteParams;
  query: URLSearchParams;
}

function parseHash(): Route {
  const hash = window.location.hash.slice(1) || '/';
  const [pathPart, queryPart] = hash.split('?');
  const path = pathPart || '/';
  const query = new URLSearchParams(queryPart || '');
  return { path, params: {}, query };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);

  return { route, navigate };
}

export function Link({
  to,
  children,
  className,
  onClick,
  style,
  title,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  title?: string;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = to;
    onClick?.();
  };
  return (
    <a href={`#${to}`} className={className} onClick={handleClick} style={style} title={title}>
      {children}
    </a>
  );
}
