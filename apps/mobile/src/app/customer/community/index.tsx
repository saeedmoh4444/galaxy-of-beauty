import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useState } from 'react';
import { LARGE_PAGE_SIZE } from '@galaxy/ui';
import { trpc, typedTrpc } from '@/lib/trpc-react';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function CommunityScreen(): JSX.Element {
  const {
    data: feedData,
    loading,
    error,
    refetch,
    refreshing,
    refresh,
  } = useQuery(() => typedTrpc().community.feed.query({ page: 1, limit: LARGE_PAGE_SIZE }));
  const { data: myLikes } = useQuery(() => typedTrpc().community.myLikes.query());
  const { data: trending } = useQuery(() => typedTrpc().community.trending.query());
  const { data: kindnessData } = useQuery(() => typedTrpc().kindnessPoints?.getStatus?.query?.());
  const { data: circlesData } = useQuery(() =>
    typedTrpc().beautyCircles?.list?.query?.({ limit: 3 }),
  );
  const { data: complimentsData } = useQuery(() =>
    typedTrpc().sisterhoodCompliments?.count?.query?.(),
  );
  const [content, setContent] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [commentId, setCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');

  const myLikesArr = (myLikes ?? []) as any[];
  const likedIds = new Set(myLikesArr.map((l: any) => l.postId));
  const feedItems = (feedData as any)?.items;
  const posts: any[] = Array.isArray(feedItems) ? feedItems : [];

  const handleLike = async (postId: number) => {
    try {
      await typedTrpc().community.toggleLike.mutate({ postId });
      refetch();
    } catch {}
  };
  const handleCreate = async () => {
    if (!content) return;
    try {
      await typedTrpc().community.create.mutate({ content });
      setContent('');
      setShowCreate(false);
      refetch();
    } catch {}
  };
  const handleComment = async () => {
    if (!commentId || !commentText) return;
    try {
      await typedTrpc().community.addComment.mutate({ postId: commentId, content: commentText });
      setCommentText('');
      setCommentId(null);
    } catch {}
  };
  const handleDelete = async (id: number) => {
    try {
      await typedTrpc().community.delete.mutate({ id });
      refetch();
    } catch {}
  };

  if (loading) return <SkeletonList count={4} />;
  if (error) return <ErrorAlert message="فشل تحميل المجتمع" onRetry={refetch} />;

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#db2777']} />
      }
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <View>
          <Text style={s.t}> مجتمع الجمال</Text>
          <Text style={s.sub}>شاركي تجاربكِ وآرائكِ</Text>
        </View>
        <TouchableOpacity onPress={() => setShowCreate(!showCreate)} style={s.createBtn}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>{showCreate ? '' : '+ منشور'}</Text>
        </TouchableOpacity>
      </View>

      {showCreate && (
        <View style={s.card}>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="شاركي تجربتكِ أو نصيحة..."
            style={s.inp}
            placeholderTextColor="#9ca3af"
            multiline
          />
          <TouchableOpacity onPress={handleCreate} style={s.btn}>
            <Text style={s.btnText}> نشر</Text>
          </TouchableOpacity>
        </View>
      )}

      {Array.isArray(trending) && (trending as any[]).length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '700', fontSize: 14, color: '#111827', marginBottom: 8 }}>
             الأكثر تفاعلاً
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(trending as any[]).map((p: any, i: number) => (
              <View
                key={p.id ?? i}
                style={{
                  backgroundColor: '#fffbeb',
                  borderRadius: 14,
                  padding: 14,
                  marginRight: 8,
                  alignItems: 'center',
                  minWidth: 90,
                }}
              >
                <Text style={{ fontSize: 24 }}></Text>
                <Text style={{ fontSize: 11, fontWeight: '600', marginTop: 4 }}>
                  {p.user?.name}
                </Text>
                <Text style={{ fontSize: 11, color: '#d97706' }}>️{p.likes}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {posts.length === 0 && (
        <View style={{ alignItems: 'center', padding: 30 }}>
          <Text style={{ fontSize: 40 }}></Text>
          <Text style={{ color: '#6b7280', marginTop: 8 }}>كوني أول من يشارك</Text>
        </View>
      )}

      {posts.map((p: any) => (
        <View key={p.id} style={s.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Text style={{ fontSize: 30 }}>‍</Text>
            <View>
              <Text style={{ fontWeight: '600', fontSize: 14 }}>{p.user?.name ?? 'مستخدمة'}</Text>
              <Text style={{ fontSize: 11, color: '#9ca3af' }}>
                {new Date(p.createdAt).toLocaleDateString('ar-SA')}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 14, color: '#374151', marginBottom: 10 }}>{p.content}</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <TouchableOpacity onPress={() => handleLike(p.id)}>
              <Text
                style={{ color: likedIds.has(p.id) ? '#ef4444' : '#9ca3af', fontWeight: '600' }}
              >
                {likedIds.has(p.id) ? '️' : ''} {p.likes}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCommentId(commentId === p.id ? null : p.id)}>
              <Text style={{ color: '#9ca3af' }}> {p._count?.comments ?? 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(p.id)} style={{ marginLeft: 'auto' }}>
              <Text style={{ color: '#9ca3af' }}></Text>
            </TouchableOpacity>
          </View>
          {commentId === p.id && (
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                marginTop: 10,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: '#f3f4f6',
              }}
            >
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="أضيفي تعليق..."
                style={{
                  flex: 1,
                  backgroundColor: '#f9fafb',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  fontSize: 12,
                }}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                onPress={handleComment}
                style={{
                  backgroundColor: '#db2777',
                  borderRadius: 8,
                  paddingHorizontal: 14,
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>تعليق</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingBottom: 40 },
  t: { fontSize: 22, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  createBtn: {
    backgroundColor: '#db2777',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12 },
  inp: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    textAlign: 'right',
    minHeight: 80,
  },
  btn: {
    backgroundColor: '#db2777',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
