import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@galaxy/shared';

const STATUS_TABS = ['ALL', 'REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const STATUS_LABELS: Record<string, string> = {
  ALL: 'الكل', REQUESTED: 'قيد الطلب', ACCEPTED: 'مقبول', IN_PROGRESS: 'قيد التنفيذ', COMPLETED: 'مكتمل', CANCELLED: 'ملغي',
};
const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  COMPLETED: { color: '#059669', bg: '#dcfce7' },
  CANCELLED: { color: '#dc2626', bg: '#fee2e2' },
  REJECTED: { color: '#dc2626', bg: '#fee2e2' },
  REQUESTED: { color: '#d97706', bg: '#fef3c7' },
  ACCEPTED: { color: '#2563eb', bg: '#dbeafe' },
  IN_PROGRESS: { color: '#7c3aed', bg: '#ede9fe' },
};

export default function BookingsScreen(): JSX.Element {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [cancelId, setCancelId] = useState<number | null>(null);

  const { data, loading, error, refreshing, refetch, refresh } = useQuery(
    () => (trpc.bookings.list as any).query({ status, page: 1, limit: DEFAULT_PAGE_SIZE }),
  );

  const cancel = () => {
    if (!cancelId) return;
    (trpc.bookings.transition as any).mutate({ id: cancelId, action: 'cancel' }).then(() => { setCancelId(null); refetch(); });
  };

  if (loading) return <View style={styles.c}><SkeletonList count={5} /></View>;
  if (error) return <ErrorAlert message="فشل تحميل الحجوزات" onRetry={refetch} />;

  const bookings = ((data as any)?.bookings ?? []) as any[];

  return (
    <View style={styles.c}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {STATUS_TABS.map((s) => {
          const active = (s === 'ALL' && !status) || s === status;
          return (
            <TouchableOpacity key={s} onPress={() => setStatus(s === 'ALL' ? undefined : s)} style={[styles.tab, active && styles.tabActive]}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{STATUS_LABELS[s] ?? s}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <ScrollView style={{flex:1}} contentContainerStyle={styles.i}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#ec4899']} />}
      >
        <Text style={styles.t}>📅 حجوزاتي</Text>
        {bookings.length === 0 ? <Text style={styles.e}>لا توجد حجوزات</Text> :
          bookings.map((b: any) => {
            const sc = STATUS_COLORS[b.status as string] ?? { color: '#6b7280', bg: '#f3f4f6' };
            return (
              <View key={b.id} style={styles.card}>
                <View style={{flex:1}}>
                  <Text style={styles.code}>{b.bookingCode as string}</Text>
                  <Text style={styles.date}>{new Date(b.startAt as string).toLocaleDateString('ar-SA')}</Text>
                </View>
                <View style={[styles.statusBadge, {backgroundColor: sc.bg}]}>
                  <Text style={[styles.statusText, {color: sc.color}]}>{b.status as string}</Text>
                </View>
                {(b.status === 'REQUESTED' || b.status === 'ACCEPTED') && (
                  <TouchableOpacity onPress={() => setCancelId(b.id as number)} style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>إلغاء</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        }
      </ScrollView>

      {cancelId !== null && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>تأكيد الإلغاء</Text>
            <Text style={styles.modalText}>هل أنت متأكد من إلغاء هذا الحجز؟</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setCancelId(null)} style={styles.modalBackBtn}><Text style={styles.modalBackText}>رجوع</Text></TouchableOpacity>
              <TouchableOpacity onPress={cancel} style={styles.modalConfirmBtn}><Text style={styles.modalConfirmText}>تأكيد الإلغاء</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 10, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 16 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  tabs: { maxHeight: 50, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 6, backgroundColor: '#f3f4f6' },
  tabActive: { backgroundColor: '#db2777' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#6b7280' }, tabTextActive: { color: '#fff' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  code: { fontSize: 14, fontWeight: '600', color: '#111827', fontFamily: 'monospace' },
  date: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  statusBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cancelBtn: { backgroundColor: '#fee2e2', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  cancelBtnText: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  modal: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  modalText: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalBackBtn: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, padding: 14, alignItems: 'center' },
  modalBackText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  modalConfirmBtn: { flex: 1, backgroundColor: '#dc2626', borderRadius: 12, padding: 14, alignItems: 'center' },
  modalConfirmText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
