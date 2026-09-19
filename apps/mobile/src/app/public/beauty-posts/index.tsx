import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import type { JSX } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useToast } from '@/components/Toast';
import { useLocale } from '@/components/LocaleProvider';
import { useHaptics } from '@/hooks/useHaptics';

type PostRow = {
  id: number;
  imageUrl: string;
  caption: string | null;
  likes: number;
  views: number;
  likedByMe: boolean;
  author: { id: number; name: string; kycStatus: string | null };
  tags: {
    products: Array<{ id: number; nameJson: { ar?: string; en?: string }; price: number }>;
    services: Array<{ id: number; titleJson: { ar?: string; en?: string }; basePrice: number }>;
  };
};

const pick = (json: { ar?: string; en?: string } | undefined, locale: string): string =>
  locale === 'ar' ? (json?.ar ?? '') : (json?.en ?? '');

/** 2.5 Social Commerce — shoppable looks feed (#MyGalaxyLook). */
export default function BeautyPostsScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const { showToast } = useToast();
  const { trigger } = useHaptics();
  const router = useRouter();
  const isAuthed = useAuthState();
  const [openTags, setOpenTags] = useState<number | null>(null);
  const [commentFor, setCommentFor] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');

  const feedQ = trpc.beautyPosts.feed.useQuery(undefined, { enabled: true });
  const posts = (feedQ.data as unknown as PostRow[]) ?? [];

  const likeMut = trpc.beautyPosts.like.useMutation({
    onSuccess: () => void feedQ.refetch(),
  });
  const addCartMut = trpc.marketplace.addToCart.useMutation({
    onSuccess: () => {
      trigger('success');
      showToast('success', t('mobile.beautyPosts.added-to-cart'));
    },
    onError: () => showToast('error', t('mobile.beautyPosts.cart-error')),
  });
  const tagClickMut = trpc.beautyPosts.tagClick.useMutation({});
  const viewedMut = trpc.beautyPosts.viewed.useMutation({});
  const commentMut = trpc.beautyPosts.addComment.useMutation({
    onSuccess: () => {
      setCommentText('');
      setCommentFor(null);
      void feedQ.refetch();
    },
  });
  const commentsQ = trpc.beautyPosts.comments.useQuery(
    { postId: commentFor ?? 0 },
    { enabled: commentFor !== null },
  );
  const comments =
    (commentsQ.data as unknown as Array<{
      id: number;
      content: string;
      author: { name: string };
    }>) ?? [];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{t('mobile.beautyPosts.title')}</Text>
      <Text style={styles.s}>{t('mobile.beautyPosts.subtitle')}</Text>

      {posts.map((post) => (
        <View key={post.id} style={styles.card}>
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.img}
            onLoadEnd={() => viewedMut.mutate({ postId: post.id })}
          />
          <View style={styles.body}>
            <View style={styles.row}>
              <Text style={styles.author}>{post.author.name}</Text>
              {post.author.kycStatus === 'VERIFIED' && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{t('mobile.beautyPosts.verified')}</Text>
                </View>
              )}
              <Text style={styles.views}>👁 {post.views}</Text>
            </View>
            {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}

            {(post.tags.products.length > 0 || post.tags.services.length > 0) && (
              <View style={styles.tagsBox}>
                <TouchableOpacity
                  onPress={() => setOpenTags(openTags === post.id ? null : post.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.getLook}>{t('mobile.beautyPosts.get-this-look')}</Text>
                </TouchableOpacity>
                {openTags === post.id && (
                  <View style={styles.tagsList}>
                    {post.tags.products.map((prod) => (
                      <View key={`p${prod.id}`} style={styles.tagRow}>
                        <Text style={styles.tagName} numberOfLines={1}>
                          🛍️ {pick(prod.nameJson, locale)}
                        </Text>
                        <TouchableOpacity
                          style={styles.tagBtn}
                          onPress={() => {
                            tagClickMut.mutate({
                              postId: post.id,
                              kind: 'product_click',
                              targetId: prod.id,
                            });
                            addCartMut.mutate({ productId: prod.id });
                          }}
                        >
                          <Text style={styles.tagBtnText}>
                            {t('mobile.beautyPosts.add-to-cart')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    {post.tags.services.map((svc) => (
                      <View key={`s${svc.id}`} style={styles.tagRow}>
                        <Text style={styles.tagName} numberOfLines={1}>
                          💆‍♀️ {pick(svc.titleJson, locale)}
                        </Text>
                        <TouchableOpacity
                          style={[styles.tagBtn, styles.tagBtnAccent]}
                          onPress={() => {
                            tagClickMut.mutate({
                              postId: post.id,
                              kind: 'service_click',
                              targetId: svc.id,
                            });
                            router.push(`/customer/bookings/create?serviceId=${svc.id}` as never);
                          }}
                        >
                          <Text style={styles.tagBtnText}>{t('mobile.beautyPosts.book')}</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => {
                  if (!isAuthed) return;
                  likeMut.mutate({ postId: post.id });
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionText, post.likedByMe && styles.liked]}>
                  {post.likedByMe ? '❤️' : '🤍'} {post.likes}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCommentFor(commentFor === post.id ? null : post.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionText}>💬 {t('mobile.beautyPosts.comments')}</Text>
              </TouchableOpacity>
            </View>

            {commentFor === post.id && (
              <View style={styles.commentsBox}>
                {comments.map((c) => (
                  <Text key={c.id} style={styles.comment}>
                    <Text style={styles.commentAuthor}>{c.author.name}: </Text>
                    {c.content}
                  </Text>
                ))}
                <View style={styles.commentInputRow}>
                  <TextInput
                    style={styles.commentInput}
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder={t('mobile.beautyPosts.comment-placeholder')}
                  />
                  <TouchableOpacity
                    style={styles.sendBtn}
                    onPress={() => {
                      if (!commentText.trim() || !isAuthed) return;
                      commentMut.mutate({ postId: post.id, content: commentText.trim() });
                    }}
                  >
                    <Text style={styles.sendText}>{t('mobile.beautyPosts.send')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center' },
  s: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0e4e8',
  },
  img: { width: '100%', height: 260, backgroundColor: '#f3f4f6' },
  body: { padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  author: { fontSize: 14, fontWeight: '700', color: '#111827' },
  badge: {
    backgroundColor: '#dcfce7',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#16a34a' },
  views: { marginLeft: 'auto', fontSize: 11, color: '#9ca3af' },
  caption: { fontSize: 13, color: '#374151', marginTop: 8, lineHeight: 20 },
  tagsBox: { marginTop: 10, backgroundColor: '#f9fafb', borderRadius: 10, padding: 10 },
  getLook: { fontSize: 12, fontWeight: '700', color: '#db2777' },
  tagsList: { marginTop: 8, gap: 6 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagName: { flex: 1, fontSize: 12, color: '#374151' },
  tagBtn: {
    backgroundColor: '#db2777',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagBtnAccent: { backgroundColor: '#d98e4a' },
  tagBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionText: { fontSize: 13, fontWeight: '700', color: '#6b7280' },
  liked: { color: '#db2777' },
  commentsBox: { marginTop: 8, gap: 6 },
  comment: { fontSize: 12, color: '#4b5563' },
  commentAuthor: { fontWeight: '700', color: '#111827' },
  commentInputRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    backgroundColor: '#fff',
  },
  sendBtn: {
    backgroundColor: '#db2777',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
