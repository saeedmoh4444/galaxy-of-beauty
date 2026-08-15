import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface BeautyStory {
  id?: number;
  emoji?: string;
  titleAr?: string;
  title?: string;
  author?: string;
  preview?: string;
  descAr?: string;
}

export default function BeautyStoriesScreen(): JSX.Element {
  const {
    data: stories,
    loading,
    error,
    refreshing,
    refetch,
    refresh,
  } = useQuery(() => typedTrpc().beautyStories.list.query());

  if (loading) return <SkeletonList count={4} />;
  if (error) return <ErrorAlert message="فشل تحميل القصص" onRetry={refetch} />;

  const items = (stories ?? []) as BeautyStory[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#7c3aed']} />
      }
    >
      <Text style={styles.t}> القصص</Text>
      <Text style={styles.sub}>قصص نجاح وتحولات الجمال</Text>
      {items.length === 0 ? (
        <Text style={styles.e}>لا توجد قصص</Text>
      ) : (
        items.map((s, i) => (
          <View key={s.id ?? i} style={styles.card}>
            <Text style={styles.storyEmoji}>{(s.emoji as string) ?? ''}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.storyTitle}>{(s.titleAr as string) ?? (s.title as string)}</Text>
              <Text style={styles.storyAuthor}>️ {s.author as string}</Text>
              <Text style={styles.storyPreview}>
                {((s.preview as string) ?? (s.descAr as string))?.substring(0, 80)}...
              </Text>
            </View>
            <TouchableOpacity style={styles.readBtn}>
              <Text style={styles.readBtnText}>قراءة</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  storyEmoji: { fontSize: 36, marginBottom: 8 },
  storyTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  storyAuthor: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  storyPreview: { fontSize: 12, color: '#9ca3af', marginTop: 6, lineHeight: 18 },
  readBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  readBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
