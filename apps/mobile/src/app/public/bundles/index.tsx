import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const BUNDLE_DISCOUNTS: Record<number, number> = { 2: 10, 3: 15, 4: 20, 5: 25 };

export default function BundlesScreen(): JSX.Element {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    ((trpc as any).categories.list.query() as any).then((d: any) => { setServices(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else if (next.size < 5) next.add(id);
      return next;
    });
  };

  const count = selected.size;
  const discount = BUNDLE_DISCOUNTS[count] || 0;

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📦 اصنعي باقتكِ</Text>
      <Text style={styles.sub}>اختاري خدماتكِ واحصلي على خصم</Text>

      {count > 0 && (
        <View style={styles.discountBanner}>
          <Text style={styles.discountText}>🎉 خصم {discount}% على {count} خدمات!</Text>
        </View>
      )}

      {services.slice(0, 15).map((s: any) => {
        const isSel = selected.has(s.id as number);
        return (
          <TouchableOpacity key={s.id} onPress={() => toggle(s.id as number)} style={[styles.card, isSel && styles.cardActive]}>
            <Text style={styles.svcEmoji}>{s.emoji as string ?? '💆‍♀️'}</Text>
            <View style={{flex:1}}>
              <Text style={styles.svcName}>{(s.nameJson as any)?.ar as string ?? s.nameAr as string ?? s.slug}</Text>
              <Text style={styles.svcMeta}>{(s._count?.services ?? 0) as number} خدمات</Text>
            </View>
            <View style={[styles.check, isSel && styles.checkActive]}>
              <Text style={[styles.checkText, isSel && styles.checkTextActive]}>{isSel ? '✓' : '+'}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 16 },
  discountBanner: { backgroundColor: '#fef3c7', borderRadius: 12, padding: 12, marginBottom: 16, alignItems: 'center' },
  discountText: { fontSize: 15, fontWeight: '700', color: '#d97706' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  cardActive: { borderWidth: 2, borderColor: '#f59e0b', backgroundColor: '#fffbeb' },
  svcEmoji: { fontSize: 28 }, svcName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  svcMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  check: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  checkActive: { backgroundColor: '#f59e0b' },
  checkText: { fontSize: 16, fontWeight: '700', color: '#6b7280' }, checkTextActive: { color: '#fff' },
});
