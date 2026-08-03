'use client';
import { useState } from 'react';
import { Card } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const GOAL_TEMPLATES = [
  { key:'skincare',emoji:'✨',name:'عناية بالبشرة',goals:['روتين عناية يومي لمدة ٣٠ يوم','تقشير أسبوعي','شرب ٨ أكواب ماء يومياً','استخدام واقي شمس يومي']},
  { key:'makeup',emoji:'💄',name:'مكياج',goals:['تعلم أساسيات الكونتور','تجربة لون أحمر شفاه جديد','مكياج بدون أخطاء','تنظيف فرش المكياج أسبوعياً']},
  { key:'hair',emoji:'💇‍♀️',name:'شعر',goals:['حمام زيت أسبوعي','قص أطراف الشعر','تجنب الحرارة لمدة أسبوعين','تجربة تسريحة جديدة']},
  { key:'health',emoji:'🧘',name:'صحة وعافية',goals:['نوم ٨ ساعات يومياً','ممارسة الرياضة ٣ مرات أسبوعياً','تناول فيتامينات يومية','تقليل السكر لمدة أسبوعين']},
  { key:'nails',emoji:'💅',name:'أظافر',goals:['ترطيب الأظافر يومياً','عدم قضم الأظافر لمدة شهر','تجربة nail art','تقوية الأظافر بزيت الخروع']},
  { key:'spirit',emoji:'🌸',name:'روحانية',goals:['جلسة عناية ذاتية أسبوعياً','تدوين ٣ أشياء إيجابية يومياً','تجربة التأمل لمدة ١٠ دقائق','حمام استرخاء أسبوعي']},
];

export default function BeautyGoalsPage(): JSX.Element {
  const [goals, setGoals] = useState<Record<string,boolean[]>>({});
  const toggle = (catKey: string, idx: number) => {
    setGoals(prev => {
      const catGoals = [...(prev[catKey] ?? GOAL_TEMPLATES.find(g=>g.key===catKey)!.goals.map(() => false))];
      catGoals[idx] = !catGoals[idx];
      return { ...prev, [catKey]: catGoals };
    });
  };

  const allGoals = GOAL_TEMPLATES.flatMap(c => c.goals.map((g,i) => ({ cat: c.key, goal: g, idx: i })));
  const checked = allGoals.filter(g => goals[g.cat]?.[g.idx]).length;
  const pct = Math.round((checked / allGoals.length) * 100);

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        <div><h1 className="text-2xl font-bold">🎯 أهداف الجمال</h1><p className="mt-1 text-sm text-text-secondary">حددي أهدافكِ وتابعي تقدمكِ</p></div>

        <Card padding="lg" className="text-center"><div className="h-4 bg-surface-muted rounded-full"><div className="h-4 bg-green-500 rounded-full transition-all" style={{width:`${pct}%`}}/></div><p className="text-sm text-text-secondary mt-2">{checked}/{allGoals.length} هدف — {pct}%</p></Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GOAL_TEMPLATES.map(cat => {
            const catGoals = goals[cat.key] ?? cat.goals.map(() => false);
            const catChecked = catGoals.filter(Boolean).length;
            return (
              <Card key={cat.key} padding="lg">
                <div className="flex items-center gap-2 mb-3"><span className="text-2xl">{cat.emoji}</span><h3 className="font-bold">{cat.name}</h3><span className="text-xs text-text-tertiary mr-auto">{catChecked}/{cat.goals.length}</span></div>
                <div className="space-y-2">{cat.goals.map((g, i) => (
                  <label key={i} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${catGoals[i]?'bg-green-50 line-through text-text-tertiary':''}`}>
                    <input type="checkbox" checked={catGoals[i] ?? false} onChange={() => toggle(cat.key, i)} className="w-4 h-4 accent-brand-600" />
                    <span className="text-sm">{g}</span>
                  </label>
                ))}</div>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
