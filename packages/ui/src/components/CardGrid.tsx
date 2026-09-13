import type { ReactNode } from 'react';

/**
 * Responsive card grid — consistent grid layout for service/product cards.
 *
 * Usage:
 *   <CardGrid cols={3}>{cards}</CardGrid>
 */

interface CardGridProps {
  children: ReactNode;
  cols?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const COLS = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};
const GAPS = { sm: 'gap-3', md: 'gap-4', lg: 'gap-6' };

export function CardGrid({
  children,
  cols = 3,
  gap = 'md',
  className = '',
}: CardGridProps): JSX.Element {
  return <div className={`grid ${COLS[cols]} ${GAPS[gap]} ${className}`}>{children}</div>;
}
