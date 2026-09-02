import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

interface RegistryGift {
  id?: number;
  emoji?: string;
  nameAr?: string;
  price?: number;
}

export default function GiftRegistryScreen(): JSX.Element {
  const isAuthed = useAuthState();
  const { t } = useLocale();
  const q = trpc.giftRegistry.myRegistries.useQuery(undefined, { enabled: isAuthed });
  const data: RegistryGift[] = (q.data as unknown as RegistryGift[] | undefined) ?? [];

  if (q.isLoading) return <SkeletonList count={4} />;

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
      <Text style={styles.t}>{t('mobile.giftRegistry.title')}</Text>
      {data.map((g, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}>{g.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{g.nameAr ?? ''}</Text>
            <Text style={styles.price}>{(g.price ?? 0).toLocaleString()} ر.س</Text>
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
  price: { fontSize: 13, fontWeight: '700', color: '#db2777', marginTop: 2 },
});
