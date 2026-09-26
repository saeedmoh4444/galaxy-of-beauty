import type { JSX } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

interface BundleService {
  id?: number;
  titleJson?: { ar?: string; en?: string };
  basePrice?: number | string;
  durationMin?: number;
}

interface BundleDetail {
  id?: number;
  titleJson?: { ar?: string; en?: string };
  descriptionJson?: { ar?: string; en?: string } | null;
  services?: BundleService[];
  discountPct?: number;
  originalPrice?: number | string;
  totalPrice?: number | string;
  validUntil?: string | null;
}

const num = (v: number | string | undefined): number => Number(v) || 0;

// 1.2 Service Bundles — detail (mobile mirror of /bundles/[id]): included
// services in execution order and the Book CTA that preseeds the booking
// wizard (?beautyBundleId=).
export default function BundleDetailScreen(): JSX.Element {
  const router = useRouter();
  const { t, locale } = useLocale();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Number(params.id) || 0;
  const q = trpc.beautyBundles.get.useQuery({ id }, { enabled: id > 0, retry: false });
  const bundle = q.data as unknown as BundleDetail | null;

  if (q.isLoading)
    return <ActivityIndicator color="#db2777" style={{ marginTop: 40 }} size="large" />;
  if (!bundle) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>{t('bundles.empty')}</Text>
      </View>
    );
  }

  const services = bundle.services ?? [];
  const original = num(bundle.originalPrice);
  const total = num(bundle.totalPrice);
  const savings = Math.round((original - total) * 100) / 100;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{localize(bundle.titleJson, locale)}</Text>
      {bundle.descriptionJson ? (
        <Text style={styles.d}>{localize(bundle.descriptionJson, locale)}</Text>
      ) : null}

      {/* Price story */}
      <View style={styles.priceCard}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>{t('bundles.original')}</Text>
          <Text style={styles.priceOrig}>
            {original.toFixed(0)} {t('misc.sar')}
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>{t('bundles.total')}</Text>
          <Text style={styles.priceTotal}>
            {total.toFixed(0)} {t('misc.sar')}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {t('bundles.discount', { pct: bundle.discountPct ?? 0 })}
          </Text>
        </View>
        <Text style={styles.savings}>
          {t('bundles.saveLabel')} {savings.toFixed(0)} {t('misc.sar')}
        </Text>
      </View>

      {/* Included services, in execution order */}
      <Text style={styles.section}>{t('bundles.included')}</Text>
      {services.map((s, i) => (
        <View key={s.id ?? i} testID="bundle-service-row" style={styles.row}>
          <Text style={styles.rowTitle}>
            <Text style={styles.rowNum}>{i + 1}</Text> {localize(s.titleJson, locale)}
          </Text>
          <Text style={styles.rowMeta}>
            {num(s.basePrice).toFixed(0)} {t('misc.sar')} · {s.durationMin} {t('misc.min')}
          </Text>
        </View>
      ))}
      <Text style={styles.note}>{t('bundles.sequentialNote')}</Text>
      {bundle.validUntil ? (
        <Text style={styles.valid}>
          {t('bundles.validUntil', {
            date: new Date(bundle.validUntil).toLocaleDateString(
              locale === 'ar' ? 'ar-SA' : 'en-GB',
            ),
          })}
        </Text>
      ) : null}

      <TouchableOpacity
        testID="bundle-book-cta"
        style={styles.cta}
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: '/customer/bookings/create',
            params: { beautyBundleId: String(bundle.id) },
          })
        }
      >
        <Text style={styles.ctaText}>{t('bundles.book')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'right' },
  d: { fontSize: 13, color: '#6b7280', marginTop: 6, textAlign: 'right' },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  priceLabel: { fontSize: 13, color: '#6b7280' },
  priceOrig: { fontSize: 14, color: '#9ca3af', textDecorationLine: 'line-through' },
  priceTotal: { fontSize: 20, fontWeight: '800', color: '#db2777' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#15803d' },
  savings: { fontSize: 12, fontWeight: '600', color: '#15803d', marginTop: 6, textAlign: 'right' },
  section: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
    marginTop: 20,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
  },
  rowTitle: { flex: 1, fontSize: 14, color: '#111827', textAlign: 'right' },
  rowNum: { fontSize: 12, fontWeight: '700', color: '#db2777' },
  rowMeta: { fontSize: 12, color: '#6b7280', marginStart: 8 },
  note: { fontSize: 11, color: '#9ca3af', marginTop: 8, textAlign: 'right' },
  valid: { fontSize: 12, color: '#b45309', marginTop: 4, textAlign: 'right' },
  cta: {
    backgroundColor: '#db2777',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  ctaText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  missing: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  missingText: { fontSize: 14, color: '#6b7280' },
});
