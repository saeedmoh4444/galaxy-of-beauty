import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const THEME_EMOJI: Record<string, string> = { bridal: '👰', birthday: '🎂', girls_night: '🌙', family: '👨‍👩‍👧‍👦', other: '🎉' };

export default function GroupBookingsScreen(): JSX.Element {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).groupBookings.list.query() as any).then((d: any) => { setGroups(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>👯‍♀️ الحجوزات الجماعية</Text>
      <Text style={styles.sub}>احجزي لكِ ولصديقاتكِ معاً</Text>
      {groups.length === 0 ? <Text style={styles.e}>لا توجد حجوزات جماعية</Text> :
        groups.map((g: any) => (
          <View key={g.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.themeEmoji}>{THEME_EMOJI[g.theme as string] ?? '🎉'}</Text>
              <View style={{flex:1}}>
                <Text style={styles.groupName}>{g.name as string}</Text>
                <Text style={styles.groupMeta}>{g.members?.length ?? 0} أفراد · {(g.totalAmount as number)?.toLocaleString()} ر.س</Text>
              </View>
              <View style={[styles.statusBadge, g.status === 'CONFIRMED' ? styles.statusConfirmed : g.status === 'PENDING' ? styles.statusPending : {}]}>
                <Text style={styles.statusText}>{g.status === 'CONFIRMED' ? 'مؤكد' : g.status === 'PENDING' ? 'قيد الانتظار' : g.status === 'COMPLETED' ? 'مكتمل' : 'ملغي'}</Text>
              </View>
            </View>
            <View style={styles.members}>
              {(g.members as any[])?.map((m: any) => (
                <View key={m.id} style={styles.member}>
                  <Text style={styles.memberName}>{m.name as string}</Text>
                  <Text style={styles.memberStatus}>{m.status === 'CONFIRMED' ? '✅' : '⏳'}</Text>
                </View>
              ))}
            </View>
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
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  themeEmoji: { fontSize: 32 }, groupName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  groupMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  statusBadge: { backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusConfirmed: { backgroundColor: '#dcfce7' }, statusPending: { backgroundColor: '#fef3c7' },
  statusText: { fontSize: 11, fontWeight: '600', color: '#111827' },
  members: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10 },
  member: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  memberName: { fontSize: 13, color: '#374151' }, memberStatus: { fontSize: 14 },
});
