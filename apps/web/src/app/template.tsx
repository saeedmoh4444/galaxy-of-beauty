import type { ReactNode } from 'react';

/**
 * Page-level template that wraps every route with a subtle entrance animation.
 * Unlike layout.tsx, template.tsx re-mounts on every navigation, giving each
 * page its own mount animation.
 *
 * Respects prefers-reduced-motion via the globals.css media query.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <div
      className="animate-page-in"
      style={{ animationDuration: '250ms', animationFillMode: 'both' }}
    >
      {children}
    </div>
  );
}
