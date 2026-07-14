import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useUserBookings, useTransitionBooking } from '../hooks/useBooking';

const STATUS_LABELS = { REQUESTED: 'قيد الطلب', ACCEPTED: 'مقبول', PAID: 'مدفوع', COMPLETED: 'مكتمل', CANCELLED: 'ملغي', REJECTED: 'مرفوض' };

export default function CustomerDashboard() {
  const navigation = useNavigation();
  const { data, isLoading, refetch } = useUserBookings();
  const cancelBooking = useTransitionBooking();

  const bookings = data?.bookings || [];
  const pendingCount = bookings.filter((b) => ['REQUESTED', 'ACCEPTED', 'PAID'].includes(b.status)).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>حجوزاتي</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Booking', {})} style={styles.newBtn}>
          <Text style={styles.newBtnText}>+ جديد</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statNum}>{pendingCount}</Text><Text style={styles.statLabel}>نشطة</Text></View>
        <View style={styles.stat}><Text style={styles.statNum}>{bookings.filter((b) => b.status === 'COMPLETED').length}</Text><Text style={styles.statLabel}>مكتملة</Text></View>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(i) => String(i.id)}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد حجوزات</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.code}>{item.bookingCode}</Text>
              <Text style={[styles.status, { color: item.status === 'COMPLETED' ? '#10B981' : item.status === 'CANCELLED' ? '#EF4444' : '#7C3AED' }]}>
                {STATUS_LABELS[item.status] || item.status}
              </Text>
            </View>
            <Text style={styles.serviceName}>{item.service?.titleJson?.ar}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.date}>📅 {new Date(item.startAt).toLocaleDateString('ar-SA')}</Text>
              <Text style={styles.amount}>{Number(item.totalAmount).toLocaleString('ar-SA')} ر.س</Text>
            </View>
            {item.status === 'REQUESTED' && (
              <TouchableOpacity onPress={() => { Alert.alert('تأكيد', 'هل أنت متأكد من إلغاء الحجز؟', [{ text: 'لا' }, { text: 'نعم', onPress: () => cancelBooking.mutate({ bookingId: item.id, status: 'cancel' }) }]); }}>
                <Text style={{ color: '#EF4444', marginTop: 8 }}>إلغاء الحجز</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  newBtn: { backgroundColor: '#7C3AED', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  newBtnText: { color: '#fff', fontWeight: '600' },
  statsRow: { flexDirection: 'row', padding: 16, gap: 12 },
  stat: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  code: { fontSize: 12, color: '#9CA3AF' },
  status: { fontSize: 12, fontWeight: '600' },
  serviceName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  date: { fontSize: 13, color: '#6B7280' },
  amount: { fontSize: 15, fontWeight: '700', color: '#7C3AED' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
});
