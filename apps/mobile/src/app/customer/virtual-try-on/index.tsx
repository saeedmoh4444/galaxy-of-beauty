import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface TryOnProduct {
  id?: number;
  hex?: string;
  nameAr?: string;
}

export default function VirtualTryOnScreen(): JSX.Element {
  const { t } = useLocale();
  const palettesQ = trpc.virtualTryOn.palettes.useQuery();
  const data = Object.values(palettesQ.data ?? {}).flat() as unknown as TryOnProduct[];
  if (palettesQ.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={palettesQ.isRefetching}
          onRefresh={() => palettesQ.refetch()}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.virtualTryOn.title')}</Text>
      <Text style={styles.sub}>{t('mobile.virtualTryOn.subtitle')}</Text>
      {data.map((p, i) => (
        <TouchableOpacity key={i} style={styles.card}>
          <View style={[styles.swatch, { backgroundColor: p.hex }]} />
          <Text style={styles.name}>{p.nameAr}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  swatch: { width: 40, height: 40, borderRadius: 20 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
});
