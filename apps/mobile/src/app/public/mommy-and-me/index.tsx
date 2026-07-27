import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const P = [{ e: '💅', t: 'مانيكير الأم وابنتها', p: 150 }, { e: '💇‍♀️', t: 'تسريحة الأم وابنتها', p: 200 }, { e: '✨', t: 'عناية بالبشرة للأم وابنتها', p: 250 }, { e: '👰', t: 'إطلالة الزفاف', p: 500 }, { e: '🧖‍♀️', t: 'يوم منتجع صحي', p: 600 }];
export default function MommyAndMeScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}><Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>👩‍👧 أم وابنتها</Text></View>
      <ScrollView style={{ flex: 1, padding: 16 }}>{P.map((p, i) => <View key={i} style={{ padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12 }}><Text style={{ fontSize: 24, textAlign: 'center' }}>{p.e}</Text><Text style={{ fontWeight: 'bold', textAlign: 'center', marginTop: 4 }}>{p.t}</Text><Text style={{ color: '#7c3aed', fontWeight: 'bold', textAlign: 'center', marginTop: 4, fontSize: 18 }}>{p.p} ر.س</Text></View>)}</ScrollView>
    </View>
  );
}
