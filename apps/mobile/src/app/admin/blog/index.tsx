import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AdminBlogScreen(): JSX.Element {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ((trpc as any).blog.listAll.query({ page: 1, limit: 50 }) as any).then((d: any) => { setPosts(d?.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📝 المدونة</Text>
      <Text style={styles.sub}>إدارة المقالات</Text>
      {posts.length === 0 ? <Text style={styles.e}>لا توجد مقالات</Text> :
        posts.map((p: any) => (
          <View key={p.id} style={styles.card}>
            <View style={{flex:1}}>
              <Text style={styles.postTitle}>{(p.titleJson as any)?.ar as string ?? p.title as string}</Text>
              <Text style={styles.postMeta}>{p.slug as string} · {(p.tags as string[])?.join(', ')}</Text>
            </View>
            <View style={[styles.badge, p.isPublished ? styles.pubBadge : styles.draftBadge]}>
              <Text style={[styles.badgeText, p.isPublished ? {color:'#059669'} : {color:'#d97706'}]}>{p.isPublished ? 'منشور' : 'مسودة'}</Text>
            </View>
          </View>
        ))
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  postTitle: { fontSize: 15, fontWeight: '600', color: '#111827' }, postMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  pubBadge: { backgroundColor: '#dcfce7' }, draftBadge: { backgroundColor: '#fef3c7' },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
