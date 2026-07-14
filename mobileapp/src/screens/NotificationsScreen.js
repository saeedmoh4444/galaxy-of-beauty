import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const NOTIF_ICONS = {
  booking_request: '📨', booking_created: '📋', booking_accepted: '✅',
  booking_rejected: '❌', booking_cancelled: '🚫', payment_success: '💳',
  booking_reminder: '⏰', review_request: '⭐',
};

function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return 'الآن';
  if (diffMin < 60) return `قبل ${diffMin} د`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `قبل ${diffHr} س`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `قبل ${diffDay} يوم`;
  return new Date(dateStr).toLocaleDateString('ar-SA');
}

export default function NotificationsScreen() {
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => { const { data } = await api.get('/notifications'); return data; },
    staleTime: 15000,
  });

  const markRead = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAll = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  if (isLoading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}><Text style={styles.headerTitle}>🔔 الإشعارات</Text></View>
        <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔔 الإشعارات</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => markAll.mutate()} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>تعليم الكل ({unreadCount})</Text>
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>{unreadCount} إشعار غير مقروء</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(i) => String(i.id)}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#7C3AED" />}
        contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : { padding: 12 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48 }}>🔔</Text>
            <Text style={styles.empty}>لا توجد إشعارات</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.isRead && styles.unreadCard]}
            onPress={() => !item.isRead && markRead.mutate(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.cardRow}>
              <View style={[styles.iconBox, !item.isRead && styles.iconBoxUnread]}>
                <Text style={{ fontSize: 20 }}>{NOTIF_ICONS[item.type] || '🔔'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={[styles.title, !item.isRead && { fontWeight: '800' }]} numberOfLines={1}>
                    {item.titleJson?.ar}
                  </Text>
                  {!item.isRead && <View style={styles.dot} />}
                </View>
                <Text style={styles.body} numberOfLines={2}>{item.bodyJson?.ar}</Text>
                <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  markAllBtn: { backgroundColor: '#F5F3FF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  markAllText: { color: '#7C3AED', fontWeight: '600', fontSize: 13 },
  unreadBanner: { backgroundColor: '#F5F3FF', paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#EDE9FE' },
  unreadBannerText: { color: '#7C3AED', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  unreadCard: { backgroundColor: '#FAFAFF', borderRightWidth: 3, borderRightColor: '#7C3AED' },
  cardRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  iconBoxUnread: { backgroundColor: '#F5F3FF' },
  title: { fontSize: 14, fontWeight: '600', color: '#111827', flex: 1 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#7C3AED', marginTop: 5, marginLeft: 6 },
  body: { fontSize: 13, color: '#6B7280', marginTop: 4, lineHeight: 19 },
  time: { fontSize: 11, color: '#9CA3AF', marginTop: 6 },
  empty: { fontSize: 15, color: '#9CA3AF', marginTop: 12 },
  emptyContainer: { flexGrow: 1 },
});
