import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ClassValue } from 'clsx';

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * Uses clsx for conditional class joining and tailwind-merge
 * to resolve conflicting Tailwind utilities (e.g., bg-red-500 bg-blue-500 → bg-blue-500).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
