import type { JSX } from 'react';
import { Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

/**
 * Admin hub — M7 nav-hub expansion.
 *
 * Admin login lands on /admin/dashboard, which only linked to five screens.
 * This index makes every /admin/* screen reachable. Labels reuse each
 * destination screen's own title key (no new i18n keys).
 */
interface AdminLink {
  href: string;
  key: TranslationKey;
}

const ADMIN_LINKS: AdminLink[] = [
  // --- overview & reporting ---
  { href: '/admin/dashboard', key: 'mobile.admin.dashboard.title' },
  { href: '/admin/analytics', key: 'mobile.admin.analytics.title' },
  { href: '/admin/analytics-v2', key: 'admin.analytics-v2.title' },
  { href: '/admin/reports', key: 'admin.reports.title' },
  { href: '/admin/monitoring', key: 'mobile.admin.monitoring.title' },
  { href: '/admin/predictive-demand', key: 'admin.predictive-demand.title' },
  // --- people & operations ---
  { href: '/admin/users', key: 'mobile.admin.users.title' },
  { href: '/admin/bookings', key: 'mobile.admin.bookings.title' },
  { href: '/admin/technicians', key: 'mobile.admin.technicians.title' },
  { href: '/admin/group-bookings', key: 'mobile.admin.group-bookings.title' },
  { href: '/admin/areas', key: 'mobile.admin.areas.title' },
  { href: '/admin/disputes', key: 'mobile.admin.disputes.title' },
  // --- catalog & content ---
  { href: '/admin/services', key: 'mobile.admin.services.title' },
  { href: '/admin/categories', key: 'mobile.admin.categories.title' },
  { href: '/admin/packages', key: 'admin.packages.title' },
  { href: '/admin/cms', key: 'admin.cms.title' },
  { href: '/admin/blog', key: 'admin.blog.title' },
  { href: '/admin/beauty-events', key: 'mobile.admin.beauty-events.title' },
  // --- marketing & growth ---
  { href: '/admin/campaigns', key: 'admin.campaigns.title' },
  { href: '/admin/promo', key: 'mobile.admin.promo.title' },
  { href: '/admin/flash-deals', key: 'mobile.admin.flash-deals.title' },
  { href: '/admin/gift-cards', key: 'admin.gift-cards.title' },
  { href: '/admin/loyalty', key: 'mobile.admin.loyalty.title' },
  { href: '/admin/cashback', key: 'admin.cashback.title' },
  { href: '/admin/subscriptions', key: 'mobile.admin.subscriptions.title' },
  // --- finance ---
  { href: '/admin/finance', key: 'mobile.admin.finance.title' },
  { href: '/admin/payouts', key: 'admin.payouts.title' },
  { href: '/admin/zatca', key: 'mobile.admin.zatca.title' },
  // --- system ---
  { href: '/admin/admin-tools', key: 'mobile.admin.admin-tools.title' },
  { href: '/admin/ai-features', key: 'mobile.admin.ai-features.title' },
  { href: '/admin/feature-flags', key: 'mobile.admin.feature-flags.title' },
  { href: '/admin/audit-log', key: 'admin.audit-log.title' },
  { href: '/admin/settings', key: 'mobile.admin.settings.title' },
];

export default function AdminHubScreen(): JSX.Element {
  const router = useRouter();
  const { t } = useLocale();

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.title}>{t('mobile.admin.dashboard.title')}</Text>
      {ADMIN_LINKS.map((link) => (
        <TouchableOpacity
          key={link.href}
          style={styles.row}
          onPress={() => router.push(link.href as never)}
          testID={`admin-link-${link.href.replace(/\//g, '-')}`}
        >
          <Text style={styles.rowLabel}>{t(link.key)}</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f5f3ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4f46e5',
    textAlign: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 6,
  },
  rowLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  rowArrow: { fontSize: 20, color: '#9ca3af' },
});
