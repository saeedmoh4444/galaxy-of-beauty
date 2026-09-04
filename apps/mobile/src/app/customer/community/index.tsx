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
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

interface CommunityUser {
  id?: number;
  name?: string;
  avatarUrl?: string;
}

interface CommunityPost {
  id: number;
  content?: string;
  createdAt?: string;
  likes?: number;
  user?: CommunityUser;
  _count?: { comments?: number };
}

interface FeedData {
  items?: CommunityPost[];
  total?: number;
  page?: number;
}

interface MyLike {
  postId: number;
}

export default function CommunityScreen(): JSX.Element {
  const isAuthed = useAuthState();
  const { locale, t } = useLocale();
  const feedQ = trpc.community.feed.useQuery({ page: 1, limit: LARGE_PAGE_SIZE });
  const myLikesQ = trpc.community.myLikes.useQuery(undefined, { enabled: isAuthed });
  const trendingQ = trpc.community.trending.useQuery(undefined, { enabled: isAuthed });
  const [content, setContent] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [commentId, setCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');

  const myLikesArr = (myLikesQ.data as MyLike[] | undefined) ?? [];
  const likedIds = new Set(myLikesArr.map((l) => l.postId));
  const feedItems = (feedQ.data as FeedData | null)?.items ?? [];
  const posts: CommunityPost[] = Array.isArray(feedItems) ? feedItems : [];
  const trendingPosts = (trendingQ.data as CommunityPost[] | undefined) ?? [];

  const likeMut = trpc.community.toggleLike.useMutation({
    onSuccess: () => {
      void feedQ.refetch();
    },
  });
  const createMut = trpc.community.create.useMutation({
    onSuccess: () => {
      setContent('');
      setShowCreate(false);
      void feedQ.refetch();
    },
  });
  const commentMut = trpc.community.addComment.useMutation({
    onSuccess: () => {
      setCommentText('');
      setCommentId(null);
    },
  });
  const deleteMut = trpc.community.delete.useMutation({
    onSuccess: () => {
      void feedQ.refetch();
    },
  });
  const handleLike = (postId: number) => {
    likeMut.mutate({ postId });
  };
  const handleCreate = () => {
    if (!content) return;
    createMut.mutate({ content });
  };
  const handleComment = () => {
    if (!commentId || !commentText) return;
    commentMut.mutate({ postId: commentId, content: commentText });
  };
  const handleDelete = (id: number) => {
    deleteMut.mutate({ id });
  };

  if (feedQ.isLoading) return <SkeletonList count={4} />;
  if (feedQ.isError)
    return <ErrorAlert message={t('community.load-error')} onRetry={() => feedQ.refetch()} />;

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl
          refreshing={feedQ.isRefetching}
          onRefresh={() => feedQ.refetch()}
          colors={['#db2777']}
        />
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
          <Text style={s.t}>{t('community.title')}</Text>
          <Text style={s.sub}>{t('community.subtitle')}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowCreate(!showCreate)} style={s.createBtn}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>
            {showCreate ? '' : t('community.create')}
          </Text>
        </TouchableOpacity>
      </View>

      {showCreate && (
        <View style={s.card}>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder={t('community.placeholder')}
            style={s.inp}
            placeholderTextColor="#9ca3af"
            multiline
          />
          <TouchableOpacity onPress={handleCreate} style={s.btn}>
            <Text style={s.btnText}>{t('community.post')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {trendingPosts.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '700', fontSize: 14, color: '#111827', marginBottom: 8 }}>
            {t('community.trending')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trendingPosts.map((p, i) => (
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
          <Text style={{ color: '#6b7280', marginTop: 8 }}>{t('community.empty')}</Text>
        </View>
      )}

      {posts.map((p) => (
        <View key={p.id} style={s.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Text style={{ fontSize: 30 }}>‍</Text>
            <View>
              <Text style={{ fontWeight: '600', fontSize: 14 }}>
                {p.user?.name ?? t('community.user-fallback')}
              </Text>
              <Text style={{ fontSize: 11, color: '#9ca3af' }}>
                {new Date(p.createdAt ?? '').toLocaleDateString(
                  locale === 'ar' ? 'ar-SA' : 'en-US',
                )}
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
                placeholder={t('community.comment-placeholder')}
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
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>
                  {t('community.comment')}
                </Text>
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
