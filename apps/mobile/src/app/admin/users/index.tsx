import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface AdminUserItem {
  name?: string;
  email?: string;
  role?: string;
}

interface AdminUsersResponse {
  items?: AdminUserItem[];
}

export default function AdminUsersScreen(): JSX.Element {
  const { t } = useLocale();
  const q = trpc.admin.listCustomers.useQuery({});
  const data = (q.data as unknown as AdminUsersResponse | null)?.items ?? [];

  if (q.isLoading) return <SkeletonList count={6} />;
  if (q.isError)
    return <ErrorAlert message={t('admin.users.load-error')} onRetry={() => q.refetch()} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#6366f1']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.admin.users.title')}</Text>
      {data.map((u, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.avatar}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{u.name}</Text>
            <Text style={styles.email}>{u.email}</Text>
          </View>
          <Text style={styles.role}>{u.role}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  avatar: { fontSize: 28 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  email: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  role: { fontSize: 12, fontWeight: '600', color: '#4f46e5' },
});
