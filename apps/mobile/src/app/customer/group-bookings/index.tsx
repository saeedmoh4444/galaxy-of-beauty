import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

const TE: Record<string, string> = {
  bridal: '',
  birthday: '',
  girls_night: '',
  family: '‍‍‍',
  other: '',
};

interface GroupBookingSummary {
  id?: number;
  theme?: string;
  name?: string;
  status?: string;
  members?: unknown[];
  totalAmount?: number;
}

export default function GroupBookingsScreen(): JSX.Element {
  const isAuthed = useAuthState();
  const { t } = useLocale();
  const q = trpc.groupBookings.myGroups.useQuery(undefined, { enabled: isAuthed });
  const groups: GroupBookingSummary[] =
    (q.data as unknown as GroupBookingSummary[] | undefined) ?? [];

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
      <Text style={styles.t}>{t('mobile.groupBookings.title')}</Text>
      {groups.map((g) => (
        <View key={g.id} style={styles.card}>
          <Text style={styles.ge}>{TE[g.theme ?? ''] ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.gn}>{g.name}</Text>
            <Text style={styles.gm}>
              {t('mobile.groupBookings.members-summary', {
                count: g.members?.length ?? 0,
                total: g.totalAmount?.toLocaleString() ?? '',
              })}
            </Text>
          </View>
          <View
            style={[
              styles.sb,
              g.status === 'CONFIRMED' ? styles.sc : g.status === 'PENDING' ? styles.sp : {},
            ]}
          >
            <Text style={styles.st}>
              {g.status === 'CONFIRMED'
                ? t('mobile.groupBookings.status-confirmed')
                : g.status === 'PENDING'
                  ? t('mobile.groupBookings.status-pending')
                  : g.status === 'COMPLETED'
                    ? t('mobile.groupBookings.status-completed')
                    : t('mobile.groupBookings.status-cancelled')}
            </Text>
          </View>
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  ge: { fontSize: 32 },
  gn: { fontSize: 16, fontWeight: '700', color: '#111827' },
  gm: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  sb: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#f3f4f6' },
  sc: { backgroundColor: '#dcfce7' },
  sp: { backgroundColor: '#fef3c7' },
  st: { fontSize: 11, fontWeight: '600', color: '#111827' },
});
