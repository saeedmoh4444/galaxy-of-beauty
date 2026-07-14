import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export default function TechnicianDashboard() {
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['bookings', 'technician', 'REQUESTED'],
    queryFn: async () => { const { data } = await api.get('/bookings?status=REQUESTED'); return data.bookings; },
  });

  const transition = useMutation({
    mutationFn: ({ id, action }) => api.patch(`/bookings/${id}/status`, { action }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); Alert.alert('تم', 'تم تحديث الحجز'); },
    onError: (err) => Alert.alert('خطأ', err.response?.data?.error?.message || 'فشل التحديث'),
  });

  const bookings = data || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>طلبات الحجز</Text>
        <Text style={styles.count}>{bookings.length} طلب</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(i) => String(i.id)}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد طلبات معلقة</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.code}>{item.bookingCode}</Text>
            <Text style={styles.serviceName}>{item.service?.titleJson?.ar}</Text>
            <Text style={styles.customer}>👤 {item.customer?.name}</Text>
            <Text style={styles.datetime}>📅 {new Date(item.startAt).toLocaleDateString('ar-SA')}  ⏰ {new Date(item.startAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</Text>
            <Text style={styles.amount}>💰 {Number(item.totalAmount).toLocaleString('ar-SA')} ر.س</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.acceptBtn} onPress={() => transition.mutate({ id: item.id, action: 'accept' })}>
                <Text style={styles.acceptText}>قبول ✅</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectBtn} onPress={() => {
                Alert.alert('رفض', 'هل أنت متأكد من رفض الحجز؟', [{ text: 'لا' }, { text: 'نعم', onPress: () => transition.mutate({ id: item.id, action: 'reject' }) }]);
              }}>
                <Text style={styles.rejectText}>رفض ❌</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  count: { fontSize: 14, color: '#6B7280' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10 },
  code: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  serviceName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  customer: { fontSize: 14, color: '#374151', marginBottom: 2 },
  datetime: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  amount: { fontSize: 15, fontWeight: '700', color: '#7C3AED', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 12 },
  acceptBtn: { flex: 1, backgroundColor: '#10B981', padding: 12, borderRadius: 10, alignItems: 'center' },
  acceptText: { color: '#fff', fontWeight: '600' },
  rejectBtn: { flex: 1, backgroundColor: '#FEE2E2', padding: 12, borderRadius: 10, alignItems: 'center' },
  rejectText: { color: '#EF4444', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
});
