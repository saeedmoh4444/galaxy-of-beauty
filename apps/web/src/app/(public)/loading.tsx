import Image from 'next/image';

export default function PublicLoading(): JSX.Element {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <Image
        src="/logo.png"
        alt="جالكسي بيوتي"
        width={64}
        height={64}
        className="mb-6 h-16 w-16 animate-pulse rounded-2xl object-cover shadow-lg"
      />
      <div className="flex gap-1">
        <div className="h-2 w-2 animate-bounce rounded-full bg-brand-600 [animation-delay:0ms]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:150ms]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:300ms]" />
      </div>
    </div>
  );
}
