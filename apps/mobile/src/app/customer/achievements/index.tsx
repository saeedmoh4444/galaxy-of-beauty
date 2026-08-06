import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { trpc as trpcReact } from '@/lib/trpc-react';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function AchievementsScreen(): JSX.Element {
  // @ts-expect-error new routers
  const { data: achievementsData } = (trpcReact as any).beautyAchievements?.myAchievements?.useQuery?.() ?? { data: null };
  const { data, loading, error, refetch, refreshing, refresh } = useQuery(() => (trpc as any).customerAchievements.myAchievements.query());

  if (loading) return <SkeletonList count={4} />;
  if (error) return <ErrorAlert message="فشل تحميل الإنجازات" onRetry={refetch} />;

  const d = data as any;
  const achievements = (d?.achievements ?? []) as any[];
  const stats = d?.stats ?? {};
  const earnedCount = d?.earnedCount ?? 0;
  const totalCount = d?.totalCount ?? 0;
  const pct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <ScrollView style={s.c} contentContainerStyle={s.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#db2777']} />}>
      <Text style={s.t}>🏆 الإنجازات</Text>
      <Text style={s.sub}>ميداليات وجوائز رحلتكِ الجمالية</Text>

      <View style={s.progressBar}><View style={[s.progressFill, {width:`${pct}%`}]} /></View>
      <Text style={{textAlign:'center',color:'#6b7280',fontSize:13,marginBottom:20}}>{earnedCount}/{totalCount} إنجاز — {pct}%</Text>

      <View style={s.statsRow}>
        <View style={s.stat}><Text style={s.statNum}>{stats.totalBookings ?? 0}</Text><Text style={s.statLabel}>حجوزات</Text></View>
        <View style={s.stat}><Text style={[s.statNum,{color:'#059669'}]}>{(stats.totalSpent ?? 0).toLocaleString()} ر.س</Text><Text style={s.statLabel}>إنفاق</Text></View>
        <View style={s.stat}><Text style={[s.statNum,{color:'#d97706'}]}>🔥{stats.streakDays ?? 0}</Text><Text style={s.statLabel}>أيام</Text></View>
      </View>

      <View style={s.grid}>
        {achievements.map((a: any) => (
          <View key={a.key} style={[s.achCard, a.earned ? {borderColor:'#f59e0b',backgroundColor:'#fffbeb'} : {opacity:0.4}]}>
            <Text style={{fontSize:32,textAlign:'center'}}>{a.earned ? a.emoji : '🔒'}</Text>
            <Text style={{fontWeight:'700',fontSize:13,textAlign:'center',marginTop:6}}>{a.nameAr}</Text>
            <Text style={{fontSize:10,color:'#6b7280',textAlign:'center',marginTop:2}}>{a.desc}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c:{flex:1,backgroundColor:'#fdf2f8'}, i:{padding:16,paddingBottom:40},
  t:{fontSize:24,fontWeight:'800',color:'#111827',textAlign:'center',marginBottom:8},
  sub:{fontSize:14,color:'#6b7280',textAlign:'center',marginBottom:16},
  progressBar:{height:10,backgroundColor:'#e5e7eb',borderRadius:5,marginBottom:8},
  progressFill:{height:10,backgroundColor:'#f59e0b',borderRadius:5},
  statsRow:{flexDirection:'row',gap:10,marginBottom:20},
  stat:{flex:1,backgroundColor:'#fff',borderRadius:12,padding:12,alignItems:'center'},
  statNum:{fontSize:18,fontWeight:'800',color:'#111827'},
  statLabel:{fontSize:11,color:'#6b7280',marginTop:2},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:8},
  achCard:{width:'31%',backgroundColor:'#fff',borderRadius:12,borderWidth:2,borderColor:'#e5e7eb',padding:10,alignItems:'center'},
});
