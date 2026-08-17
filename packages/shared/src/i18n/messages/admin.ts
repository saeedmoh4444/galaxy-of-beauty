// Admin + technician tooling strings. Populated by the admin/tech
// translation sweep (X5). Keep keys kebab-cased and grouped by page.

export const adminMessages = {
  'admin.title': { ar: 'لوحة الإدارة', en: 'Admin Panel' },
  'admin.backToStore': { ar: 'العودة للمتجر', en: 'Back to Store' },

  'nav.admin.giftCards': { ar: 'بطاقات الهدية', en: 'Gift Cards' },
  'nav.admin.packages': { ar: 'الباقات', en: 'Packages' },
  'nav.admin.campaigns': { ar: 'الحملات', en: 'Campaigns' },
  'nav.admin.blog': { ar: 'المدونة', en: 'Blog' },
  'nav.admin.monitoring': { ar: 'مراقبة المنصة', en: 'Monitoring' },
  'nav.admin.featureFlags': { ar: 'إدارة الخصائص', en: 'Feature Flags' },
  'nav.admin.auditLog': { ar: 'سجل التدقيق', en: 'Audit Log' },
  'nav.admin.reports': { ar: 'التقارير', en: 'Reports' },
} as const satisfies Record<string, { ar: string; en: string }>;
