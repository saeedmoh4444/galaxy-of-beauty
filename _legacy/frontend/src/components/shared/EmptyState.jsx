/**
 * Reusable empty state with icon, message, and optional CTA.
 * Usage:
 *   <EmptyState icon="📋" message="لا توجد حجوزات" />
 *   <EmptyState icon="✨" message="لم تضفي أي خدمات بعد" action={{ label: 'إضافة خدمة', onClick: () => {} }} />
 */
export default function EmptyState({ icon = '📭', message = 'لا توجد بيانات', subtitle, action }) {
  return (
    <div className="card text-center py-12">
      <span className="text-5xl block mb-3">{icon}</span>
      <p className="text-gray-500">{message}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-primary text-sm mt-4">
          {action.label}
        </button>
      )}
    </div>
  );
}
