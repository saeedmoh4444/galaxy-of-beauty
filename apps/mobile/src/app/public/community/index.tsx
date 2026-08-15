import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@/lib/useQuery';
import { EXTENDED_PAGE_SIZE } from '@galaxy/ui';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { useState } from 'react';
import { typedTrpc } from '@/lib/trpc-react';

interface CommunityPost {
  id?: number;
  userName?: string;
  createdAt?: string;
  content?: string;
  likes?: number;
}

interface CommunityFeed {
  posts?: CommunityPost[];
}

export default function CommunityScreen(): JSX.Element {
  const {
    data: posts,
    loading,
    error,
    refreshing,
    refetch,
    refresh,
  } = useQuery(() => typedTrpc().community.feed.query({ page: 1, limit: EXTENDED_PAGE_SIZE }));
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  const create = () => {
    if (!content.trim()) return;
    setPosting(true);
    typedTrpc()
      .community.create.mutate({ content: content.trim() })
      .then(() => {
        setContent('');
        setPosting(false);
        refetch();
      })
      .catch(() => setPosting(false));
  };

  const toggleLike = (postId: number) => {
    typedTrpc().community.toggleLike.mutate({ postId }).then(() => refetch());
  };

  if (loading) return <SkeletonList count={5} />;
  if (error) return <ErrorAlert message="فشل تحميل المجتمع" onRetry={refetch} />;

  const items = ((posts as CommunityFeed | null)?.posts) ?? [];

  return (
    <View style={styles.c}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.i}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#7c3aed']} />
        }
      >
        <Text style={styles.t}> مجتمع الجمال</Text>
        <Text style={styles.sub}>شاركي تجاربكِ وآراءكِ</Text>
        <View style={styles.composer}>
          <TextInput
            placeholder="شاركي تجربتكِ..."
            value={content}
            onChangeText={setContent}
            multiline
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            onPress={create}
            disabled={posting || !content.trim()}
            style={[styles.postBtn, !content.trim() && { opacity: 0.5 }]}
          >
            <Text style={styles.postBtnText}>{posting ? '...' : 'نشر'}</Text>
          </TouchableOpacity>
        </View>
        {items.length === 0 ? (
          <Text style={styles.e}>لا توجد منشورات بعد. كوني الأولى! </Text>
        ) : (
          items.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.avatar}>‍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{p.userName ?? 'مستخدم'}</Text>
                  <Text style={styles.date}>
                    {new Date(p.createdAt ?? '').toLocaleDateString('ar-SA')}
                  </Text>
                </View>
              </View>
              <Text style={styles.postContent}>{p.content}</Text>
              <TouchableOpacity onPress={() => toggleLike(p.id ?? 0)} style={styles.likeBtn}>
                <Text style={styles.likeText}>️ {p.likes ?? 0}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 16 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  composer: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    textAlign: 'right',
    minHeight: 50,
  },
  postBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  postBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { fontSize: 28 },
  userName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  date: { fontSize: 11, color: '#9ca3af' },
  postContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    textAlign: 'right',
    marginBottom: 10,
  },
  likeBtn: { paddingVertical: 4 },
  likeText: { fontSize: 13, color: '#6b7280' },
});
