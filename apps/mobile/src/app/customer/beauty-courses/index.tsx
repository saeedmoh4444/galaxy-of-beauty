import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

const LEVELS: Record<string,{label:string;color:string}> = { beginner: { label:'مبتدئ', color:'#10b981' }, intermediate: { label:'متوسط', color:'#f59e0b' }, advanced: { label:'متقدم', color:'#ef4444' } };

export default function BeautyCoursesScreen(): JSX.Element {
  const { data: courses, loading, error, refetch, refreshing, refresh } = useQuery(() => (trpc as any).beautyCourses.list.query());
  const { data: myCourses } = useQuery(() => (trpc as any).beautyCourses.myCourses.query());
  const { data: expertTalks } = useQuery(() => (trpc as any).expertTalks?.upcoming?.query?.({ limit: 3 }));
  const [enrolled, setEnrolled] = useState<number[]>([]);

  const handleEnroll = async (courseId: number) => {
    try { await (trpc as any).beautyCourses.enroll.mutate({ courseId }); setEnrolled(prev => [...prev, courseId]); } catch {}
  };

  if (loading) return <SkeletonList count={4} />;
  if (error) return <ErrorAlert message="فشل تحميل الدورات" onRetry={refetch} />;

  const items = (courses ?? []) as any[];
  const myItems = (myCourses ?? []) as any[];

  return (
    <ScrollView style={s.c} contentContainerStyle={s.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#db2777']} />}>
      <Text style={s.t}>📚 دورات تجميل</Text>
      <Text style={s.sub}>تعلمي مهارات التجميل من الخبيرات</Text>

      {myItems.length > 0 && <View style={{marginBottom:16,backgroundColor:'#ecfdf5',borderRadius:12,padding:12}}>
        <Text style={{fontWeight:'700',color:'#059669',marginBottom:8}}>✅ دوراتي ({myItems.length})</Text>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{myItems.map((c:any,i:number)=><View key={i} style={{backgroundColor:'#d1fae5',borderRadius:16,paddingHorizontal:10,paddingVertical:4}}><Text style={{fontSize:12,color:'#047857'}}>{c.course?.titleJson?.ar ?? `دورة #${c.courseId}`}</Text></View>)}</View>
      </View>}

      {items.map((c: any) => {
        const isEnrolled = enrolled.includes(c.id) || myItems.some((m:any) => m.courseId === c.id);
        const level = LEVELS[c.level] ?? LEVELS['beginner']!;
        return (
          <View key={c.id} style={s.card}>
            <Text style={{fontSize:40}}>{c.emoji}</Text>
            <View style={{flex:1}}>
              <Text style={s.cTitle}>{c.titleAr}</Text>
              <Text style={s.cDesc}>{c.descAr}</Text>
              <View style={s.tags}>
                <Text style={{fontSize:11,color:'#6b7280'}}>👩‍🏫 {c.instructor}</Text>
                <Text style={{fontSize:11,color:'#6b7280'}}>📖 {c.lessons} دروس</Text>
                <Text style={{fontSize:11,color:'#6b7280'}}>⭐{c.rating}</Text>
                <View style={{backgroundColor:level.color+'20',borderRadius:8,paddingHorizontal:6,paddingVertical:2}}><Text style={{fontSize:10,color:level.color,fontWeight:'600'}}>{level.label}</Text></View>
              </View>
              <TouchableOpacity onPress={() => handleEnroll(c.id)} disabled={isEnrolled} style={[s.btn, isEnrolled&&{backgroundColor:'#d1fae5'}]}>
                <Text style={[s.btnText, isEnrolled&&{color:'#047857'}]}>{isEnrolled ? '✅ مسجلة' : '📝 سجلي الآن'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c:{flex:1,backgroundColor:'#fdf2f8'}, i:{padding:16,paddingBottom:40},
  t:{fontSize:24,fontWeight:'800',color:'#111827',textAlign:'center',marginBottom:8},
  sub:{fontSize:14,color:'#6b7280',textAlign:'center',marginBottom:20},
  card:{flexDirection:'row',backgroundColor:'#fff',borderRadius:14,padding:14,marginBottom:10,gap:12},
  cTitle:{fontSize:16,fontWeight:'700',color:'#111827'},
  cDesc:{fontSize:12,color:'#6b7280',marginTop:2},
  tags:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:6},
  btn:{backgroundColor:'#db2777',borderRadius:10,paddingVertical:10,marginTop:10,alignItems:'center'},
  btnText:{color:'#fff',fontSize:14,fontWeight:'600'},
});
