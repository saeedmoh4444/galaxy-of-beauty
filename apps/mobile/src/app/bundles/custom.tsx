/**
 * Custom-bundle wizard (audit stage 12) — mobile mirror of the web
 * /bundles/custom builder (2-5 services, 10/15/20/25% tiers). The CTA
 * persists the selection via beautyBundles.createCustom (server-computed
 * prices) and hands the result to booking create as ?beautyBundleId=.
 */
import { useState } from 'react';
import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

const BUNDLE_DISCOUNTS: Record<number, number> = { 2: 10, 3: 15, 4: 20, 5: 25 };

interface WizardService {
  id: number;
  titleJson?: { ar?: string; en?: string };
  durationMin?: number;
  basePrice?: number;
  services?: WizardService[];
  children?: unknown[];
}

export default function CustomBundleWizard(): JSX.Element {
  const { locale, t } = useLocale();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState(false);
  const catsQ = trpc.categories.list.useQuery(undefined, { retry: false });
  const createMut = trpc.beautyBundles.createCustom.useMutation({
    onSuccess: (data) => {
      router.replace({
        pathname: '/customer/bookings/create',
        params: { beautyBundleId: String(data.bundleId) },
      });
    },
    onError: () => setError(true),
  });

  if (catsQ.isLoading) return <SkeletonList count={6} />;

  const categories = (catsQ.data ?? []) as unknown as Array<{
    services?: WizardService[];
    children?: Array<{ services?: WizardService[] }>;
  }>;

  const services: WizardService[] = [];
  for (const cat of categories) {
    for (const svc of cat.services ?? []) services.push(svc);
    for (const child of cat.children ?? []) {
      for (const svc of child.services ?? []) services.push(svc);
    }
  }

  const toggle = (id: number) => {
    setError(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 5) {
        next.add(id);
      }
      return next;
    });
  };

  const count = selected.size;
  const discount = BUNDLE_DISCOUNTS[count] ?? 0;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{t('marketing.bundles.title')}</Text>
      <Text style={styles.sub}>{t('marketing.bundles.subtitle')}</Text>

      <View style={styles.tierRow}>
        {[2, 3, 4, 5].map((n) => (
          <View
            key={n}
            style={[styles.tierChip, count >= n && styles.tierChipActive]}
            testID={`tier-${n}`}
          >
            <Text style={[styles.tierText, count >= n && styles.tierTextActive]}>
              {t('marketing.bundles.discount-formula', {
                n,
                percent: BUNDLE_DISCOUNTS[n] ?? 0,
              })}
            </Text>
          </View>
        ))}
      </View>

      {count > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            {t('marketing.bundles.services-count-label')} {count} ·{' '}
            {t('marketing.bundles.discount-label')} -{discount}%
          </Text>
        </View>
      )}

      {services.slice(0, 30).map((svc) => {
        const isSelected = selected.has(svc.id);
        return (
          <Pressable
            key={svc.id}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => toggle(svc.id)}
            testID={`wizard-service-${svc.id}`}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{localize(svc.titleJson, locale) ?? ''}</Text>
              <Text style={styles.meta}>
                {t('marketing.bundles.duration-min', { min: svc.durationMin ?? 0 })}
              </Text>
              <Text style={styles.price}>
                {Number(svc.basePrice ?? 0)} {t('misc.sar')}
              </Text>
            </View>
            <View style={[styles.check, isSelected && styles.checkSelected]}>
              {isSelected ? <Text style={styles.checkMark}>✓</Text> : null}
            </View>
          </Pressable>
        );
      })}

      {count >= 2 && (
        <Pressable
          style={styles.cta}
          disabled={createMut.isPending}
          onPress={() => createMut.mutate({ serviceIds: [...selected] })}
          testID="bundle-create-cta"
        >
          <Text style={styles.ctaText}>{t('marketing.bundles.book-cta', { discount })}</Text>
        </Pressable>
      )}
      {error ? <Text style={styles.errorText}>{t('state.error')}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 22, fontWeight: '800', color: '#7c3aed', textAlign: 'center' },
  sub: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginTop: 6 },
  tierRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 16 },
  tierChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  tierChipActive: { backgroundColor: '#dcfce7' },
  tierText: { fontSize: 11, fontWeight: '700', color: '#6b7280' },
  tierTextActive: { color: '#15803d' },
  summaryRow: { marginTop: 12, alignItems: 'center' },
  summaryText: { fontSize: 14, fontWeight: '700', color: '#15803d' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#f3f4f6',
    padding: 14,
    marginTop: 10,
  },
  cardSelected: { borderColor: '#7c3aed', backgroundColor: '#f5f3ff' },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  price: { fontSize: 13, fontWeight: '700', color: '#7c3aed', marginTop: 4 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSelected: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '800' },
  cta: {
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  errorText: { color: '#dc2626', fontSize: 13, textAlign: 'center', marginTop: 10 },
});
