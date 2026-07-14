/**
 * Reusable loading spinner.
 * Usage: <Loading /> or <Loading message="جاري تحميل البيانات..." />
 */
export default function Loading({ message = 'جاري التحميل...' }) {
  return (
    <div className="text-center py-8 text-gray-400">
      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-300 border-t-primary-600 mb-2" />
      <p>{message}</p>
    </div>
  );
}
