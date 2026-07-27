import type { ReactNode } from 'react';

// ── React Helpers ────────────────────────────────────────────────────

export interface ChildrenProps {
  children?: ReactNode;
}

/**
 * Standard async state enum used across all data-fetching components.
 */
export type AsyncState = 'loading' | 'error' | 'empty' | 'success';

/**
 * Every feature that fetches data must export these four components.
 */
export interface FeatureComponentSet<T> {
  Skeleton: React.ComponentType;
  Error: React.ComponentType<{ message: string; onRetry: () => void }>;
  Empty: React.ComponentType;
  /** Renders the actual data. Named FeatureDataView to avoid conflict with native DataView API. */
  FeatureDataView: React.ComponentType<{ data: T[] }>;
}

// ── API Types ────────────────────────────────────────────────────────

/** Standard paginated response from list endpoints. */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/** Generic API error shape. */
export interface ApiError {
  code: string;
  message: string;
  zodError?: Record<string, string[]> | null;
}

/** Sort direction for list queries. */
export type SortDirection = 'asc' | 'desc';

/** Common sort options for service/technician listings. */
export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'duration';

/** Bilingual content field (JSONB `{ ar, en }`). */
export interface BilingualContent {
  ar: string;
  en: string;
}

/**
 * Loose bilingual type for Prisma Json fields.
 * Prisma types JSONB as `JsonValue` which is a deep union;
 * use this to safely extract Arabic/English text.
 */
export interface Bilingual {
  ar?: string | null;
  en?: string | null;
}

/** Extract Arabic text from a bilingual JSONB field. Falls back to English, then empty. */
export function ar(json: unknown): string {
  if (!json || typeof json !== 'object') return '';
  const b = json as Bilingual;
  return b.ar ?? b.en ?? '';
}

/** Extract English text from a bilingual JSONB field. Falls back to Arabic, then empty. */
export function en(json: unknown): string {
  if (!json || typeof json !== 'object') return '';
  const b = json as Bilingual;
  return b.en ?? b.ar ?? '';
}

/** Saudi currency amount in SAR. */
export type SARAmount = number;

/** ISO 8601 date-time string. */
export type ISODateTime = string;
