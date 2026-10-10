'use client';

import { use } from 'react';
import { getWebCatalog, tFrom, type Locale, type WebLocaleCatalog } from '@galaxy/shared';

export type CatalogT = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Provider-independent translator for client components that can render
 * WITHOUT the LocaleProvider (route error page, ErrorBoundary fallback).
 * Loads the active locale catalog via the cached getWebCatalog promise —
 * wrap callers in a <Suspense> boundary: SSR resolves from disk instantly,
 * and the client chunk is preloaded with the page, so no visible flash.
 */
export function useCatalogT(locale: Locale): CatalogT {
  const catalog: WebLocaleCatalog = use(getWebCatalog(locale));
  return (key: string, vars?: Record<string, string | number>) => tFrom(catalog, key, locale, vars);
}
