/**
 * Divider — horizontal separator with optional label.
 *
 * Usage:
 *   <Divider />
 *   <Divider label="أو" />
 */

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className = '' }: DividerProps): JSX.Element {
  if (!label) return <hr className={`border-edge dark:border-gray-700 ${className}`} />;
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <hr className="flex-1 border-edge dark:border-gray-700" />
      <span className="text-sm text-text-tertiary dark:text-gray-500">{label}</span>
      <hr className="flex-1 border-edge dark:border-gray-700" />
    </div>
  );
}
