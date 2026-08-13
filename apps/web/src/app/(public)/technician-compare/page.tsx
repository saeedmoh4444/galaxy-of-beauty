'use client';
import { useState } from 'react';
import { Card } from '@galaxy/ui';

const TECHNICIANS = [
  {
    id: 1,
    name: 'نورة العمري',
    specialty: 'مكياج',
    rating: 4.9,
    reviews: 234,
    price: 300,
    experience: '٨ سنوات',
    city: 'الرياض',
    emoji: '',
    services: ['مكياج عرايس', 'مكياج سهرة', 'مكياج ناعم'],
    features: { speed: 90, quality: 95, price: 70, communication: 92 },
  },
  {
    id: 2,
    name: 'سارة الحربي',
    specialty: 'شعر',
    rating: 4.8,
    reviews: 189,
    price: 250,
    experience: '٦ سنوات',
    city: 'جدة',
    emoji: '‍️',
    services: ['تسريحات', 'صبغات', 'علاج شعر'],
    features: { speed: 85, quality: 92, price: 80, communication: 88 },
  },
  {
    id: 3,
    name: 'هند المطيري',
    specialty: 'أظافر',
    rating: 4.7,
    reviews: 156,
    price: 180,
    experience: '٥ سنوات',
    city: 'الدمام',
    emoji: '',
    services: ['مانيكير', 'باديكير', ' nail art'],
    features: { speed: 88, quality: 90, price: 90, communication: 85 },
  },
  {
    id: 4,
    name: 'د. ليلى القحطاني',
    specialty: 'بشرة',
    rating: 4.9,
    reviews: 312,
    price: 350,
    experience: '١٢ سنة',
    city: 'الرياض',
    emoji: '',
    services: ['تنظيف بشرة', 'تقشير', 'علاج حب الشباب'],
    features: { speed: 80, quality: 98, price: 60, communication: 95 },
  },
];

const DIMS: Record<string, string> = {
  speed: ' السرعة',
  quality: ' الجودة',
  price: ' السعر',
  communication: ' التواصل',
};

export default function TechnicianComparePage(): JSX.Element {
  const [selected, setSelected] = useState<number[]>([]);
  const toggle = (id: number) => {
    if (selected.includes(id)) setSelected(selected.filter((x) => x !== id));
    else if (selected.length < 3) setSelected([...selected, id]);
  };
  const techs = TECHNICIANS.filter((t) => selected.includes(t.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-6xl">‍</span>
        <h1 className="mt-4 text-3xl font-bold">مقارنة الفنيات</h1>
        <p className="mt-2 text-text-secondary">
          قارني بين الفنيات واختاري الأفضل لكِ (اختاري ٢-٣)
        </p>
      </div>

      <Card padding="lg" className="mb-8">
        <div className="grid gap-3 sm:grid-cols-2">
          {TECHNICIANS.map((t) => {
            const isSel = selected.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                className={`rounded-xl border-2 p-4 text-right transition-all ${isSel ? 'border-brand-400 bg-brand-50' : 'border-edge hover:border-edge'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{t.emoji}</span>
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-xs text-text-secondary">
                      {t.specialty} · {t.city} · {t.rating} · {t.experience}
                    </p>
                  </div>
                  {isSel && <span className="mr-auto text-brand-600 text-xl"></span>}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {techs.length >= 2 && (
        <Card padding="lg">
          <h3 className="font-bold text-lg mb-6 text-center"> مقارنة {techs.length} فنيات</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-right">الميزة</th>
                  {techs.map((t) => (
                    <th key={t.id} className="p-3 text-center">
                      <span className="text-2xl block">{t.emoji}</span>
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 text-text-secondary"> التقييم</td>
                  {techs.map((t) => (
                    <td key={t.id} className="p-3 text-center font-bold">
                      {t.rating}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-text-secondary"> المراجعات</td>
                  {techs.map((t) => (
                    <td key={t.id} className="p-3 text-center">
                      {t.reviews}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-text-secondary"> السعر</td>
                  {techs.map((t) => (
                    <td key={t.id} className="p-3 text-center font-bold text-brand-600">
                      {t.price} ر.س
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-text-secondary"> المدينة</td>
                  {techs.map((t) => (
                    <td key={t.id} className="p-3 text-center">
                      {t.city}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-text-secondary">️ الخبرة</td>
                  {techs.map((t) => (
                    <td key={t.id} className="p-3 text-center">
                      {t.experience}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-text-secondary"> الخدمات</td>
                  {techs.map((t) => (
                    <td key={t.id} className="p-3 text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {t.services.map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-surface-muted px-2 py-0.5 text-xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                {Object.entries(DIMS).map(([k, label]) => (
                  <tr key={k} className="border-b">
                    <td className="p-3 text-text-secondary">{label}</td>
                    {techs.map((t) => (
                      <td key={t.id} className="p-3">
                        <div className="h-2 bg-surface-muted rounded-full">
                          <div
                            className="h-2 bg-brand-600 rounded-full"
                            style={{ width: `${t.features[k as keyof typeof t.features]}%` }}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
