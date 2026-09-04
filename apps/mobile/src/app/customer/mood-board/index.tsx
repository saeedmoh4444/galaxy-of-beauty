import { View, Text, ScrollView, StyleSheet, RefreshControl, Image } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

interface MoodPin {
  id?: number;
  imageUrl?: string;
}

export default function MoodBoardScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const pinsQ = trpc.moodBoard.list.useQuery(undefined, { enabled: isAuthed });
  const data: MoodPin[] = (pinsQ.data as unknown as MoodPin[] | undefined) ?? [];

  if (pinsQ.isLoading) return <SkeletonList count={6} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={pinsQ.isRefetching}
          onRefresh={() => pinsQ.refetch()}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.moodBoard.title')}</Text>
      <View style={styles.grid}>
        {data.map((p, i) => (
          <View key={i} style={styles.pin}>
            {p.imageUrl ? (
              <Image source={{ uri: p.imageUrl }} style={styles.img} />
            ) : (
              <View style={styles.placeholder}>
                <Text style={{ fontSize: 28 }}>️</Text>
              </View>
            )}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pin: { width: '31%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden' },
  img: { width: '100%', height: '100%' },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
