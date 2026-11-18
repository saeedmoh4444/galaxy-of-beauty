'use client';
import type { JSX } from 'react';
import { GroupError } from '@/components/GroupError';

/** W4-11 — group-level error boundary (see components/GroupError.tsx). */
export default function GroupErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  return <GroupError error={error} reset={reset} />;
}
