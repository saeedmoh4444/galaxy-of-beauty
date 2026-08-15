import Image from 'next/image';

export default function RootLoading(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-950">
      <div className="flex flex-col items-center gap-6">
        <div className="animate-pulse">
          <Image
            src="/logo.png"
            alt="Galaxy of Beauty"
            width={80}
            height={80}
            className="h-20 w-20 rounded-2xl object-cover shadow-lg"
          />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand-600 [animation-delay:0ms]" />
          <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand-500 [animation-delay:150ms]" />
          <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand-400 [animation-delay:300ms]" />
        </div>
        <p className="text-sm font-medium text-gray-400">جاري التحميل...</p>
      </div>
    </div>
  );
}
