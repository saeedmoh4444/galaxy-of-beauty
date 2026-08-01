import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function CartScreen(): JSX.Element {
  const { data, loading, error, refetch, refreshing, refresh } = useQuery(() => (trpc as any).marketplace.cart.query());

  const handleRemove = async (productId: number) => { try { await (trpc as any).marketplace.removeFromCart.mutate({ productId }); refetch(); } catch {} };

  if (loading) return <SkeletonList count={3} />;
  if (error) return <ErrorAlert message="فشل تحميل السلة" onRetry={refetch} />;

  const items = (data ?? []) as any[];
  const total = items.reduce((s:number, i:any) => s + (Number(i.product?.price ?? 0) * i.quantity), 0);

  return (
    <ScrollView style={s.c} contentContainerStyle={s.i} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#db2777']} />}>
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <Text style={s.t}>🛒 سلة التسوق</Text>
        {items.length > 0 && <View style={{backgroundColor:'#db2777',borderRadius:12,paddingHorizontal:10,paddingVertical:4}}><Text style={{color:'#fff',fontWeight:'700'}}>{items.length}</Text></View>}
      </View>

      {items.length === 0 && <View style={{alignItems:'center',padding:40}}><Text style={{fontSize:50}}>🛒</Text><Text style={{color:'#6b7280',marginTop:8}}>سلتكِ فاضية</Text></View>}

      {items.map((item: any) => {
        const p = item.product as any;
        return (
          <View key={item.id} style={s.card}>
            <Text style={{fontSize:30}}>🧴</Text>
            <View style={{flex:1}}><Text style={{fontWeight:'600',fontSize:14}}>{p?.nameJson?.ar ?? `منتج #${p?.id}`}</Text><Text style={{fontSize:12,color:'#6b7280'}}>الكمية: {item.quantity} · {(p?.price ?? 0).toLocaleString()} ر.س</Text></View>
            <View style={{alignItems:'flex-end'}}><Text style={{fontWeight:'700',color:'#db2777',fontSize:15}}>{((p?.price ?? 0) * item.quantity).toLocaleString()} ر.س</Text><TouchableOpacity onPress={() => handleRemove(p?.id)} style={{marginTop:4}}><Text style={{color:'#ef4444',fontSize:18}}>❌</Text></TouchableOpacity></View>
          </View>
        );
      })}

      {items.length > 0 && <View style={{backgroundColor:'#fff',borderRadius:14,padding:16,marginTop:12}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}><Text style={{color:'#6b7280',fontSize:14}}>الإجمالي</Text><Text style={{fontWeight:'800',fontSize:22,color:'#111827'}}>{total.toLocaleString()} ر.س</Text></View>
        <TouchableOpacity style={s.btn}><Text style={s.btnText}>💳 إتمام الشراء</Text></TouchableOpacity>
      </View>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c:{flex:1,backgroundColor:'#fdf2f8'}, i:{padding:16,paddingBottom:40},
  t:{fontSize:24,fontWeight:'800',color:'#111827'},
  card:{flexDirection:'row',alignItems:'center',backgroundColor:'#fff',borderRadius:12,padding:14,marginBottom:8,gap:10},
  btn:{backgroundColor:'#db2777',borderRadius:10,paddingVertical:14,alignItems:'center'},
  btnText:{color:'#fff',fontSize:15,fontWeight:'700'},
});
