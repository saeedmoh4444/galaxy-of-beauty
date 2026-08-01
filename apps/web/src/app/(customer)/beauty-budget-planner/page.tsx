'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const CATEGORIES = [
  {key:'hair',emoji:'💇‍♀️',name:'الشعر',budget:200,color:'#ec4899'},
  {key:'skin',emoji:'✨',name:'البشرة',budget:300,color:'#8b5cf6'},
  {key:'nails',emoji:'💅',name:'الأظافر',budget:100,color:'#f59e0b'},
  {key:'makeup',emoji:'💄',name:'المكياج',budget:150,color:'#db2777'},
  {key:'spa',emoji:'🧖‍♀️',name:'السبا',budget:250,color:'#059669'},
  {key:'products',emoji:'🧴',name:'منتجات',budget:200,color:'#0891b2'},
];

export default function BeautyBudgetPlannerPage(): JSX.Element {
  const { data: items, isLoading } = api.beautyBudgetPlanner.myBudgets.useQuery({month:'7',year:2026}) as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const totalBudget = CATEGORIES.reduce((s,c)=>s+c.budget,0);
  const allocated = (items??[]).reduce((s,i)=>s+(i.spent as number??0),0);
  const remaining = totalBudget - allocated;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">📊 مخطط الميزانية</h1><p className="mt-1 text-sm text-gray-500">خططي لمصاريف جمالكِ السنوية</p></div>
        <div className="grid gap-4 sm:grid-cols-3"><Card padding="lg" className="text-center bg-amber-50"><p className="text-2xl font-extrabold">{formatCurrency(totalBudget)}</p><p className="text-xs text-gray-500">الميزانية</p></Card><Card padding="lg" className="text-center bg-green-50"><p className="text-2xl font-extrabold text-green-600">{formatCurrency(allocated)}</p><p className="text-xs text-gray-500">مخصص</p></Card><Card padding="lg" className="text-center bg-blue-50"><p className="text-2xl font-extrabold text-blue-600">{formatCurrency(remaining)}</p><p className="text-xs text-gray-500">متبقي</p></Card></div>
        {isLoading ? <CardSkeleton/> : <div className="space-y-3">{CATEGORIES.map(c=>{const spent = (items??[]).find((i:Record<string,unknown>)=>i.category===c.key)?.spent as number??0;const pct=Math.min(100,Math.round((spent/c.budget)*100));return(<Card key={c.key} padding="md"><div className="flex items-center gap-4"><span className="text-3xl">{c.emoji}</span><div className="flex-1"><p className="font-bold">{c.name}</p><p className="text-xs text-gray-500">الميزانية: {formatCurrency(c.budget)}</p><div className="mt-2 h-2 bg-gray-100 rounded-full"><div className="h-2 rounded-full" style={{width:`${pct}%`,backgroundColor:spent>c.budget?'#ef4444':c.color}}/></div></div><p className={`font-bold ${spent>c.budget?'text-red-600':'text-brand-600'}`}>{formatCurrency(spent)}</p></div></Card>);})}</div>}
      </div>
    </DashboardLayout>
  );
}
