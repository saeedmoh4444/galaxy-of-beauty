import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

interface FollowEntry {
  id?: number;
  technicianId: number;
  createdAt?: string;
}

export default function FollowingScreen(): JSX.Element {
  const isAuthed = useAuthState();
  const { locale, t } = useLocale();
  const q = trpc.technicianFollows.myFollows.useQuery(undefined, { enabled: isAuthed });
  const follows: FollowEntry[] = (q.data as unknown as FollowEntry[] | undefined) ?? [];
  const unfollowMut = trpc.technicianFollows.unfollow.useMutation({
    onSuccess: () => {
      void q.refetch();
    },
  });
  const unfollow = (technicianId: number) => {
    unfollowMut.mutate({ technicianId });
  };
  if (q.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>{t('following.title')}</Text>
      {follows.map((f) => (
        <View key={f.technicianId} style={styles.card}>
          <Text style={styles.av}>‍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>{t('following.technician', { id: f.technicianId })}</Text>
            <Text style={styles.meta}>
              {f.createdAt
                ? t('following.since', {
                    date: new Date(f.createdAt).toLocaleDateString(
                      locale === 'ar' ? 'ar-SA' : 'en-US',
                    ),
                  })
                : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={() => unfollow(f.technicianId)} style={styles.ub}>
            <Text style={styles.ut}>{t('following.unfollow')}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  av: { fontSize: 36 },
  nm: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  ub: { backgroundColor: '#fee2e2', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  ut: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
});
