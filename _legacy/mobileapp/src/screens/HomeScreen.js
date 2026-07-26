import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCategories, useRecommendations } from '../hooks/useCatalog';

const CAT_ICONS = { 'hair-care': '💇‍♀️', 'nail-care': '💅', 'skin-care': '✨', 'makeup': '💄', 'body-care': '💆‍♀️', 'henna': '🌿' };

function CategoryList({ categories, navigation }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
      {(categories || []).filter((c) => !c.parentId).map((item) => (
        <TouchableOpacity key={String(item.id)} style={styles.catCard} onPress={() => navigation.navigate('ServicesTab')}>
          <Text style={styles.catIcon}>{CAT_ICONS[item.slug] || '✨'}</Text>
          <Text style={styles.catLabel}>{item.nameJson?.ar}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuthStore();
  const { data: catData } = useCategories();
  const { data: recsData } = useRecommendations(4);

  const categories = catData?.categories;

  const { data: servicesData, isLoading, refetch } = useQuery({
    queryKey: ['services', 'popular'],
    queryFn: async () => { const { data } = await api.get('/services?isPopular=true&limit=10'); return data.services; },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text style={styles.hero}>✨ منصتك الآمنة لحجز{'\n'}خدمات التجميل والعناية</Text>

        {/* Surprise Me Button */}
        <TouchableOpacity
          style={styles.surpriseBtn}
          onPress={() => navigation.navigate('ServicesTab')}
          activeOpacity={0.8}
        >
          <Text style={styles.surpriseBtnText}>🎰 فاجئيني! اكتشفي خدمة عشوائية</Text>
        </TouchableOpacity>

        {/* Categories */}
        <Text style={styles.sectionTitle}>الفئات</Text>
        <CategoryList categories={categories} navigation={navigation} />

        {/* Recommendations */}
        {recsData && recsData.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={styles.sectionTitle}>✨ موصى به لك</Text>
            {recsData.slice(0, 4).map((rec) => (
              <TouchableOpacity key={rec.service.id} style={styles.recCard} onPress={() => navigation.navigate('ServiceDetail', { id: rec.service.id })}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recTitle}>{rec.service.titleJson?.ar}</Text>
                  <Text style={styles.recReason}>{rec.reason}</Text>
                </View>
                <Text style={styles.recPrice}>{Number(rec.service.basePrice).toLocaleString('ar-SA')} ر.س</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🔥 الأكثر طلباً</Text>

        {(servicesData || []).map((item) => (
          <TouchableOpacity key={String(item.id)} style={styles.serviceCard} onPress={() => navigation.navigate('ServiceDetail', { id: item.id })}>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>{item.titleJson?.ar}</Text>
              <Text style={styles.serviceMeta}>⏱ {item.durationMin} دقيقة</Text>
            </View>
            <Text style={styles.servicePrice}>{Number(item.basePrice).toLocaleString('ar-SA')} ر.س</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  hero: { fontSize: 22, fontWeight: '800', color: '#7C3AED', textAlign: 'center', padding: 24, lineHeight: 34 },
  surpriseBtn: { marginHorizontal: 24, marginBottom: 20, backgroundColor: '#F5F3FF', padding: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#EDE9FE', borderStyle: 'dashed' },
  surpriseBtnText: { color: '#7C3AED', fontWeight: '700', fontSize: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', paddingHorizontal: 16, marginBottom: 12 },
  catCard: { alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, width: 90, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  catIcon: { fontSize: 28, marginBottom: 6 },
  catLabel: { fontSize: 11, color: '#4B5563', textAlign: 'center', fontWeight: '500' },
  recCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, borderRightWidth: 3, borderRightColor: '#7C3AED' },
  recTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  recReason: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  recPrice: { fontSize: 14, fontWeight: '700', color: '#7C3AED' },
  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8, marginHorizontal: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  serviceTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  serviceMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  servicePrice: { fontSize: 15, fontWeight: '700', color: '#7C3AED' },
});
