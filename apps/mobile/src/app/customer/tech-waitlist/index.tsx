import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

export default function TechWaitlistScreen(): JSX.Element {
  const [popular, setPopular] = useState<any[]>([]);
  const [myList, setMyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    Promise.all([
      ((trpc as any).techWaitlist.popular.query() as any),
      ((trpc as any).techWaitlist.myWaitlists.query() as any),
    ]).then(([p, m]: any[]) => { setPopular(p || []); setMyList(m || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const join = (techId: number) => {
    ((trpc as any).techWaitlist.join.mutate({ technicianId: techId }) as any).then(() => fetch());
  };
  const leave = (techId: number) => {
    ((trpc as any).techWaitlist.leave.mutate({ technicianId: techId }) as any).then(() => fetch());
  };

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📋 قائمة الانتظار</Text>
      <Text style={styles.sub}>انضمي لقائمة انتظار الفنيات المشغولات</Text>

      {myList.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>⭐ قوائمي</Text>
          {myList.map((t: any) => (
            <View key={t.id} style={styles.card}>
              <Text style={styles.techEmoji}>👩‍🎨</Text>
              <View style={{flex:1}}>
                <Text style={styles.techName}>{t.name as string}</Text>
                <Text style={styles.techMeta}>الموقع: {t.position as number ?? '—'}</Text>
              </View>
              <TouchableOpacity onPress={() => leave(t.id as number)} style={styles.leaveBtn}><Text style={styles.leaveBtnText}>خروج</Text></TouchableOpacity>
            </View>
          ))}
        </>
      )}

      <Text style={styles.sectionTitle}>🔥 الفنيات الأكثر طلباً</Text>
      {popular.length === 0 ? <Text style={styles.e}>لا توجد فنيات</Text> :
        popular.map((t: any) => (
          <View key={t.id} style={styles.card}>
            <Text style={styles.techEmoji}>👩‍🎨</Text>
            <View style={{flex:1}}>
              <Text style={styles.techName}>{t.name as string}</Text>
              <Text style={styles.techMeta}>في الانتظار: {t.waitlistCount as number ?? 0} · ⭐ {t.rating as number ?? 0}</Text>
            </View>
            <TouchableOpacity onPress={() => join(t.id as number)} style={styles.joinBtn}><Text style={styles.joinBtnText}>انضمام</Text></TouchableOpacity>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  techEmoji: { fontSize: 32 }, techName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  techMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  joinBtn: { backgroundColor: '#d97706', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  joinBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  leaveBtn: { backgroundColor: '#fee2e2', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  leaveBtnText: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
});
