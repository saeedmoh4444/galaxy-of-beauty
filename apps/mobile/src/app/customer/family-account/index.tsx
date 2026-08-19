import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface FamilyMember {
  id?: number;
  name?: string;
  relation?: string;
}

export default function FamilyAccountScreen(): JSX.Element {
  const { t } = useLocale();
  const q = trpc.familyAccount.list.useQuery();
  const data: FamilyMember[] = (q.data as unknown as FamilyMember[] | undefined) ?? [];

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
      <Text style={styles.t}>{t('familyAccount.title')}</Text>
      {data.map((m, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.avatar}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{m.name}</Text>
            <Text style={styles.relation}>{m.relation}</Text>
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
    marginBottom: 8,
  },
  avatar: { fontSize: 32 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  relation: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
