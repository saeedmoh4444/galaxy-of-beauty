'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton } from '@galaxy/shared';

export default function BeautyFaqPage(): JSX.Element {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  const { data: cats } = api.beautyFaq.categories.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const { data, isLoading } = api.beautyFaq.search.useQuery({ query: search || undefined, category }) as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };

  const categories = (cats ?? []) as Array<Record<string,unknown>>;
  const faqs = (data ?? []) as Array<Record<string,unknown>>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center"><span className="text-6xl">🤖</span><h1 className="mt-4 text-3xl font-bold">Beauty FAQ</h1><p className="mt-2 text-text-secondary">أجوبة على أسئلتكِ عن الجمال والعناية</p></div>

      <div className="flex gap-2 mb-6">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setSearch(query.trim())} placeholder="🔍 ابحثي عن سؤال..." className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
        <button onClick={() => setSearch(query.trim())} className="rounded-lg bg-brand-600 px-4 py-2 text-white text-sm">بحث</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setCategory(undefined)} className={`rounded-full px-3 py-1 text-xs ${!category ? 'bg-brand-600 text-white' : 'bg-surface-muted dark:bg-gray-800'}`}>الكل</button>
        {categories.map((c: Record<string,unknown>) => (
          <button key={c.key as string} onClick={() => setCategory(c.key as string)} className={`rounded-full px-3 py-1 text-xs ${category === c.key ? 'bg-brand-600 text-white' : 'bg-surface-muted dark:bg-gray-800'}`}>{c.emoji as string} {c.nameAr as string}</button>
        ))}
      </div>

      {isLoading ? <div className="space-y-3">{Array.from({length:4},(_,i)=><CardSkeleton key={i}/>)}</div> :
        <div className="space-y-3">
          {faqs.map((f: Record<string,unknown>, i: number) => (
            <Card key={i} padding="lg">
              <details className="group">
                <summary className="cursor-pointer font-bold text-text-primary dark:text-gray-100 hover:text-brand-600 transition-colors">{f.q as string}</summary>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">{f.a as string}</p>
              </details>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}
