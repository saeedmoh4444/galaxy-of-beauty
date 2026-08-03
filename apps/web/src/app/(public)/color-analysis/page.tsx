'use client';
import { useState } from 'react';
import { Card } from '@galaxy/shared';

const SEASONS = [
  { key: 'winter', nameAr: 'الشتوية', emoji: '❄️', desc: 'بشرة باردة مع تباين عالي', palette: ['#1a1a2e','#e94560','#0f3460','#FFFFFF','#FFD700','#800020'], bestColors: ['أبيض ناصع', 'أسود', 'أحمر ياقوتي', 'أزرق ملكي', 'فضي'], avoid: ['برتقالي', 'بيج دافئ', 'ذهبي'], celebrities: ['آن هاثاواي', 'لوسي لو'] },
  { key: 'summer', nameAr: 'الصيفية', emoji: '🌸', desc: 'بشرة باردة مع تباين منخفض', palette: ['#cce0ff','#d4a5c9','#a8d8ea','#f7d1e0','#b8d4e3','#dcc0d0'], bestColors: ['وردي ناعم', 'أزرق باستيل', 'خزامي', 'رمادي فاتح', 'أبيض'], avoid: ['برتقالي', 'أصفر ذهبي', 'بني داكن'], celebrities: ['تايلور سويفت', 'إيلي فانينغ'] },
  { key: 'autumn', nameAr: 'الخريفية', emoji: '🍂', desc: 'بشرة دافئة مع تباين منخفض', palette: ['#8B4513','#D2691E','#daa520','#6B8E23','#CD853F','#B8860B'], bestColors: ['بني', 'برتقالي محروق', 'أخضر زيتوني', 'ذهبي', 'خردلي'], avoid: ['أسود', 'أبيض ناصع', 'أزرق فاتح'], celebrities: ['جينيفر لوبيز', 'بيونسيه'] },
  { key: 'spring', nameAr: 'الربيعية', emoji: '🌺', desc: 'بشرة دافئة مع تباين منخفض', palette: ['#FFD700','#90EE90','#FFB6C1','#87CEEB','#FFA07A','#98FB98'], bestColors: ['أصفر مشمس', 'مرجاني', 'أخضر فاتح', 'خوخي', 'أزرق سماوي'], avoid: ['أسود', 'رمادي داكن', 'أبيض ناصع'], celebrities: ['إيما ستون', 'تايلور سويفت (سابقاً)'] },
];

const QUESTIONS = [
  { q: 'كيف يبدو لون بشرتكِ في ضوء الشمس الطبيعي؟', opts: [{ k:'warm',l:'يميل للذهبي أو الأصفر'},{k:'cool',l:'يميل للوردي أو الأزرق'},{k:'neutral',l:'محايد — لا للأصفر ولا للوردي'}] },
  { q: 'لون عروق معصمكِ؟', opts: [{ k:'warm',l:'خضراء'},{k:'cool',l:'زرقاء أو بنفسجية'},{k:'neutral',l:'مزيج من الأخضر والأزرق'}] },
  { q: 'أي المعادن تناسبكِ أكثر؟', opts: [{ k:'warm',l:'الذهب — يضفي توهجاً على بشرتي'},{k:'cool',l:'الفضة — تبدو طبيعية أكثر عليّ'},{k:'neutral',l:'كلاهما يناسبني'}] },
  { q: 'كيف تتفاعل بشرتكِ مع الشمس؟', opts: [{ k:'warm',l:'أسمر بسهولة'},{k:'cool',l:'أحترق بسهولة'},{k:'neutral',l:'أحترق قليلاً ثم أسمر'}] },
];

export default function ColorAnalysisPage(): JSX.Element {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<typeof SEASONS[0] | null>(null);

  const handleAnswer = (k: string) => {
    const newAnswers = [...answers, k];
    if (step < QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
    } else {
      const warm = newAnswers.filter(a => a === 'warm').length;
      const cool = newAnswers.filter(a => a === 'cool').length;
      const seasonKey = warm > cool ? 'autumn' : cool > warm ? 'winter' : warm >= 2 ? 'spring' : 'summer';
      setResult(SEASONS.find(s => s.key === seasonKey) ?? SEASONS[0]!);
    }
  };

  const reset = () => { setStep(0); setAnswers([]); setResult(null); };

  if (result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <span className="text-7xl">{result.emoji}</span>
        <h1 className="mt-6 text-4xl font-extrabold">فصل لونكِ: {result.nameAr}</h1>
        <p className="mt-2 text-lg text-text-secondary">{result.desc}</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Card padding="lg"><h3 className="font-bold text-lg mb-3">🎨 الألوان المناسبة</h3>
            <div className="flex flex-wrap gap-2 justify-center mb-3">{result.palette.map(c => <div key={c} className="w-10 h-10 rounded-full border-2 border-white shadow" style={{backgroundColor:c}}/>)}</div>
            <div className="space-y-1 text-sm">{result.bestColors.map(c => <p key={c} className="text-green-600">✅ {c}</p>)}</div>
          </Card>
          <Card padding="lg"><h3 className="font-bold text-lg mb-3">⚠️ تجنبي</h3>
            <div className="space-y-1 text-sm">{result.avoid.map(c => <p key={c} className="text-red-500">❌ {c}</p>)}</div>
            <h3 className="font-bold text-lg mt-6 mb-2">🌟 مشهورات من نفس الفصل</h3>
            {result.celebrities.map(c => <p key={c} className="text-sm text-gray-600">{c}</p>)}
          </Card>
        </div>

        <div className="mt-8 flex gap-3 justify-center">
          <button onClick={reset} className="rounded-lg bg-brand-600 px-6 py-3 text-white font-medium hover:bg-brand-700">🔄 إعادة التحليل</button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[step]!;
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-6xl">🎨</span>
        <h1 className="mt-4 text-3xl font-bold">تحليل الألوان</h1>
        <p className="mt-2 text-text-secondary">اكتشفي فصل لونكِ وتعرفي على الألوان اللي تليق بكِ</p>
      </div>
      <div className="mb-6"><div className="flex gap-1 mb-2">{QUESTIONS.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i<=step?'bg-brand-600':'bg-gray-200'}`}/>)}</div><p className="text-xs text-text-tertiary">{step+1}/{QUESTIONS.length}</p></div>
      <h2 className="text-xl font-bold mb-6">{q.q}</h2>
      <div className="space-y-3">{q.opts.map(o => (
        <button key={o.k} onClick={() => handleAnswer(o.k)} className="w-full rounded-xl border-2 border-edge p-4 text-right hover:border-brand-400 hover:bg-brand-50 transition-all">
          <span className="text-lg">{o.l}</span>
        </button>
      ))}</div>
    </div>
  );
}
