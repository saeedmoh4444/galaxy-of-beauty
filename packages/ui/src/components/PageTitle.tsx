/**
 * Page Title — consistent page header with optional breadcrumb.
 *
 * Usage:
 *   <PageTitle title="حجوزاتي" subtitle="إدارة حجوزاتكِ" />
 */

interface PageTitleProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  className?: string;
}

export function PageTitle({ title, subtitle, emoji, className = '' }: PageTitleProps): JSX.Element {
  return (
    <div className={`mb-6 ${className}`}>
      <h1 className="text-2xl font-extrabold text-text-primary dark:text-gray-100">
        {emoji ? <span className="mr-2">{emoji}</span> : null}
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-text-secondary dark:text-gray-400">{subtitle}</p>
      ) : null}
    </div>
  );
}
