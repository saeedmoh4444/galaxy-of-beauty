'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const CYCLE_PHASES = [
  { key:'menstrual',emoji:'🩸',name:'الدورة',days:'1-5',color:'#ec4899',tips:['تجنبي إزالة الشعر بالشمع','البشرة حساسة — رطبي بلطف','تجنبي العلاجات القوية']},
  { key:'follicular',emoji:'🌸',name:'الجريبي',days:'6-13',color:'#f59e0b',tips:['أفضل وقت لتجربة منتجات جديدة','البشرة متقبلة للعلاج','الشعر ينمو أسرع — وقت مثالي للقص']},
  { key:'ovulation',emoji:'✨',name:'الإباضة',days:'14-16',color:'#8b5cf6',tips:['البشرة في أفضل حالاتها','مكياج خفيف يكفي','وقت مثالي للمناسبات']},
  { key:'luteal',emoji:'🌙',name:'الأصفري',days:'17-28',color:'#059669',tips:['البشرة دهنية — استخدمي التونر','قناع الطين مفيد','احتمالية ظهور حب الشباب']},
];

export default function CycleTrackerPage(): JSX.Element {
  const { data: entries } = api.cycleTracker.myEntries.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const logMut = api.cycleTracker.logDay.useMutation();
  const [selectedDay, setSelectedDay] = useState(14);
  const currentPhase = CYCLE_PHASES.find(p=>{const[s,e]=p.days.split('-').map(Number);return selectedDay>=(s??0)&&selectedDay<=(e??s??0);})??CYCLE_PHASES[1]!;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">📅 متعقب الدورة</h1><p className="mt-1 text-sm text-gray-500">توصيات جمالية حسب يوم دورتكِ</p></div>
        <Card padding="lg"><div className="flex flex-wrap gap-1 justify-center">{Array.from({length:28},(_,i)=>i+1).map(d=><button key={d} onClick={()=>setSelectedDay(d)} className={`w-8 h-8 rounded-full text-xs ${selectedDay===d?'bg-pink-600 text-white':'bg-gray-100'}`}>{d}</button>)}</div></Card>
        <Card padding="lg" className="text-center border-2" style={{borderColor:currentPhase.color}}>
          <span className="text-5xl">{currentPhase.emoji}</span><h2 className="text-xl font-bold mt-2">{currentPhase.name}</h2><p className="text-sm text-gray-500">الأيام {currentPhase.days}</p>
        </Card>
        <Card padding="lg"><h3 className="font-bold mb-4">💡 توصيات الجمال</h3><div className="space-y-2">{currentPhase.tips.map((tip,i)=><p key={i} className="text-sm text-gray-600">• {tip}</p>)}</div></Card>
      </div>
    </DashboardLayout>
  );
}
