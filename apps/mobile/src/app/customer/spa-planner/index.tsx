import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface SpaService {
  id?: number;
  emoji?: string;
  nameAr?: string;
  duration?: string;
  price?: number;
}

export default function SpaPlannerScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const servicesQ = trpc.spaPlanner.services.useQuery();
  const data: SpaService[] = (servicesQ.data as unknown as SpaService[] | undefined) ?? [];
  if (servicesQ.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={servicesQ.isRefetching}
          onRefresh={() => servicesQ.refetch()}
          colors={['#0891b2']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.spaPlanner.title')}</Text>
      {data.map((s, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{s.emoji ?? '‍️'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{s.nameAr}</Text>
            <Text style={styles.dur}>
              {t('mobile.spaPlanner.duration-price', {
                duration: s.duration ?? '',
                price: s.price?.toLocaleString(locale === 'en' ? 'en-GB' : 'ar-SA') ?? '',
              })}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  emoji: { fontSize: 28 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  dur: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
