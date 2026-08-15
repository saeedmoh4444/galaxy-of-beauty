import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { typedTrpc } from '@/lib/trpc-react';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

interface ServiceRow {
  id?: number;
  emoji?: string;
  name?: string;
  price?: number;
}

interface FlashDeal {
  id?: number;
  title?: string;
  originalPrice?: number;
  dealPrice?: number;
}

interface DiscoveryEvent {
  id?: number;
  name?: string;
  type?: string;
  location?: string;
}

interface FeaturedData {
  popularServices?: ServiceRow[];
  flashDeals?: FlashDeal[];
  events?: DiscoveryEvent[];
}

interface ForYouData {
  profile?: { skinType?: string; hairType?: string; concerns?: string[] };
  suggestions?: ServiceRow[];
}

export default function BeautyDiscoveryScreen(): JSX.Element {
  const {
    data: featured,
    loading,
    error,
    refetch,
    refreshing,
    refresh,
  } = useQuery(() => typedTrpc().beautyDiscovery.featured.query());
  const { data: forYou } = useQuery(() => typedTrpc().beautyDiscovery.forYou.query());

  if (loading) return <SkeletonList count={5} />;
  if (error) return <ErrorAlert message="فشل تحميل المحتوى" onRetry={refetch} />;

  const f = featured as FeaturedData | null;
  const fy = forYou as ForYouData | null;

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#db2777']} />
      }
    >
      <Text style={s.t}> اكتشفي</Text>
      <Text style={s.sub}>خدمات وعروض وفعاليات مخصصة لكِ</Text>

      {fy?.profile && (
        <View
          style={{ backgroundColor: '#faf5ff', borderRadius: 12, padding: 14, marginBottom: 16 }}
        >
          <Text style={{ fontWeight: '700', color: '#7c3aed', fontSize: 15 }}> ملفكِ الشخصي</Text>
          <Text style={{ color: '#7c3aed', fontSize: 13, marginTop: 4 }}>
            {fy.profile.skinType} · {fy.profile.hairType} ·{' '}
            {(fy.profile.concerns as string[])?.join('، ')}
          </Text>
        </View>
      )}

      {(f?.popularServices ?? []).length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={s.st}> الأكثر طلباً</Text>
          {(f?.popularServices ?? []).slice(0, 6).map((svc, i) => (
            <View key={svc.id ?? i} style={s.row}>
              <Text style={{ fontSize: 14 }}>
                {svc.emoji} {svc.name}
              </Text>
              <Text style={{ fontWeight: '700', color: '#db2777' }}>{svc.price} ر.س</Text>
            </View>
          ))}
        </View>
      )}

      {(f?.flashDeals ?? []).length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={s.st}> عروض فلاش</Text>
          {(f?.flashDeals ?? []).slice(0, 4).map((d, i) => (
            <View key={d.id ?? i} style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', fontSize: 14 }}>{d.title}</Text>
                <Text
                  style={{ fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through' }}
                >
                  {d.originalPrice} ر.س
                </Text>
              </View>
              <Text style={{ fontWeight: '800', color: '#ef4444' }}>{d.dealPrice} ر.س</Text>
            </View>
          ))}
        </View>
      )}

      {(fy?.suggestions ?? []).length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={s.st}> لكِ خصيصاً</Text>
          {(fy?.suggestions ?? []).map((sug, i) => (
            <View key={sug.id ?? i} style={s.row}>
              <Text style={{ fontSize: 14 }}>
                {sug.emoji} {sug.name}
              </Text>
              <Text style={{ fontWeight: '700', color: '#db2777' }}>{sug.price} ر.س</Text>
            </View>
          ))}
        </View>
      )}

      {(f?.events ?? []).length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={s.st}> فعاليات قادمة</Text>
          {(f?.events ?? []).map((e, i) => (
            <View key={e.id ?? i} style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', fontSize: 14 }}>{e.name}</Text>
                <Text style={{ fontSize: 11, color: '#6b7280' }}>
                  {e.type} · {e.location}
                </Text>
              </View>
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
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
});
