/**
 * Section Heading — consistent page section titles with optional action link.
 *
 * Usage:
 *   <SectionHeading title="آخر الحجوزات" action={{ label: 'عرض الكل', href: '/bookings' }} />
 */

interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}

export function SectionHeading({
  title,
  description,
  action,
  className = '',
}: SectionHeadingProps): JSX.Element {
  return (
    <div className={`mb-4 flex items-end justify-between ${className}`}>
      <div>
        <h2 className="text-lg font-bold text-text-primary dark:text-gray-100">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-text-secondary dark:text-gray-400">{description}</p>
        ) : null}
      </div>
      {action ? (
        action.href ? (
          <a
            href={action.href}
            className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            {action.label}
          </a>
        ) : (
          <button
            onClick={action.onClick}
            className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            {action.label}
          </button>
        )
      ) : null}
    </div>
  );
}
