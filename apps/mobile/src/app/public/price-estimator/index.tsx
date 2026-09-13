import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface EstimatorService {
  id: number;
  emoji?: string;
  nameAr?: string;
  basePrice?: number;
}

interface PriceEstimate {
  basePrice?: number;
  discount?: number;
  total?: number;
}

export default function PriceEstimatorScreen(): JSX.Element {
  const { t } = useLocale();
  const [selected, setSelected] = useState<number | null>(null);
  const [promo] = useState('');
  const servicesQ = trpc.services.list.useQuery({});
  const services: EstimatorService[] =
    (servicesQ.data as unknown as { items?: EstimatorService[] } | undefined)?.items ?? [];
  const estimateQ = trpc.priceEstimator.estimate.useQuery(
    { serviceId: selected ?? 0, promoCode: promo || undefined },
    { enabled: false },
  );
  const estimate = (estimateQ.data as PriceEstimate | undefined) ?? null;
  const getEstimate = () => {
    if (!selected) return;
    void estimateQ.refetch();
  };
  if (servicesQ.isLoading) return <SkeletonList count={5} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={servicesQ.isRefetching}
          onRefresh={() => servicesQ.refetch()}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.price-estimator.title')}</Text>
      {services.map((s) => (
        <TouchableOpacity
          key={s.id}
          onPress={() => {
            setSelected(s.id);
          }}
          style={[styles.sr, selected === s.id && styles.sra]}
        >
          <Text style={styles.se}>{s.emoji ?? ''}</Text>
          <Text style={styles.sn}>{s.nameAr ?? ''}</Text>
          <Text style={styles.sp}>
            {(s.basePrice ?? 0).toLocaleString()} {t('misc.sar')}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        onPress={getEstimate}
        disabled={!selected}
        style={[styles.eb, !selected && { opacity: 0.5 }]}
      >
        <Text style={styles.et}>{t('mobile.public.price-estimator.calculate')}</Text>
      </TouchableOpacity>
      {estimate && (
        <View style={styles.ec}>
          <View style={styles.er}>
            <Text style={styles.el}>{t('mobile.public.price-estimator.base-price')}</Text>
            <Text style={styles.ev}>
              {(estimate.basePrice ?? 0).toLocaleString()} {t('misc.sar')}
            </Text>
          </View>
          {(estimate.discount ?? 0) > 0 && (
            <View style={styles.er}>
              <Text style={styles.el}>{t('mobile.public.price-estimator.discount')}</Text>
              <Text style={[styles.ev, { color: '#059669' }]}>
                -{(estimate.discount ?? 0).toLocaleString()} {t('misc.sar')}
              </Text>
            </View>
          )}
          <View style={styles.ed} />
          <View style={styles.er}>
            <Text style={[styles.el, { fontWeight: '700' }]}>
              {t('mobile.public.price-estimator.total')}
            </Text>
            <Text style={[styles.ev, { fontWeight: '800', fontSize: 20 }]}>
              {(estimate.total ?? 0).toLocaleString()} {t('misc.sar')}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  sr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  sra: { borderColor: '#059669', backgroundColor: '#ecfdf5' },
  se: { fontSize: 24 },
  sn: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111827' },
  sp: { fontSize: 13, fontWeight: '700', color: '#059669' },
  eb: {
    backgroundColor: '#059669',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  et: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ec: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#86efac',
  },
  er: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  el: { fontSize: 14, color: '#374151' },
  ev: { fontSize: 14, fontWeight: '600', color: '#111827' },
  ed: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
});
