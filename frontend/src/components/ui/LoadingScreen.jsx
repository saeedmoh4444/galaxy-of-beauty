/**
 * Full-screen loading spinner shown during lazy-loading.
 */
export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" />
        <p className="mt-4 text-gray-500 font-medium">جاري التحميل...</p>
      </div>
    </div>
  );
}
