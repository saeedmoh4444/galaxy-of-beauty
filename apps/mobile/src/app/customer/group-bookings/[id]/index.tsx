import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';

const THEME_EMOJI: Record<string, string> = { bridal: '👰', birthday: '🎂', girls_night: '🌙', family: '👨‍👩‍👧‍👦', other: '🎉' };
const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'قيد الانتظار', color: '#d97706', bg: '#fef3c7' },
  CONFIRMED: { label: 'مؤكد', color: '#059669', bg: '#dcfce7' },
  IN_PROGRESS: { label: 'جاري', color: '#2563eb', bg: '#dbeafe' },
  COMPLETED: { label: 'مكتمل', color: '#6b7280', bg: '#f3f4f6' },
  CANCELLED: { label: 'ملغي', color: '#dc2626', bg: '#fee2e2' },
};

export default function GroupBookingDetailScreen(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).groupBookings.get.query({ id: parseInt(id, 10) }) as any)
      .then((d: any) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;
  if (!data) return <View style={styles.c}><Text style={styles.e}>تعذر تحميل التفاصيل</Text></View>;

  const status = STATUS_MAP[data.status as string] ?? { label: 'غير معروف', color: '#6b7280', bg: '#f3f4f6' };

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{THEME_EMOJI[data.theme as string] ?? '🎉'} {data.name as string}</Text>
      <View style={[styles.statusBadge, {backgroundColor: status.bg}]}><Text style={[styles.statusText, {color: status.color}]}>{status.label}</Text></View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 المبلغ الإجمالي</Text>
        <Text style={styles.totalAmount}>{(data.totalAmount as number)?.toLocaleString()} ر.س</Text>
        <Text style={styles.discount}>خصم المجموعة: {data.discountPercent as number}%</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 الأعضاء</Text>
        {(data.members as any[])?.map((m: any) => (
          <View key={m.id} style={styles.member}>
            <Text style={styles.memberName}>{m.name as string}</Text>
            <View style={[styles.memberBadge, {backgroundColor: STATUS_MAP[m.status as string]?.bg ?? '#f3f4f6'}]}>
              <Text style={[styles.memberBadgeText, {color: STATUS_MAP[m.status as string]?.color ?? '#6b7280'}]}>{STATUS_MAP[m.status as string]?.label ?? '—'}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 22, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 12 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  statusBadge: { alignSelf: 'center', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 16 },
  statusText: { fontSize: 14, fontWeight: '700' },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  totalAmount: { fontSize: 28, fontWeight: '800', color: '#7c3aed' },
  discount: { fontSize: 12, color: '#059669', marginTop: 4 },
  member: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  memberName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  memberBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  memberBadgeText: { fontSize: 11, fontWeight: '600' },
});
