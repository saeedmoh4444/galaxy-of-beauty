// ── @galaxy/ui — UI Components, Hooks, Utilities ──
// Re-exports everything from @galaxy/shared (types, theme, i18n, constants)
// plus JSX components and React hooks.
//
// Most pages only need one import:
//   import { Button, Card, formatCurrency, PaginatedResponse } from '@galaxy/ui';

// Re-export ALL from @galaxy/shared
export * from '@galaxy/shared';

// UI Components
export * from './components/index';

// Hooks
export * from './hooks/index';

// Utilities (cn, formatCurrency)
export * from './utils/index';
