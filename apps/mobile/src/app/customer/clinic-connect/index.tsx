import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

interface Clinic {
  id: number;
  emoji: string;
  name: string;
  city: string;
  specialty: string;
  rating: number;
}

interface Referral {
  id: number;
  reason: string;
  status: string;
}

export default function ClinicConnectScreen(): JSX.Element {
  const isAuthed = useAuthState();
  const { t } = useLocale();
  const clinicsQ = trpc.clinicConnect.clinics.useQuery(undefined, { enabled: isAuthed });
  const referralsQ = trpc.clinicConnect.myReferrals.useQuery(undefined, { enabled: isAuthed });
  const clinics: Clinic[] = (clinicsQ.data as unknown as Clinic[] | undefined) ?? [];
  const referrals: Referral[] = (referralsQ.data as unknown as Referral[] | undefined) ?? [];
  const referMut = trpc.clinicConnect.refer.useMutation();
  const refer = (clinicId: number) => {
    referMut.mutate({
      clinicId,
      reason: t('clinicConnect.reason'),
      urgency: 'routine',
    });
  };
  if (clinicsQ.isLoading || referralsQ.isLoading) return <SkeletonList count={5} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={clinicsQ.isRefetching || referralsQ.isRefetching}
          onRefresh={() => {
            void clinicsQ.refetch();
            void referralsQ.refetch();
          }}
          colors={['#0891b2']}
        />
      }
    >
      <Text style={styles.t}>{t('clinicConnect.title')}</Text>
      {clinics.map((c) => (
        <View key={c.id} style={styles.card}>
          <Text style={styles.em}>{c.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>{c.name}</Text>
            <Text style={styles.meta}>
              {c.city} · {c.specialty} · {c.rating}
            </Text>
          </View>
          <TouchableOpacity onPress={() => refer(c.id)} style={styles.rb}>
            <Text style={styles.rt}>{t('clinicConnect.refer')}</Text>
          </TouchableOpacity>
        </View>
      ))}
      {referrals.length > 0 && <Text style={styles.st}>{t('clinicConnect.my-referrals')}</Text>}
      {referrals.map((r) => (
        <View key={r.id} style={styles.rc}>
          <Text style={styles.rr}>{r.reason}</Text>
          <View style={[styles.rbadge, r.status === 'PENDING' ? styles.rp : styles.rd]}>
            <Text style={styles.rbt}>
              {r.status === 'PENDING' ? t('clinicConnect.pending') : t('clinicConnect.completed')}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  em: { fontSize: 32 },
  nm: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  rb: { backgroundColor: '#0891b2', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  rt: { color: '#fff', fontSize: 13, fontWeight: '600' },
  rc: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  rr: { fontSize: 13, fontWeight: '600', color: '#111827' },
  rbadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  rp: { backgroundColor: '#fef3c7' },
  rd: { backgroundColor: '#dcfce7' },
  rbt: { fontSize: 11, fontWeight: '600' },
});
