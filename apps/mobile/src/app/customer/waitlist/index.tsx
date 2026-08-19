import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface WaitlistEntry {
  id?: number;
  serviceName?: string;
  position?: number;
}

export default function WaitlistScreen(): JSX.Element {
  const { t } = useLocale();
  const entriesQ = trpc.waitlist.listMyEntries.useQuery();
  const data: WaitlistEntry[] = (entriesQ.data as unknown as WaitlistEntry[] | undefined) ?? [];
  if (entriesQ.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={entriesQ.isRefetching}
          onRefresh={() => entriesQ.refetch()}
          colors={['#f59e0b']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.waitlist.title')}</Text>
      {data.map((w, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.emoji}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{w.serviceName}</Text>
            <Text style={styles.pos}>
              {t('mobile.waitlist.position', { position: w.position ?? 0 })}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
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
  pos: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
