import { Card, EmptyState } from '@galaxy/shared';

export default function OfflinePage(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center" padding="lg">
        <EmptyState
          title="أنت غير متصل"
          description="يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى"
          action={{ label: 'إعادة المحاولة', onPress: () => window.location.reload() }}
        />
      </Card>
    </div>
  );
}
