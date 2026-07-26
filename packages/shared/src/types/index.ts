import type { ReactNode } from 'react';

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
