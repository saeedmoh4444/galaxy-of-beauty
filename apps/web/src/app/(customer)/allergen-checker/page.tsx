'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, ErrorAlert } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const COMMON_ALLERGENS = [
  {key:'fragrance',emoji:'🌸',name:'العطور',risk:'medium',desc:'قد تسبب تهيج البشرة الحساسة'},
  {key:'alcohol',emoji:'🧪',name:'الكحول',risk:'high',desc:'يجفف البشرة ويهيجها'},
  {key:'parabens',emoji:'⚠️',name:'البارابين',risk:'medium',desc:'مواد حافظة قد تسبب حساسية'},
  {key:'sulfates',emoji:'🧼',name:'الكبريتات',risk:'high',desc:'منظفات قاسية على البشرة'},
  {key:'silicones',emoji:'🔬',name:'السيليكون',risk:'low',desc:'يسد المسام عند البعض'},
  {key:'essential_oils',emoji:'🌿',name:'زيوت عطرية',risk:'medium',desc:'قد تسبب حساسية للبشرة الحساسة'},
  {key:'lanolin',emoji:'🐑',name:'اللانولين',risk:'medium',desc:'دهن صوفي قد يسبب حساسية'},
  {key:'formaldehyde',emoji:'☠️',name:'الفورمالديهايد',risk:'high',desc:'مادة حافظة ضارة'},
];

export default function AllergenCheckerPage(): JSX.Element {
  const { data: profile } = api.allergenChecker.getProfile.useQuery() as { data: Record<string,unknown> | undefined };
  const saveMut = api.allergenChecker.saveProfile.useMutation();
  const [checked, setChecked] = useState<string[]>((profile?.allergens as string[])??['alcohol','sulfates']);
  const toggle = (key:string)=>{if(checked.includes(key))setChecked(checked.filter(x=>x!==key));else setChecked([...checked,key]);};

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">🔬 فاحص الحساسية</h1><p className="mt-1 text-sm text-gray-500">تجنبي المكونات اللي تسبب حساسية لبشرتكِ</p></div>
        <Card padding="lg"><h3 className="font-bold mb-4">⚠️ مسببات الحساسية لديّ</h3><div className="grid gap-3 sm:grid-cols-2">{COMMON_ALLERGENS.map(a=>{const isChecked=checked.includes(a.key);return(<button key={a.key} onClick={()=>toggle(a.key)} className={`rounded-xl border-2 p-3 text-right transition-all ${isChecked?(a.risk==='high'?'border-red-400 bg-red-50':a.risk==='medium'?'border-amber-400 bg-amber-50':'border-green-400 bg-green-50'):'border-gray-200'}`}><span className="text-2xl">{a.emoji}</span><span className="font-bold ml-2">{a.name}</span><span className={`text-xs rounded-full px-2 py-0.5 ${a.risk==='high'?'bg-red-100 text-red-700':a.risk==='medium'?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}`}>{a.risk==='high'?'عالي':a.risk==='medium'?'متوسط':'منخفض'}</span></button>);})}</div></Card>
        <Button onClick={()=>saveMut.mutate({allergens:checked})} loading={saveMut.isPending} className="w-full">💾 حفظ الملف</Button>
      </div>
    </DashboardLayout>
  );
}
