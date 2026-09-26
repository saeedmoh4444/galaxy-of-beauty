// 1.2 Service Bundles — catalog, detail, and booking preselection.

export const bundlesMessages = {
  'bundles.title': { ar: 'باقات الخدمات', en: 'Service Bundles' },
  'bundles.subtitle': { ar: 'باقات مجمّعة بسعر أوفر', en: 'Curated packages at a better price' },
  'bundles.empty': { ar: 'لا توجد باقات متاحة حالياً', en: 'No bundles available right now' },
  'bundles.servicesCount': { ar: '{count} خدمات', en: '{count} services' },
  'bundles.saveLabel': { ar: 'وفّري', en: 'Save' },
  'bundles.included': { ar: 'الخدمات المشمولة', en: 'Included services' },
  'bundles.book': { ar: 'احجزي الباقة', en: 'Book this bundle' },
  'bundles.validUntil': { ar: 'صالحة حتى {date}', en: 'Valid until {date}' },
  'bundles.selectedBanner': { ar: 'باقة مختارة: {name}', en: 'Selected bundle: {name}' },
  'bundles.original': { ar: 'السعر الأصلي', en: 'Original price' },
  'bundles.total': { ar: 'سعر الباقة', en: 'Bundle price' },
  'bundles.discount': { ar: 'خصم {pct}%', en: '{pct}% off' },
  'bundles.sequentialNote': {
    ar: 'تُنفَّذ الخدمات بالترتيب في موعد واحد',
    en: 'Services run in order within one appointment',
  },
} as const;
