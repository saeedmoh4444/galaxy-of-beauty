import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CustomerLoading(): JSX.Element {
  return (
    <DashboardLayout role="CUSTOMER">
      <div className="flex flex-col items-center justify-center py-24">
        <img
          src="/logo.png"
          alt="جالكسي بيوتي"
          className="mb-6 h-14 w-14 animate-pulse rounded-2xl object-cover shadow-lg"
        />
        <div className="flex gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-brand-600 [animation-delay:0ms]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:150ms]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:300ms]" />
        </div>
      </div>
    </DashboardLayout>
  );
}
