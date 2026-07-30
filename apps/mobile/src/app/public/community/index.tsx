import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

export default function CommunityScreen(): JSX.Element {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  const fetch = useCallback(() => {
    setLoading(true);
    ((trpc as any).community.feed.query({ page: 1, limit: 30 }) as any)
      .then((d: any) => { setPosts(d?.posts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = () => {
    if (!content.trim()) return;
    setPosting(true);
    ((trpc as any).community.create.mutate({ content: content.trim() }) as any)
      .then(() => { setContent(''); setPosting(false); fetch(); })
      .catch(() => setPosting(false));
  };

  const toggleLike = (postId: number) => {
    ((trpc as any).community.toggleLike.mutate({ postId }) as any).then(() => fetch());
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={styles.c}>
      <ScrollView style={{flex:1}} contentContainerStyle={styles.i}>
        <Text style={styles.t}>💬 مجتمع الجمال</Text>
        <Text style={styles.sub}>شاركي تجاربكِ وآراءكِ</Text>

        <View style={styles.composer}>
          <TextInput placeholder="شاركي تجربتكِ..." value={content} onChangeText={setContent} multiline style={styles.input} placeholderTextColor="#9ca3af" />
          <TouchableOpacity onPress={create} disabled={posting || !content.trim()} style={[styles.postBtn, (!content.trim()) && styles.postBtnDisabled]}>
            <Text style={styles.postBtnText}>{posting ? '...' : 'نشر'}</Text>
          </TouchableOpacity>
        </View>

        {posts.length === 0 ? <Text style={styles.e}>لا توجد منشورات بعد. كوني الأولى! ✨</Text> :
          posts.map((p: any) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.avatar}>👩‍🎨</Text>
                <View style={{flex:1}}>
                  <Text style={styles.userName}>{p.userName as string ?? 'مستخدم'}</Text>
                  <Text style={styles.date}>{new Date(p.createdAt as string).toLocaleDateString('ar-SA')}</Text>
                </View>
              </View>
              <Text style={styles.postContent}>{p.content as string}</Text>
              <View style={styles.cardFooter}>
                <TouchableOpacity onPress={() => toggleLike(p.id as number)} style={styles.likeBtn}>
                  <Text style={styles.likeText}>❤️ {p.likes as number ?? 0}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        }
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
  input: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 12, fontSize: 14, color: '#111827', textAlign: 'right', minHeight: 50 },
  postBtn: { backgroundColor: '#7c3aed', paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center' },
  postBtnDisabled: { opacity: 0.5 },
  postBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { fontSize: 28 }, userName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  date: { fontSize: 11, color: '#9ca3af' },
  postContent: { fontSize: 14, color: '#374151', lineHeight: 22, textAlign: 'right', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8 },
  likeBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  likeText: { fontSize: 13, color: '#6b7280' },
});
