'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const MEMBERSHIPS = [
  {key:'basic',emoji:'🥈',name:'الأساسية',price:0,color:'#9ca3af',benefits:['حجز المواعيد','تصفح الخدمات','تقييم الفنيات'],notIncluded:['خصم على الخدمات','حجز أولوية','استشارات مجانية']},
  {key:'premium',emoji:'🥇',name:'المميزة',price:99,color:'#f59e0b',benefits:['خصم ١٠٪','حجز أولوية','استشارة مجانية شهرياً','هدية ترحيبية','نقاط مضاعفة','دخول فعاليات حصرية'],notIncluded:[]},
  {key:'platinum',emoji:'💎',name:'البلاتينية',price:299,color:'#7c3aed',benefits:['خصم ٢٠٪','حجز فوري','استشارات غير محدودة','مديرة حساب شخصية','هدية شهرية','نقاط ×٣','فعاليات VIP','خدمة توصيل مجانية'],notIncluded:[]},
];

export default function SalonMembershipPage(): JSX.Element {
  const { data: membership, isLoading } = api.salonMembership.myMembership.useQuery() as { data: Record<string,unknown> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const subscribeMut = api.salonMembership.subscribe.useMutation(); const cancelMut = api.salonMembership.cancel.useMutation();

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        <div><h1 className="text-2xl font-bold">💳 عضويات الصالون</h1><p className="mt-1 text-sm text-text-secondary">اختاري العضوية اللي تناسبكِ</p></div>
        {isLoading ? <CardSkeleton/> : (membership?.tier as string) && <Card padding="lg" className="text-center border-2 border-purple-300"><p className="text-sm text-text-secondary">عضويتكِ الحالية</p><p className="text-3xl font-extrabold text-purple-600 mt-1">{(membership?.tier as string)==='platinum'?'💎 بلاتينية':(membership?.tier as string)==='premium'?'🥇 مميزة':'🥈 أساسية'}</p>{(membership?.autoRenew as boolean) && <Button variant="ghost" onClick={()=>cancelMut.mutate()} className="mt-3 text-red-500">إلغاء التجديد التلقائي</Button>}</Card>}
        <div className="grid gap-6 lg:grid-cols-3">{MEMBERSHIPS.map(m=>(<Card key={m.key} padding="lg" className="text-center"><span className="text-5xl">{m.emoji}</span><h2 className="text-xl font-bold mt-2" style={{color:m.color}}>{m.name}</h2><p className="text-2xl font-extrabold mt-1">{m.price===0?'مجانية':formatCurrency(m.price)+' / شهرياً'}</p><div className="mt-4 space-y-2 text-sm text-right"><p className="font-semibold text-text-primary">✅ المميزات</p>{m.benefits.map((b,i)=><p key={i} className="text-green-600">✓ {b}</p>)}{m.notIncluded.length>0&&<><p className="font-semibold text-text-tertiary mt-3">🚫 غير متضمن</p>{m.notIncluded.map((b,i)=><p key={i} className="text-text-tertiary">✗ {b}</p>)}</>}<Button onClick={()=>subscribeMut.mutate({tier:m.key,autoRenew:true})} loading={subscribeMut.isPending} className="w-full mt-4">{m.price===0?'مجانية':'اشتراك'}</Button></div></Card>))}</div>
      </div>
    </DashboardLayout>
  );
}
