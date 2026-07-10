import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function ServicesScreen() {
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    trpc.services.list.query({ search: search || undefined, sort: 'newest', page: 1, limit: 20 })
      .then((d) => { setData((d.items ?? []) as Record<string, unknown>[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, [search]);

  return (
    <View style={styles.container}>
      <TextInput style={styles.search} placeholder="بحث عن خدمة..." value={search} onChangeText={setSearch} />
      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 20 }} /> : (
        <ScrollView>
          {data.map((svc: Record<string, unknown>, i: number) => (
            <TouchableOpacity key={i} style={styles.card} onPress={() => router.push(`/services/${svc.id}`)}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle}>{(svc.titleJson as Record<string, string>)?.ar ?? ''}</Text>
                <Text style={styles.cardMeta}>{svc.durationMin as number} دقيقة</Text>
              </View>
              <Text style={styles.cardPrice}>{svc.basePrice as number} ر.س</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  search: { margin: 16, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 12, fontSize: 16, backgroundColor: '#f9fafb' },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardLeft: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  cardMeta: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  cardPrice: { fontSize: 16, fontWeight: '700', color: '#7c3aed' },
});
