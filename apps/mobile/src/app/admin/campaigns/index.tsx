import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminCampaignsScreen(): JSX.Element {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).campaigns.listAll.query() as any).then((d: any) => { setCampaigns(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📢 الحملات</Text>
      <Text style={styles.sub}>إدارة الحملات التسويقية</Text>
      {campaigns.length === 0 ? <Text style={styles.e}>لا توجد حملات</Text> :
        campaigns.map((c: any) => (
          <View key={c.id} style={styles.card}>
            <View style={{flex:1}}>
              <Text style={styles.campName}>{(c.nameJson as any)?.ar as string ?? c.nameAr as string}</Text>
              <Text style={styles.campDiscount}>{c.discountType === 'percent' ? `-${c.discountValue}%` : `-${c.discountValue} ر.س`}</Text>
              {c.promoCode ? <Text style={styles.campCode}>كود: {c.promoCode as string}</Text> : null}
            </View>
            <View style={[styles.badge, c.isActive ? styles.activeBadge : styles.inactiveBadge]}>
              <Text style={[styles.badgeText, c.isActive ? {color:'#059669'} : {color:'#9ca3af'}]}>{c.isActive ? 'نشط' : 'غير نشط'}</Text>
            </View>
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
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  campName: { fontSize: 14, fontWeight: '600', color: '#111827' }, campDiscount: { fontSize: 12, color: '#dc2626', marginTop: 2 },
  campCode: { fontSize: 11, color: '#059669', marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  activeBadge: { backgroundColor: '#dcfce7' }, inactiveBadge: { backgroundColor: '#f3f4f6' },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
