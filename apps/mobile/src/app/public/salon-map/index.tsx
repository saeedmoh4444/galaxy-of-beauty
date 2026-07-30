import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function SalonMapScreen() {
  const insets = useSafeAreaInsets();
  const [techs, setTechs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc as any).salonMap.explore.query({ city: 'riyadh' }).then((d: any) => { setTechs(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#059669" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>🗺️ خريطة الصالونات</Text></View>
      <ScrollView contentContainerStyle={styles.inner}>
        {techs.map((t: Record<string, unknown>, i: number) => (
          <TouchableOpacity key={i} style={styles.card} activeOpacity={0.8}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{(t.name as string)?.[0] || '👩'}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{t.name as string}</Text>
              <Text style={styles.city}>📍 {t.city as string} · ⭐ {t.rating as number}</Text>
              <Text style={styles.availability}>{t.isAvailable ? '🟢 متاحة' : '🔴 مشغولة'}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ecfdf5' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#d1fae5', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: '#059669', textAlign: 'center' },
  inner: { padding: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#059669' },
  name: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  city: { fontSize: 12, color: '#6b7280', textAlign: 'right', marginTop: 2 },
  availability: { fontSize: 11, color: '#059669', textAlign: 'right', marginTop: 4 },
});
