import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

export default function FollowingScreen(): JSX.Element {
  const [follows, setFollows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    ((trpc as any).technicianFollows.myFollows.query() as any).then((d: any) => { setFollows(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const unfollow = (technicianId: number) => {
    ((trpc as any).technicianFollows.unfollow.mutate({ technicianId }) as any).then(() => fetch());
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>👩‍🎨 متابعة الفنيات</Text>
      <Text style={styles.sub}>الفنيات اللي تتابعينهم</Text>
      {follows.length === 0 ? <Text style={styles.e}>لا تتابعين أي فنية</Text> :
        follows.map((f: any) => (
          <View key={f.technicianId} style={styles.card}>
            <Text style={styles.avatar}>👩‍🎨</Text>
            <View style={{flex:1}}>
              <Text style={styles.techName}>فنية #{f.technicianId as number}</Text>
              <Text style={styles.techMeta}>منذ {new Date(f.createdAt as string).toLocaleDateString('ar-SA')}</Text>
            </View>
            <TouchableOpacity onPress={() => unfollow(f.technicianId as number)} style={styles.unfollowBtn}>
              <Text style={styles.unfollowText}>إلغاء المتابعة</Text>
            </TouchableOpacity>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  avatar: { fontSize: 36 }, techName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  techMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  unfollowBtn: { backgroundColor: '#fee2e2', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  unfollowText: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
});
