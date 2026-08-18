'use client';
import { useState } from 'react';
import { Card } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

const TECHNICIANS = [
  {
    id: 1,
    name: 'نورة العمري',
    specialty: 'marketing.technician-compare.spec-makeup',
    rating: 4.9,
    reviews: 234,
    price: 300,
    experience: 'marketing.technician-compare.exp-8',
    city: 'الرياض',
    emoji: '',
    services: [
      'marketing.technician-compare.svc-bridal-makeup',
      'marketing.technician-compare.svc-evening-makeup',
      'marketing.technician-compare.svc-soft-makeup',
    ],
    features: { speed: 90, quality: 95, price: 70, communication: 92 },
  },
  {
    id: 2,
    name: 'سارة الحربي',
    specialty: 'marketing.technician-compare.spec-hair',
    rating: 4.8,
    reviews: 189,
    price: 250,
    experience: 'marketing.technician-compare.exp-6',
    city: 'جدة',
    emoji: '‍️',
    services: [
      'marketing.technician-compare.svc-hairstyles',
      'marketing.technician-compare.svc-dyes',
      'marketing.technician-compare.svc-hair-treatment',
    ],
    features: { speed: 85, quality: 92, price: 80, communication: 88 },
  },
  {
    id: 3,
    name: 'هند المطيري',
    specialty: 'marketing.technician-compare.spec-nails',
    rating: 4.7,
    reviews: 156,
    price: 180,
    experience: 'marketing.technician-compare.exp-5',
    city: 'الدمام',
    emoji: '',
    services: [
      'marketing.technician-compare.svc-manicure',
      'marketing.technician-compare.svc-pedicure',
      'marketing.technician-compare.svc-nail-art',
    ],
    features: { speed: 88, quality: 90, price: 90, communication: 85 },
  },
  {
    id: 4,
    name: 'د. ليلى القحطاني',
    specialty: 'marketing.technician-compare.spec-skin',
    rating: 4.9,
    reviews: 312,
    price: 350,
    experience: 'marketing.technician-compare.exp-12',
    city: 'الرياض',
    emoji: '',
    services: [
      'marketing.technician-compare.svc-facial',
      'marketing.technician-compare.svc-peeling',
      'marketing.technician-compare.svc-acne-treatment',
    ],
    features: { speed: 80, quality: 98, price: 60, communication: 95 },
  },
] as const;

const DIMS = {
  speed: 'marketing.technician-compare.dim-speed',
  quality: 'marketing.technician-compare.dim-quality',
  price: 'marketing.technician-compare.dim-price',
  communication: 'marketing.technician-compare.dim-communication',
} as const;
type DimKey = keyof typeof DIMS;

export default function TechnicianComparePage(): JSX.Element {
  const { t } = useLocale();
  const [selected, setSelected] = useState<number[]>([]);
  const toggle = (id: number) => {
    if (selected.includes(id)) setSelected(selected.filter((x) => x !== id));
    else if (selected.length < 3) setSelected([...selected, id]);
  };
  const techs = TECHNICIANS.filter((tech) => selected.includes(tech.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-6xl">‍</span>
        <h1 className="mt-4 text-3xl font-bold">{t('marketing.technician-compare.title')}</h1>
        <p className="mt-2 text-text-secondary">{t('marketing.technician-compare.subtitle')}</p>
      </div>

      <Card padding="lg" className="mb-8">
        <div className="grid gap-3 sm:grid-cols-2">
          {TECHNICIANS.map((tech) => {
            const isSel = selected.includes(tech.id);
            return (
              <button
                key={tech.id}
                onClick={() => toggle(tech.id)}
                className={`rounded-xl border-2 p-4 text-right transition-all ${isSel ? 'border-brand-400 bg-brand-50' : 'border-edge hover:border-edge'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{tech.emoji}</span>
                  <div>
                    <p className="font-bold">{tech.name}</p>
                    <p className="text-xs text-text-secondary">
                      {t(tech.specialty)} · {tech.city} · {tech.rating} · {t(tech.experience)}
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
          <h3 className="font-bold text-lg mb-6 text-center">
            {t('marketing.technician-compare.compare-count', { count: techs.length })}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-right">
                    {t('marketing.technician-compare.feature-column')}
                  </th>
                  {techs.map((tech) => (
                    <th key={tech.id} className="p-3 text-center">
                      <span className="text-2xl block">{tech.emoji}</span>
                      {tech.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 text-text-secondary">
                    {t('marketing.technician-compare.row-rating')}
                  </td>
                  {techs.map((tech) => (
                    <td key={tech.id} className="p-3 text-center font-bold">
                      {tech.rating}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-text-secondary">
                    {t('marketing.technician-compare.row-reviews')}
                  </td>
                  {techs.map((tech) => (
                    <td key={tech.id} className="p-3 text-center">
                      {tech.reviews}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-text-secondary">
                    {t('marketing.technician-compare.row-price')}
                  </td>
                  {techs.map((tech) => (
                    <td key={tech.id} className="p-3 text-center font-bold text-brand-600">
                      {t('marketing.technician-compare.price-sar', { price: tech.price })}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-text-secondary">
                    {t('marketing.technician-compare.row-city')}
                  </td>
                  {techs.map((tech) => (
                    <td key={tech.id} className="p-3 text-center">
                      {tech.city}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-text-secondary">
                    {t('marketing.technician-compare.row-experience')}
                  </td>
                  {techs.map((tech) => (
                    <td key={tech.id} className="p-3 text-center">
                      {t(tech.experience)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-text-secondary">
                    {t('marketing.technician-compare.row-services')}
                  </td>
                  {techs.map((tech) => (
                    <td key={tech.id} className="p-3 text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {tech.services.map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-surface-muted px-2 py-0.5 text-xs"
                          >
                            {t(s)}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                {(Object.keys(DIMS) as DimKey[]).map((k) => (
                  <tr key={k} className="border-b">
                    <td className="p-3 text-text-secondary">{t(DIMS[k])}</td>
                    {techs.map((tech) => (
                      <td key={tech.id} className="p-3">
                        <div className="h-2 bg-surface-muted rounded-full">
                          <div
                            className="h-2 bg-brand-600 rounded-full"
                            style={{ width: `${tech.features[k]}%` }}
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
