import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { useState } from 'react';

export default function DisputesScreen(): JSX.Element {
  const { data, loading, error, refreshing, refetch, refresh } = useQuery(() => (trpc as any).disputes.list.query({}));
  const [showCreate, setShowCreate] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [reason, setReason] = useState('');

  if (loading) return <SkeletonList count={5} />;
  if (error) return <ErrorAlert message="فشل تحميل النزاعات" onRetry={refetch} />;

  const items = (data ?? []) as Record<string, unknown>[];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#dc2626']} />}>
      <Text style={styles.t}>⚖️ النزاعات</Text>
      <TouchableOpacity onPress={() => setShowCreate(!showCreate)} style={styles.addBtn}><Text style={styles.addBt}>+ نزاع جديد</Text></TouchableOpacity>

      {showCreate && (
        <View style={styles.form}>
          <TextInput value={bookingId} onChangeText={setBookingId} placeholder="رقم الحجز" style={styles.inp} placeholderTextColor="#9ca3af" keyboardType="numeric" />
          <TextInput value={reason} onChangeText={setReason} placeholder="سبب النزاع" style={[styles.inp, styles.ta]} placeholderTextColor="#9ca3af" multiline />
          <TouchableOpacity style={styles.submitBtn}><Text style={styles.submitBt}>تقديم</Text></TouchableOpacity>
        </View>
      )}

      {items.length === 0 ? <Text style={styles.e}>لا توجد نزاعات</Text> :
        items.map((d: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <View style={styles.sr}>
              <Text style={styles.dr}>{d.reason as string}</Text>
              <View style={[styles.db, (d.status as string) === 'PENDING' ? styles.dp : (d.status as string) === 'RESOLVED' ? styles.dres : {}]}>
                <Text style={styles.dbt}>{(d.status as string) === 'PENDING' ? 'معلق' : (d.status as string) === 'RESOLVED' ? 'محلول' : (d.status as string)}</Text>
              </View>
            </View>
            <Text style={styles.dd}>{new Date(d.createdAt as string).toLocaleDateString('ar-SA')}</Text>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 16 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  addBtn: { backgroundColor: '#dc2626', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 16 },
  addBt: { color: '#fff', fontSize: 14, fontWeight: '600' },
  form: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 16 },
  inp: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 8, fontSize: 14, color: '#111827' },
  ta: { height: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#dc2626', borderRadius: 10, padding: 12, alignItems: 'center' }, submitBt: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  sr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, dr: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  db: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#f3f4f6' }, dp: { backgroundColor: '#fef3c7' }, dres: { backgroundColor: '#dcfce7' },
  dbt: { fontSize: 11, fontWeight: '600' }, dd: { fontSize: 12, color: '#9ca3af', marginTop: 8 },
});
