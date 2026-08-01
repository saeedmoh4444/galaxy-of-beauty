import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function BeautyDiscoveryScreen(): JSX.Element {
  const { data: featured, loading, error, refetch, refreshing, refresh } = useQuery(() => (trpc as any).beautyDiscovery.featured.query());
  const { data: forYou } = useQuery(() => (trpc as any).beautyDiscovery.forYou.query());

  if (loading) return <SkeletonList count={5} />;
  if (error) return <ErrorAlert message="فشل تحميل المحتوى" onRetry={refetch} />;

  const f = featured as any;
  const fy = forYou as any;

  return (
    <ScrollView style={s.c} contentContainerStyle={s.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#db2777']} />}>
      <Text style={s.t}>🔍 اكتشفي</Text>
      <Text style={s.sub}>خدمات وعروض وفعاليات مخصصة لكِ</Text>

      {fy?.profile && <View style={{backgroundColor:'#faf5ff',borderRadius:12,padding:14,marginBottom:16}}>
        <Text style={{fontWeight:'700',color:'#7c3aed',fontSize:15}}>🧬 ملفكِ الشخصي</Text>
        <Text style={{color:'#7c3aed',fontSize:13,marginTop:4}}>{fy.profile.skinType} · {fy.profile.hairType} · {(fy.profile.concerns as string[])?.join('، ')}</Text>
      </View>}

      {(f?.popularServices as any[])?.length > 0 && <View style={{marginBottom:16}}>
        <Text style={s.st}>🔥 الأكثر طلباً</Text>
        {(f.popularServices as any[]).slice(0,6).map((svc:any,i:number) => (
          <View key={svc.id ?? i} style={s.row}><Text style={{fontSize:14}}>{svc.emoji} {svc.name}</Text><Text style={{fontWeight:'700',color:'#db2777'}}>{svc.price} ر.س</Text></View>
        ))}
      </View>}

      {(f?.flashDeals as any[])?.length > 0 && <View style={{marginBottom:16}}>
        <Text style={s.st}>⚡ عروض فلاش</Text>
        {(f.flashDeals as any[]).slice(0,4).map((d:any,i:number) => (
          <View key={d.id ?? i} style={s.row}><View style={{flex:1}}><Text style={{fontWeight:'600',fontSize:14}}>{d.title}</Text><Text style={{fontSize:12,color:'#9ca3af',textDecorationLine:'line-through'}}>{d.originalPrice} ر.س</Text></View><Text style={{fontWeight:'800',color:'#ef4444'}}>{d.dealPrice} ر.س</Text></View>
        ))}
      </View>}

      {(fy?.suggestions as any[])?.length > 0 && <View style={{marginBottom:16}}>
        <Text style={s.st}>💝 لكِ خصيصاً</Text>
        {(fy.suggestions as any[]).map((s:any,i:number) => (
          <View key={s.id ?? i} style={s.row}><Text style={{fontSize:14}}>{s.emoji} {s.name}</Text><Text style={{fontWeight:'700',color:'#db2777'}}>{s.price} ر.س</Text></View>
        ))}
      </View>}

      {(f?.events as any[])?.length > 0 && <View style={{marginBottom:16}}>
        <Text style={s.st}>🎪 فعاليات قادمة</Text>
        {(f.events as any[]).map((e:any,i:number) => (
          <View key={e.id ?? i} style={s.row}><View style={{flex:1}}><Text style={{fontWeight:'600',fontSize:14}}>{e.name}</Text><Text style={{fontSize:11,color:'#6b7280'}}>{e.type} · {e.location}</Text></View></View>
        ))}
      </View>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c:{flex:1,backgroundColor:'#fdf2f8'}, i:{padding:16,paddingBottom:40},
  t:{fontSize:24,fontWeight:'800',color:'#111827',textAlign:'center',marginBottom:8},
  sub:{fontSize:14,color:'#6b7280',textAlign:'center',marginBottom:20},
  st:{fontSize:16,fontWeight:'700',color:'#111827',marginBottom:10},
  row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:'#fff',borderRadius:10,padding:12,marginBottom:6},
});
