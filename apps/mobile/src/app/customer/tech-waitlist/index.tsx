import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface WaitlistTech {
  id: number;
  name?: string;
  emoji?: string;
  rating?: number;
  waitlistCount?: number;
  avgWait?: string;
}

interface MyWaitlist {
  id: number;
  name?: string;
  position?: number;
  technicianId?: number;
  technicianName?: string;
  status?: string;
  preferredDate?: string;
}

export default function TechWaitlistScreen(): JSX.Element {
  const popularQ = trpc.techWaitlist.popular.useQuery();
  const myListQ = trpc.techWaitlist.myWaitlists.useQuery();
  const popular: WaitlistTech[] = (popularQ.data as unknown as WaitlistTech[] | undefined) ?? [];
  const myList: MyWaitlist[] = (myListQ.data as unknown as MyWaitlist[] | undefined) ?? [];

  const joinMut = trpc.techWaitlist.join.useMutation({
    onSuccess: () => {
      void popularQ.refetch();
      void myListQ.refetch();
    },
  });
  const join = (techId: number) => {
    const techName =
      popular.find((t) => t.id === techId)?.name ??
      myList.find((m) => m.technicianId === techId)?.technicianName ??
      '';
    joinMut.mutate({
      technicianId: techId,
      technicianName: techName,
    });
  };
  const leaveMut = trpc.techWaitlist.leave.useMutation({
    onSuccess: () => {
      void popularQ.refetch();
      void myListQ.refetch();
    },
  });
  const leave = (techId: number) => {
    leaveMut.mutate({ id: techId });
  };
  if (popularQ.isLoading || myListQ.isLoading) return <SkeletonList count={5} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={popularQ.isRefetching || myListQ.isRefetching}
          onRefresh={() => {
            void popularQ.refetch();
            void myListQ.refetch();
          }}
          colors={['#f59e0b']}
        />
      }
    >
      <Text style={styles.t}> قائمة الانتظار</Text>
      {myList.length > 0 && <Text style={styles.st}> قوائمي</Text>}
      {myList.map((t) => (
        <View key={t.id} style={styles.card}>
          <Text style={styles.te}>‍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tn}>{t.name}</Text>
            <Text style={styles.tm}>الموقع: {t.position ?? '—'}</Text>
          </View>
          <TouchableOpacity onPress={() => leave(t.id)} style={styles.lb}>
            <Text style={styles.lt}>خروج</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Text style={styles.st}> الفنيات الأكثر طلباً</Text>
      {popular.map((t) => (
        <View key={t.id} style={styles.card}>
          <Text style={styles.te}>‍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tn}>{t.name}</Text>
            <Text style={styles.tm}>
              {t.rating ?? 0} · {t.waitlistCount ?? 0} في الانتظار
            </Text>
          </View>
          <TouchableOpacity onPress={() => join(t.id)} style={styles.jb}>
            <Text style={styles.jt}>انضمام</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
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
  te: { fontSize: 32 },
  tn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  tm: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  jb: { backgroundColor: '#d97706', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  jt: { color: '#fff', fontSize: 13, fontWeight: '600' },
  lb: { backgroundColor: '#fee2e2', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  lt: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
});
