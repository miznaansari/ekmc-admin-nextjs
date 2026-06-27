"use client";

if (typeof window === 'undefined') {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };
}

import React, { useEffect } from 'react';
import { useRouter, usePathname, useParams as useNextParams, useSearchParams as useNextSearchParams } from 'next/navigation';
import NextLink from 'next/link';

export function useNavigate() {
  const router = useRouter();
  return (to, options) => {
    if (typeof to === 'number') {
      if (to < 0) {
        router.back();
      } else {
        router.forward();
      }
    } else {
      const path = typeof to === 'string' ? to : to.pathname;
      if (options?.replace) {
        router.replace(path);
      } else {
        router.push(path);
      }
    }
  };
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  return {
    pathname: pathname || '',
    search: searchParams ? `?${searchParams.toString()}` : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    state: {},
  };
}

export function useSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useNextSearchParams();

  const searchParams = React.useMemo(() => {
    return new URLSearchParams(nextSearchParams ? nextSearchParams.toString() : '');
  }, [nextSearchParams]);

  const setSearchParams = (newParams, navigateOptions) => {
    const params = new URLSearchParams(
      typeof newParams === 'function' ? newParams(searchParams) : newParams
    );
    const queryString = params.toString();
    const newUrl = `${pathname}${queryString ? `?${queryString}` : ''}`;
    
    if (navigateOptions?.replace) {
      router.replace(newUrl);
    } else {
      router.push(newUrl);
    }
  };

  return [searchParams, setSearchParams];
}

export function useParams() {
  return useNextParams() || {};
}

export const Link = React.forwardRef(({ to, href, replace, ...props }, ref) => {
  const targetHref = to || href || '#';
  return <NextLink ref={ref} href={targetHref} replace={replace} {...props} />;
});
Link.displayName = 'Link';

export function Navigate({ to, replace }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router, to, replace]);
  return null;
}

export function Outlet() {
  return null;
}

export function BrowserRouter({ children }) {
  return <>{children}</>;
}

export function HashRouter({ children }) {
  return <>{children}</>;
}

export function Routes({ children }) {
  return <>{children}</>;
}

export function Route({ children }) {
  return <>{children}</>;
}

const compat = {
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Link,
  Navigate,
  Outlet,
  BrowserRouter,
  HashRouter,
  Routes,
  Route
};

export default compat;
