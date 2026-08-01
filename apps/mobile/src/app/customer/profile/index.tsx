import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function CustomerProfileScreen(): JSX.Element {
  const { data: user, loading, error, refreshing, refetch, refresh } = useQuery(() => trpc.users.getMe.query());
  if (loading) return <SkeletonList count={3} />;
  if (error) return <ErrorAlert message="فشل تحميل الملف الشخصي" onRetry={refetch} />;
  if (!user) return <Text style={styles.e}>لا يوجد ملف</Text>;
  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#7c3aed']} />}>
      <Text style={styles.t}>👤 الملف الشخصي</Text>
      <View style={styles.card}><Text style={styles.name}>{user.name as string}</Text><Text style={styles.email}>{user.email as string}</Text>{user.phone && <Text style={styles.phone}>📱 {user.phone as string}</Text>}</View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#f9fafb', borderRadius: 16, padding: 20, alignItems: 'center' },
  name: { fontSize: 22, fontWeight: '700', color: '#111827' }, email: { fontSize: 14, color: '#6b7280', marginTop: 8 }, phone: { fontSize: 14, color: '#6b7280', marginTop: 4 },
});
