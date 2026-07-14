import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const [cats, setCats] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (trpc.categories.list.query() as unknown as Promise<Record<string, unknown>[]>).then((d: Record<string, unknown>[]) => { setCats(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>جالكسي بيوتي</Text>
        <Text style={styles.heroSub}>منصة خدمات التجميل الأولى في السعودية</Text>
      </View>

      <Text style={styles.sectionTitle}>الأقسام</Text>
      {loading ? <ActivityIndicator color="#7c3aed" /> : (
        <View style={styles.grid}>
          {cats.slice(0, 6).map((c: Record<string, unknown>, i: number) => (
            <TouchableOpacity key={i} style={styles.catCard} onPress={() => router.push('/(tabs)/services')}>
              <View style={styles.catIcon}><Text style={styles.catEmoji}>✨</Text></View>
              <Text style={styles.catName}>{((c.nameJson as Record<string, string>)?.ar ?? '').slice(0, 15)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>اكتشفي المزيد</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.qaBtn} onPress={() => router.push('/(tabs)/services')}>
          <Text style={styles.qaText}>تصفح الخدمات</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.qaBtn, styles.qaOutline]} onPress={() => router.push('/services/surprise-me')}>
          <Text style={[styles.qaText, { color: '#7c3aed' }]}>فاجئيني</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.qaBtn} onPress={() => router.push('/marketplace')}>
          <Text style={styles.qaText}>🛍️ متجر المنتجات</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.qaBtn, styles.qaPink]} onPress={() => router.push('/customer/skin-analysis')}>
          <Text style={styles.qaText}>🔬 تحليل البشرة</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  hero: { backgroundColor: '#7c3aed', padding: 32, alignItems: 'center' },
  heroTitle: { fontSize: 32, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 16, color: '#ede9fe', marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', margin: 16, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  catCard: { width: '30%', margin: '1.5%', alignItems: 'center', padding: 12, backgroundColor: '#f9fafb', borderRadius: 12 },
  catIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f5f3ff', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  catEmoji: { fontSize: 20 },
  catName: { fontSize: 12, fontWeight: '600', textAlign: 'center', color: '#374151' },
  quickActions: { padding: 16, gap: 8 },
  qaBtn: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center' },
  qaOutline: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#7c3aed' },
  qaPink: { backgroundColor: '#ec4899' },
  qaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
