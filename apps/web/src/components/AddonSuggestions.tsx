'use client';

import { formatCurrency } from '@galaxy/ui';

interface Addon {
  id: number;
  title: string;
  price: number;
  emoji: string;
}

// Contextual add-ons based on main service type
const ADDONS_BY_CATEGORY: Record<string, Addon[]> = {
  hair: [
    { id: 1, title: 'علاج الشعر العميق', price: 50, emoji: '‍️' },
    { id: 2, title: 'سيروم لمعان', price: 30, emoji: '' },
    { id: 3, title: 'تصفيف إضافي', price: 40, emoji: '‍️' },
  ],
  makeup: [
    { id: 4, title: 'تركيب رموش', price: 60, emoji: '️' },
    { id: 5, title: 'تحديد حواجب', price: 35, emoji: '' },
    { id: 6, title: 'مكياج مقاوم للماء', price: 25, emoji: '' },
  ],
  nails: [
    { id: 7, title: 'طلاء جيل', price: 40, emoji: '' },
    { id: 8, title: 'نقش أظافر', price: 30, emoji: '' },
    { id: 9, title: 'علاج أظافر', price: 25, emoji: '' },
  ],
  skin: [
    { id: 10, title: 'ماسك وجه', price: 45, emoji: '' },
    { id: 11, title: 'تقشير كيميائي', price: 80, emoji: '' },
    { id: 12, title: 'واقي شمس', price: 20, emoji: '️' },
  ],
  default: [
    { id: 13, title: 'مساج سريع (١٥ دقيقة)', price: 40, emoji: '‍️' },
    { id: 14, title: 'مشروب ترحيبي', price: 15, emoji: '' },
  ],
};

interface AddonSuggestionsProps {
  category?: string;
  onSelect: (addon: Addon) => void;
  selected: number[];
}

export function AddonSuggestions({
  category,
  onSelect,
  selected,
}: AddonSuggestionsProps): JSX.Element {
  const addons = ADDONS_BY_CATEGORY[category || 'default'] || ADDONS_BY_CATEGORY['default']!;

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
         أضيفي إلى حجزكِ
      </h4>
      <div className="grid gap-2 sm:grid-cols-2">
        {addons.map((a) => {
          const isSelected = selected.includes(a.id);
          return (
            <button
              key={a.id}
              onClick={() => onSelect(a)}
              className={`flex items-center gap-3 rounded-xl border-2 p-3 text-right transition-all ${
                isSelected
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950'
                  : 'border-gray-200 hover:border-brand-300 dark:border-gray-700'
              }`}
            >
              <span className="text-2xl">{a.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {a.title}
                </p>
                <p className="text-xs font-bold text-brand-600">+{formatCurrency(a.price)}</p>
              </div>
              {isSelected && <span className="text-brand-600 text-sm"></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
