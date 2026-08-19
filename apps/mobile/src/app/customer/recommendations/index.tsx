import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

interface ServiceItem {
  id: number;
  emoji?: string;
  nameAr?: string;
  titleJson?: { ar?: string; en?: string };
}

interface RelatedService {
  id?: number;
  title?: string;
  basePrice?: number;
  durationMin?: number;
  bookedTogether?: number;
}

interface ServiceListData {
  items?: ServiceItem[];
  total?: number;
  page?: number;
}

export default function RecommendationsScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const servicesQ = trpc.services.list.useQuery({});
  const services: ServiceItem[] =
    (servicesQ.data as unknown as ServiceListData | null)?.items ?? [];
  const relatedQ = trpc.recommendations.frequentlyBookedTogether.useQuery(
    { serviceId: selectedId ?? 0 },
    { enabled: !!selectedId },
  );
  const related: RelatedService[] =
    (relatedQ.data as unknown as RelatedService[] | undefined) ?? [];
  const getRelated = (serviceId: number) => {
    setSelectedId(serviceId);
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
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.recommendations.title')}</Text>
      {services.slice(0, 10).map((s) => (
        <TouchableOpacity
          key={s.id}
          onPress={() => getRelated(s.id)}
          style={[styles.sc, selectedId === s.id && styles.sca]}
        >
          <Text style={styles.se}>{s.emoji ?? '‍️'}</Text>
          <Text style={styles.sn}>{s.titleJson ? localize(s.titleJson, locale) : s.nameAr}</Text>
        </TouchableOpacity>
      ))}
      {relatedQ.isFetching && <SkeletonList count={3} />}
      {related.length > 0 && !relatedQ.isFetching && (
        <Text style={styles.st}>{t('mobile.recommendations.booked-together')}</Text>
      )}
      {related.map((r) => (
        <View key={r.id} style={styles.card}>
          <Text style={styles.re}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.rn}>{r.title}</Text>
            <Text style={styles.rp}>
              {t('marketing.compare.price-sar', {
                price: r.basePrice?.toLocaleString(locale === 'en' ? 'en-GB' : 'ar-SA') ?? '',
              })}
            </Text>
          </View>
          <View style={styles.rb}>
            <Text style={styles.rbt}>{r.bookedTogether}x</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  sc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  sca: { borderColor: '#db2777', backgroundColor: '#fdf2f8' },
  se: { fontSize: 26 },
  sn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  re: { fontSize: 24 },
  rn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  rp: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  rb: { backgroundColor: '#fdf2f8', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  rbt: { fontSize: 12, fontWeight: '700', color: '#db2777' },
});
