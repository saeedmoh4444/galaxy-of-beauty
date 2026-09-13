import type { ReactNode } from 'react';

/**
 * Page-level template that wraps every route with a subtle entrance animation
 * (180ms cross-fade + slide — UI/UX backlog 3.1).
 *
 * Unlike layout.tsx, template.tsx re-mounts on every navigation, giving each
 * page its own mount animation. Duration lives in globals.css (.animate-page-in);
 * prefers-reduced-motion is respected via the globals.css media query.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
