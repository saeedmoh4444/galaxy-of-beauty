import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function LiveStreamScreen(): JSX.Element {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).liveStream.list.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#ef4444" style={{ marginTop: 40 }} size="large" />;

  const live = (data?.live ?? []) as any[];
  const upcoming = (data?.upcoming ?? []) as any[];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>🎥 البث المباشر</Text>
      <Text style={styles.sub}>شاهدي جلسات تجميل مباشرة</Text>

      {live.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>🔴 مباشر الآن</Text>
          {live.map((s: any) => (
            <View key={s.id} style={[styles.card, styles.liveCard]}>
              <Text style={styles.streamEmoji}>🎥</Text>
              <View style={{flex:1}}>
                <Text style={styles.streamTitle}>{s.titleAr as string ?? s.title as string}</Text>
                <Text style={styles.streamHost}>👩‍🎨 {s.host as string}</Text>
                <View style={{flexDirection:'row', gap:12, marginTop:4}}>
                  <Text style={styles.viewerCount}>👁 {s.viewers as number}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.watchBtn}><Text style={styles.watchBtnText}>مشاهدة</Text></TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>📅 قادم</Text>
          {upcoming.map((s: any) => (
            <View key={s.id} style={styles.card}>
              <Text style={styles.streamEmoji}>📺</Text>
              <View style={{flex:1}}>
                <Text style={styles.streamTitle}>{s.titleAr as string ?? s.title as string}</Text>
                <Text style={styles.streamHost}>👩‍🎨 {s.host as string}</Text>
                <Text style={styles.scheduledAt}>📅 {new Date(s.scheduledAt as string).toLocaleDateString('ar-SA', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</Text>
              </View>
              <TouchableOpacity style={styles.remindBtn}><Text style={styles.remindBtnText}>🔔</Text></TouchableOpacity>
            </View>
          ))}
        </>
      )}
      {live.length === 0 && upcoming.length === 0 && <Text style={styles.e}>لا توجد بثوث</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  liveCard: { borderWidth: 2, borderColor: '#fca5a5' },
  streamEmoji: { fontSize: 32 }, streamTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  streamHost: { fontSize: 12, color: '#6b7280', marginTop: 2 }, viewerCount: { fontSize: 11, color: '#dc2626' },
  scheduledAt: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  watchBtn: { backgroundColor: '#dc2626', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  watchBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  remindBtn: { backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  remindBtnText: { fontSize: 16 },
});
