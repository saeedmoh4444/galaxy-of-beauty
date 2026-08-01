import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

const TABS = [
  { key: 'trending', label: '🔥 رائج' },
  { key: 'spotlight', label: '⭐ مميزات' },
  { key: 'tips', label: '💡 نصائح' },
  { key: 'feed', label: '📷 قبل وبعد' },
];

export default function SocialScreen(): JSX.Element {
  const [tab, setTab] = useState('trending');
  const { data: trending, loading, error, refetch, refreshing, refresh } = useQuery(() => (trpc as any).social.trending.query());
  const { data: spotlight } = useQuery(() => (trpc as any).social.spotlight.query());
  const { data: tipsData } = useQuery(() => (trpc as any).social.tips.query({ page: 1 }));
  const { data: feedData } = useQuery(() => (trpc as any).social.feed.query({ page: 1, limit: 12 }));
  const { data: lookbook } = useQuery(() => (trpc as any).social.lookbook.query());

  if (loading) return <SkeletonList count={5} />;
  if (error) return <ErrorAlert message="فشل تحميل المحتوى" onRetry={refetch} />;

  const tips = (tipsData ?? []) as any[];
  const feedItems = (feedData as any)?.items ?? [];
  const lookbookItems = (lookbook ?? []) as any[];

  return (
    <ScrollView style={s.c} contentContainerStyle={s.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#db2777']} />}>
      <Text style={s.t}>🌟 مجتمع الجمال</Text>
      <Text style={s.sub}>اكتشفي أحدث الصيحات والفنيات المميزات</Text>

      <View style={s.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={[s.tab, tab === t.key && s.tabActive]}>
            <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'trending' && (trending as any[])?.length > 0 && (
        <View>
          <Text style={s.st}>💆‍♀️ الخدمات الرائجة</Text>
          {(trending as any[]).slice(0, 10).map((svc: any, i: number) => (
            <View key={svc.id ?? i} style={s.card}>
              <View style={s.rank}><Text style={s.rankText}>#{i + 1}</Text></View>
              <View style={{flex:1}}><Text style={s.cardTitle}>{(svc.titleJson as any)?.ar ?? svc.name}</Text><Text style={s.cardSub}>{svc.bookingCount} حجز</Text></View>
            </View>
          ))}
        </View>
      )}

      {tab === 'spotlight' && (spotlight as any[])?.length > 0 && (
        <View>
          <Text style={s.st}>👩‍🎨 فنيات مميزات</Text>
          {(spotlight as any[]).map((tech: any, i: number) => (
            <View key={tech.id ?? i} style={s.card}>
              <Text style={s.avatar}>👩‍🎨</Text>
              <View style={{flex:1}}><Text style={s.cardTitle}>{tech.name}</Text><Text style={s.cardSub}>{tech.city} · ⭐{tech.ratingAvg}</Text></View>
            </View>
          ))}
        </View>
      )}

      {tab === 'tips' && tips.length > 0 && (
        <View>
          <Text style={s.st}>💡 نصائح تجميلية</Text>
          {tips.map((tip: any, i: number) => (
            <View key={tip.id ?? i} style={s.card}>
              <View style={{flex:1}}><Text style={s.cardTitle}>{tip.titleAr ?? tip.id}</Text><Text style={s.cardSub}>{tip.bodyAr ?? ''}</Text></View>
            </View>
          ))}
        </View>
      )}

      {tab === 'feed' && feedItems.length > 0 && (
        <View>
          <Text style={s.st}>📷 قبل وبعد</Text>
          <View style={s.grid}>
            {feedItems.map((item: any, i: number) => (
              <View key={item.id ?? i} style={s.gridItem}>
                <Text style={s.gridEmoji}>📷</Text>
                <Text style={s.gridTitle}>{item.technician?.user?.name ?? ''}</Text>
                <Text style={s.gridSub}>{item.technician?.city ?? ''}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {lookbookItems.length > 0 && (
        <View style={{marginTop: 24}}>
          <Text style={s.st}>📸 لوك بوك الموسم</Text>
          {(lookbookItems as any[]).slice(0, 4).map((l: any, i: number) => (
            <View key={l.id ?? i} style={s.card}>
              <Text style={s.avatar}>📸</Text>
              <View style={{flex:1}}><Text style={s.cardTitle}>{l.titleAr ?? l.id}</Text><Text style={s.cardSub}>{l.category ?? ''}</Text></View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingBottom: 40 },
  t: { fontSize: 26, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 20, justifyContent: 'center', flexWrap: 'wrap' },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff' },
  tabActive: { backgroundColor: '#db2777' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  st: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, gap: 12 },
  rank: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fce7f3', justifyContent: 'center', alignItems: 'center' },
  rankText: { fontSize: 13, fontWeight: '700', color: '#db2777' },
  avatar: { fontSize: 28 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  cardSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridItem: { width: '31%', backgroundColor: '#fff', borderRadius: 10, padding: 10, alignItems: 'center' },
  gridEmoji: { fontSize: 32 },
  gridTitle: { fontSize: 11, fontWeight: '600', color: '#111827', marginTop: 4 },
  gridSub: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
});
