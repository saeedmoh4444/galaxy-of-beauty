import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminPackagesScreen(): JSX.Element {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).beautyPackages.listAll.query() as any).then((d: any) => { setPackages(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>💅 الباقات</Text>
      <Text style={styles.sub}>إدارة باقات التجميل</Text>
      {packages.length === 0 ? <Text style={styles.e}>لا توجد باقات</Text> :
        <View style={styles.grid}>
          {packages.map((p: any) => (
            <View key={p.id} style={styles.card}>
              <Text style={styles.pkgEmoji}>📦</Text>
              <Text style={styles.pkgName}>{(p.nameJson as any)?.ar as string ?? p.nameAr as string}</Text>
              <Text style={styles.pkgDiscount}>-{p.discountPercent as number}%</Text>
              <Text style={styles.pkgServices}>{p.services?.length || 0} خدمات</Text>
              <View style={[styles.badge, p.isActive ? styles.activeBadge : styles.inactiveBadge]}>
                <Text style={[styles.badgeText, p.isActive ? {color:'#059669'} : {color:'#dc2626'}]}>{p.isActive ? 'نشط' : 'غير نشط'}</Text>
              </View>
            </View>
          ))}
        </View>
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center' },
  pkgEmoji: { fontSize: 36 }, pkgName: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 4, textAlign: 'center' },
  pkgDiscount: { fontSize: 13, color: '#dc2626', fontWeight: '600', marginTop: 4 },
  pkgServices: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 },
  activeBadge: { backgroundColor: '#dcfce7' }, inactiveBadge: { backgroundColor: '#fee2e2' },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
