'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';

export default function HairColorSimPage(): JSX.Element {
  const [photo, setPhoto] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const { data: colors, isLoading } = api.hairColorSim.colors.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const saveMut = api.hairColorSim.save.useMutation();

  const allColors = colors ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div><h1 className="text-2xl font-bold">💇‍♀️ محاكي لون الشعر</h1><p className="mt-1 text-sm text-text-secondary">جرّبي ألوان شعر مختلفة قبل الصبغة</p></div>

        <Card padding="lg">
          <h3 className="font-bold mb-3">📷 حمّلي صورتكِ</h3>
          <input type="file" accept="image/*" className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f)); }} />
          {photo && <img src={photo} alt="صورتك" className="mt-3 h-48 rounded-xl object-cover w-full" />}
        </Card>

        <Card padding="lg">
          <h3 className="font-bold mb-4">🎨 اختاري لوناً</h3>
          {isLoading ? <CardSkeleton /> : (
            <div className="flex flex-wrap gap-3">
              {allColors.map((c: Record<string,unknown>) => (
                <button key={c.id as string} onClick={() => { setSelected(c.id as string); saveMut.mutate({ colorId: c.id as string }); }} className={`flex flex-col items-center gap-1 rounded-xl p-3 transition-all ${selected === c.id ? 'ring-2 ring-brand-500 scale-105 shadow-lg' : 'hover:scale-105'}`}>
                  <div className="h-12 w-12 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: c.hex as string }} />
                  <span className="text-[10px] text-text-secondary">{c.nameAr as string}</span>
                  {selected === c.id && <span className="text-brand-500 text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </Card>

        {selected && <div className="text-center"><Link href="/bookings/create"><Button size="lg">💇‍♀️ احجزي صبغة الآن</Button></Link></div>}
      </div>
    </DashboardLayout>
  );
}
