import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, RefreshControl } from 'react-native';
import { useCategories, useServices } from '../hooks/useCatalog';

export default function ServicesScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [catId, setCatId] = useState(null);

  const { data: catData } = useCategories();
  const categories = catData?.categories;

  // Stable params object to prevent unnecessary refetches
  const filters = useMemo(() => {
    const p = {};
    if (search) p.search = search;
    if (catId) p.categoryId = catId;
    p.limit = '30';
    return p;
  }, [search, catId]);

  const { data: servicesData, isLoading, refetch } = useServices(filters);
  const services = servicesData?.services;

  return (
    <View style={styles.container}>
      <TextInput style={styles.searchInput} placeholder="🔍  ابحثي عن خدمة..." value={search} onChangeText={setSearch} textAlign="right" />

      {/* Category filter */}
      <FlatList
        data={[{ id: null, nameJson: { ar: 'الكل' } }, ...(categories || [])]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.filterChip, catId === item.id && styles.filterActive]} onPress={() => setCatId(item.id)}>
            <Text style={[styles.filterText, catId === item.id && styles.filterTextActive]}>{item.nameJson?.ar}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={services || []}
        keyExtractor={(i) => String(i.id)}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ServiceDetail', { id: item.id })}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.titleJson?.ar}</Text>
              <Text style={styles.meta}>⏱ {item.durationMin} دقيقة  |  {item.category?.nameJson?.ar}</Text>
            </View>
            <Text style={styles.price}>{Number(item.basePrice).toLocaleString('ar-SA')} ر.س</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد نتائج</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  searchInput: { margin: 16, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#fff' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
  filterActive: { backgroundColor: '#7C3AED' },
  filterText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8 },
  title: { fontSize: 15, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  price: { fontSize: 15, fontWeight: '700', color: '#7C3AED' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40, fontSize: 16 },
});
