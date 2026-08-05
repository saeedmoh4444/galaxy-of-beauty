'use client';

/**
 * Avatar component with image, initials fallback, and online indicator.
 *
 * Usage:
 *   <Avatar src={user.avatarUrl} name="نورة العمري" />
 *   <Avatar name="سارة" size="lg" online />
 */

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  className?: string;
}

const SIZE_CLASSES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' };
const DOT_SIZES = { sm: 'h-2 w-2', md: 'h-2.5 w-2.5', lg: 'h-3 w-3', xl: 'h-4 w-4' };

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0]![0] ?? '?';
  return (parts[0]![0] ?? '') + (parts[parts.length - 1]![0] ?? '');
}

function getColor(name?: string): string {
  const colors = ['#7c3aed', '#db2777', '#059669', '#d97706', '#2563eb', '#dc2626', '#0891b2', '#9333ea'];
  let hash = 0;
  for (let i = 0; i < (name ?? '').length; i++) hash = name!.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length] ?? '#7c3aed';
}

export function Avatar({ src, name, size = 'md', online, className = '' }: AvatarProps): JSX.Element {
  const initials = getInitials(name);
  const bgColor = getColor(name);

  return (
    <span className={`relative inline-flex ${className}`}>
      {src ? (
        <img src={src} alt={name ?? ''} className={`${SIZE_CLASSES[size]} rounded-full object-cover`} />
      ) : (
        <span
          className={`${SIZE_CLASSES[size]} inline-flex items-center justify-center rounded-full font-bold text-white`}
          style={{ backgroundColor: bgColor }}
          aria-label={name}
        >
          {initials}
        </span>
      )}
      {online ? (
        <span className={`absolute bottom-0 right-0 ${DOT_SIZES[size]} rounded-full border-2 border-white bg-green-500 dark:border-gray-900`} />
      ) : null}
    </span>
  );
}
