import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

interface InspirationPin {
  id?: number;
  imageUrl?: string;
  title?: string;
}

export default function InspirationScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const q = trpc.inspiration.list.useQuery(undefined, { enabled: isAuthed });
  const pins: InspirationPin[] = (q.data as unknown as InspirationPin[] | undefined) ?? [];
  const delMut = trpc.inspiration.delete.useMutation({
    onSuccess: () => {
      void q.refetch();
    },
  });
  const remove = (id: number) => {
    delMut.mutate({ id });
  };
  if (q.isLoading) return <SkeletonList count={6} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.inspiration.title')}</Text>
      <View style={styles.grid}>
        {pins.map((p) => (
          <View key={p.id} style={styles.card}>
            {p.imageUrl ? (
              <Image source={{ uri: p.imageUrl }} style={styles.img} />
            ) : (
              <View style={styles.ph}>
                <Text style={{ fontSize: 36 }}>️</Text>
              </View>
            )}
            <View style={styles.cb}>
              <Text style={styles.pt}>{p.title ?? ''}</Text>
              <TouchableOpacity onPress={() => p.id && remove(p.id)}>
                <Text>️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  img: { width: '100%', height: 120 },
  ph: {
    width: '100%',
    height: 120,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cb: { padding: 10 },
  pt: { fontSize: 13, fontWeight: '600', color: '#111827' },
});
