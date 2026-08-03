'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TechGalleryPage(): JSX.Element {
  const uploadMut = api.gallery.upload.useMutation();
  const [url, setUrl] = useState(''); const [caption, setCaption] = useState(''); const [uploaded, setUploaded] = useState(false);

  return (
    <DashboardLayout role="TECHNICIAN">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">🖼️ معرض أعمالي</h1><p className="mt-1 text-sm text-text-secondary">صور قبل وبعد لعملائكِ</p></div>

        <Card padding="lg"><h3 className="font-bold mb-3">📤 رفع صورة جديدة</h3>
          <div className="space-y-3">
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="رابط الصورة" className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
            <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="وصف الصورة (اختياري)" className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
            <Button onClick={() => { if(url.trim()) uploadMut.mutate({ imageUrl: url.trim(), captionAr: caption || undefined }, { onSuccess: () => { setUrl(''); setCaption(''); setUploaded(true); } }); }} loading={uploadMut.isPending} className="w-full">📤 رفع الصورة</Button>
          </div>
        </Card>

        {uploaded && <Card padding="lg" className="text-center border-2 border-green-300 bg-green-50"><p className="text-2xl">✅</p><p className="font-bold text-green-700 mt-2">تم رفع الصورة بنجاح</p></Card>}
      </div>
    </DashboardLayout>
  );
}
