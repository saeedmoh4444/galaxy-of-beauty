'use client';

import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, DetailSkeleton, ErrorAlert, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const SKIN_ROUTINES: Record<string, { morning: string[]; evening: string[]; weekly: string[] }> = {
  oily: {
    morning: ['غسول منقي', 'تونر للتحكم بالزيوت', 'مرطب خفيف خالٍ من الزيوت', 'واقي شمس'],
    evening: ['مزيل مكياج', 'غسول منقي', 'تونر', 'سيروم نياسيناميد', 'مرطب ليلي خفيف'],
    weekly: ['ماسك طين مرة أسبوعياً', 'تقشير كيميائي خفيف'],
  },
  dry: {
    morning: ['غسول كريمي', 'تونر مرطب', 'سيروم هيالورونيك أسيد', 'مرطب غني', 'واقي شمس'],
    evening: ['زيت تنظيف', 'غسول كريمي', 'تونر مرطب', 'سيروم فيتامين E', 'مرطب ليلي غني'],
    weekly: ['ماسك ترطيب مكثف', 'زيت وجه مغذٍ'],
  },
  combination: {
    morning: [
      'غسول متوازن',
      'تونر للبشرة المختلطة',
      'مرطب خفيف للمنطقة الدهنية',
      'مرطب أغنى للخدين',
      'واقي شمس',
    ],
    evening: ['مزيل مكياج', 'غسول متوازن', 'تونر', 'سيروم للبشرة', 'مرطب ليلي'],
    weekly: ['ماسك متعدد المناطق', 'تقشير لطيف'],
  },
  sensitive: {
    morning: ['غسول لطيف خالٍ من العطور', 'تونر مهدئ', 'مرطب مهدئ', 'واقي شمس معدني'],
    evening: ['مزيل مكياج لطيف', 'غسول لطيف', 'سيروم مهدئ', 'مرطب ليلي مهدئ'],
    weekly: ['ماسك مهدئ بالألوفيرا', 'تجنب التقشير القوي'],
  },
  normal: {
    morning: ['غسول لطيف', 'تونر', 'مرطب', 'واقي شمس'],
    evening: ['مزيل مكياج', 'غسول لطيف', 'سيروم مضاد للأكسدة', 'مرطب ليلي'],
    weekly: ['تقشير لطيف', 'ماسك ترطيب'],
  },
};

const HAIR_ROUTINES: Record<string, string[]> = {
  straight: ['شامبو خفيف', 'بلسم مرطب', 'سيروم لمعان', 'حماية من الحرارة قبل التصفيف'],
  wavy: ['شامبو للشعر المموج', 'بلسم', 'كريم تصفيف للتمويجات', 'زيت أرغان للأطراف'],
  curly: ['شامبو خالٍ من السلفات', 'بلسم عميق', 'كريم تجعيد', 'زيت جوز الهند', 'جل تصفيف'],
  coily: ['شامبو مرطب', 'بلسم عميق', 'زبدة الشيا', 'زيت الخروع', 'واقي حراري'],
};

export default function BeautyRoutinePage(): JSX.Element {
  const { data: profile, isLoading, isError, refetch } = api.beautyProfile.get.useQuery();

  const skinRoutine = profile?.skinType
    ? SKIN_ROUTINES[profile.skinType as string] || SKIN_ROUTINES['normal']
    : null;
  const hairRoutine = profile?.hairType
    ? HAIR_ROUTINES[profile.hairType as string] || HAIR_ROUTINES['straight']
    : null;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">روتيني الجمالي</h1>
        <p className="text-sm text-text-secondary">روتين يومي مخصص لكِ بناءً على ملفكِ الجمالي</p>

        {isLoading ? (
          <DetailSkeleton />
        ) : isError ? (
          <ErrorAlert message="فشل تحميل الملف" onRetry={() => refetch()} />
        ) : !profile ? (
          <Card padding="lg" className="text-center">
            <span className="text-5xl"></span>
            <p className="mt-4 text-text-secondary">أكملي ملفكِ الجمالي للحصول على روتين مخصص</p>
            <a href="/beauty-profile" className="mt-4 inline-block">
              <Button>أكملي ملفكِ</Button>
            </a>
          </Card>
        ) : (
          <>
            {/* Skin Routine */}
            <Card padding="lg">
              <h3 className="text-lg font-bold mb-4">
                روتين البشرة (
                {profile.skinType === 'oily'
                  ? 'دهنية'
                  : profile.skinType === 'dry'
                    ? 'جافة'
                    : profile.skinType === 'combination'
                      ? 'مختلطة'
                      : profile.skinType === 'sensitive'
                        ? 'حساسة'
                        : 'عادية'}
                )
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-amber-600">️ الصباح</h4>
                  <ul className="space-y-1">
                    {skinRoutine?.morning.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary dark:text-gray-400 flex gap-2"
                      >
                        <span>•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-indigo-600"> المساء</h4>
                  <ul className="space-y-1">
                    {skinRoutine?.evening.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary dark:text-gray-400 flex gap-2"
                      >
                        <span>•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-purple-600"> أسبوعي</h4>
                  <ul className="space-y-1">
                    {skinRoutine?.weekly.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary dark:text-gray-400 flex gap-2"
                      >
                        <span>•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Hair Routine */}
            {hairRoutine && (
              <Card padding="lg">
                <h3 className="text-lg font-bold mb-4">
                  ‍️ روتين الشعر (
                  {profile.hairType === 'straight'
                    ? 'مستقيم'
                    : profile.hairType === 'wavy'
                      ? 'مموج'
                      : profile.hairType === 'curly'
                        ? 'مجعد'
                        : 'حلزوني'}
                  )
                </h3>
                <ul className="space-y-1">
                  {hairRoutine.map((s, i) => (
                    <li
                      key={i}
                      className="text-sm text-text-secondary dark:text-gray-400 flex gap-2"
                    >
                      <span>•</span> {s}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <div className="text-center">
              <Link href="/services" className="inline-block">
                <Button variant="outline">احجزي خدمات العناية</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
