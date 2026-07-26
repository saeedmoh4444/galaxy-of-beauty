import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import api from '../lib/api';

export default function WishlistScreen() {
  const navigation = useNavigation();
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => { const { data } = await api.get('/wishlist'); return data.items || []; },
  });

  const removeItem = useMutation({
    mutationFn: (id) => api.delete(`/wishlist/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wishlist'] }); },
  });

  const items = data || [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}><Text style={styles.headerTitle}>❤️ المفضلة</Text></View>
        <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}><Text style={styles.headerTitle}>❤️ المفضلة</Text><Text style={styles.headerCount}>{items.length} عناصر</Text></View>

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#7C3AED" />}
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : { padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.emptyTitle}>المفضلة فارغة</Text>
            <Text style={styles.emptySubtitle}>أضيفي خدماتكِ المفضلة ليسهل الوصول إليها</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('ServicesTab')}>
              <Text style={styles.browseBtnText}>تصفحي الخدمات</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => item.service && navigation.navigate('ServiceDetail', { id: item.service.id })}
            activeOpacity={0.7}
          >
            <View style={styles.cardLeft}>
              <View style={styles.serviceIcon}>
                <Text style={{ fontSize: 22 }}>✨</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>{item.service?.titleJson?.ar || 'خدمة'}</Text>
                <View style={styles.meta}>
                  <Text style={styles.price}>{Number(item.service?.basePrice || 0).toLocaleString('ar-SA')} ر.س</Text>
                  {item.service?.durationMin && <Text style={styles.duration}>⏱ {item.service.durationMin} د</Text>}
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => removeItem.mutate(item.id)}
              style={styles.removeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ fontSize: 18 }}>{removeItem.isPending ? '⏳' : '💔'}</Text>
            </TouchableOpacity>
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
  headerCount: { fontSize: 14, color: '#9CA3AF' },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 14, borderRadius: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  serviceIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '600', color: '#111827' },
  meta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  price: { fontSize: 14, fontWeight: '700', color: '#7C3AED' },
  duration: { fontSize: 12, color: '#9CA3AF' },
  removeBtn: { padding: 8 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  browseBtn: { backgroundColor: '#7C3AED', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 },
  browseBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
