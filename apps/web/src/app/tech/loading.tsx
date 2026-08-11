export default function TechLoading(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-5">
        <img
          src="/logo.png"
          alt="جالكسي بيوتي"
          className="h-16 w-16 animate-pulse rounded-2xl object-cover shadow-lg"
        />
        <p className="text-sm font-medium text-gray-400">جاري تحميل لوحة الفنية...</p>
      </div>
    </div>
  );
}
