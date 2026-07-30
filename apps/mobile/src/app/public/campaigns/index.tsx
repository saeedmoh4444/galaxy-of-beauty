import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function CampaignsScreen(): JSX.Element {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).campaigns.list.query() as any).then((d: any) => { setCampaigns(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📢 العروض والحملات</Text>
      <Text style={styles.sub}>أحدث العروض والتخفيضات</Text>
      {campaigns.length === 0 ? <Text style={styles.e}>لا توجد حملات</Text> :
        campaigns.map((c: any) => (
          <View key={c.id} style={styles.card}>
            <Text style={styles.campEmoji}>{c.emoji as string ?? '🎯'}</Text>
            <View style={{flex:1}}>
              <Text style={styles.campTitle}>{c.titleAr as string ?? c.title as string}</Text>
              <Text style={styles.campDesc}>{(c.descAr as string ?? c.description as string)?.substring(0, 80)}</Text>
              <View style={styles.campFooter}>
                <Text style={styles.discount}>خصم {c.discount as number}%</Text>
                <Text style={styles.code}>كود: {c.promoCode as string}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.copyBtn}><Text style={styles.copyBtnText}>نسخ</Text></TouchableOpacity>
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
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  campEmoji: { fontSize: 36 }, campTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  campDesc: { fontSize: 12, color: '#6b7280', marginTop: 4, lineHeight: 18 },
  campFooter: { flexDirection: 'row', gap: 12, marginTop: 8 },
  discount: { fontSize: 12, fontWeight: '700', color: '#dc2626', backgroundColor: '#fee2e2', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  code: { fontSize: 12, fontWeight: '600', color: '#059669', backgroundColor: '#dcfce7', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  copyBtn: { backgroundColor: '#d97706', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  copyBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
