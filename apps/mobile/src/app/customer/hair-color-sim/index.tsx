import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface HairColor {
  id?: number;
  hex?: string;
  nameAr?: string;
}

export default function HairColorSimScreen(): JSX.Element {
  const { t } = useLocale();
  const q = trpc.hairColorSim.colors.useQuery();
  const colors: HairColor[] = (q.data as unknown as HairColor[] | undefined) ?? [];

  if (q.isLoading) return <SkeletonList count={5} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.hairColorSim.title')}</Text>
      <Text style={styles.sub}>{t('mobile.hairColorSim.subtitle')}</Text>
      <View style={styles.grid}>
        {colors.map((c, i) => (
          <TouchableOpacity key={i} style={[styles.color, { backgroundColor: c.hex ?? '#ccc' }]}>
            <Text style={styles.colorName}>{c.nameAr ?? ''}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  color: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 10,
  },
  colorName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
