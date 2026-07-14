'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SkinAnalysisPage(): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const { data: history, isLoading, isError, refetch } = api.skinAnalysis.history.useQuery({
    page: 1,
    limit: 10,
  });

  const analyzeMutation = api.skinAnalysis.analyze.useMutation({
    onSuccess: (data) => {
      setResult((data as Record<string, unknown>).resultJson as Record<string, unknown> || null);
      setAnalyzing(false);
      refetch();
    },
    onError: () => setAnalyzing(false),
  });

  const handleAnalyze = () => {
    if (!imageUrl) return;
    setAnalyzing(true);
    setResult(null);
    analyzeMutation.mutate({ imageUrl });
  };

  const histItems = (history as unknown as Record<string, unknown>)?.items as Array<Record<string, unknown>> || [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">تحليل البشرة بالذكاء الاصطناعي</h1>

        <Card padding="md">
          <h3 className="mb-3 font-semibold">حملي صورة لبشرتك</h3>
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
            />
            <p className="text-xs text-gray-400">أو أدخلي رابط الصورة:</p>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
              />
              <Button onClick={handleAnalyze} loading={analyzing} disabled={!imageUrl}>
                تحليل
              </Button>
            </div>
          </div>
        </Card>

        {result && (
          <Card padding="md" className="border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-950">
            <h3 className="mb-3 font-semibold text-brand-700">نتائج التحليل</h3>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div><span className="text-gray-500">نوع البشرة:</span> {result['skinType'] as string || 'غير محدد'}</div>
              <div><span className="text-gray-500">المشاكل:</span> {(result['concerns'] as string[])?.join('، ') || '-'}</div>
            </div>
            {result['recommendations'] ? (
              <div className="mt-3">
                <p className="text-sm font-semibold">التوصيات:</p>
                <pre className="mt-1 text-xs whitespace-pre-wrap">{JSON.stringify(result['recommendations'], null, 2)}</pre>
              </div>
            ) : null}
          </Card>
        )}

        <h3 className="text-lg font-semibold">التحليلات السابقة</h3>
        {isLoading ? <CardSkeleton /> :
         isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} /> :
         histItems.length === 0 ? <EmptyState title="لا توجد تحليلات سابقة" description="حملي أول صورة لتحليل بشرتك" /> :
         <div className="space-y-3">
           {histItems.map((a) => (
             <Card key={a.id as number} padding="sm">
               <div className="flex items-center gap-3">
                 <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">🔬</div>
                 <div>
                   <p className="font-medium text-sm">{(a.resultJson as Record<string, unknown>)?.skinType as string || 'تحليل'}</p>
                   <p className="text-xs text-gray-500">{new Date(a.createdAt as string).toLocaleDateString('ar-SA')}</p>
                 </div>
               </div>
             </Card>
           ))}
         </div>
        }
      </div>
    </DashboardLayout>
  );
}
