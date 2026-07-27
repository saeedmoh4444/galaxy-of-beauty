import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const QS = [
  { q: 'ما المناسبة؟', opts: [{ l: 'يومي ☀️', v: 'daily' }, { l: 'مناسبة ✨', v: 'special' }, { l: 'زفاف 👰', v: 'wedding' }] },
  { q: 'على ماذا تركزين؟', opts: [{ l: 'شعر 💇‍♀️', v: 'hair' }, { l: 'بشرة ✨', v: 'skin' }, { l: 'مكياج 💄', v: 'makeup' }] },
  { q: 'ميزانيتكِ؟', opts: [{ l: 'اقتصادية 💰', v: 'low' }, { l: 'متوسطة 💵', v: 'mid' }, { l: 'فاخرة 💎', v: 'high' }] },
];

export default function BeautyQuizScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const q = QS[step]!;

  if (step >= QS.length) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 48 }}>✨</Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 16, textAlign: 'center' }}>اقتراحاتكِ جاهزة!</Text>
        <Text style={{ color: '#6b7280', marginTop: 8, textAlign: 'center' }}>تصفحي الخدمات المناسبة لكِ</Text>
        <TouchableOpacity onPress={() => setStep(0)} style={{ marginTop: 24, backgroundColor: '#7c3aed', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10 }}><Text style={{ color: '#fff' }}>🔄 إعادة</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#fff', padding: 24 }}>
      <View style={{ flexDirection: 'row', gap: 4, marginBottom: 32 }}>{QS.map((_, i) => <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= step ? '#7c3aed' : '#e5e7eb' }} />)}</View>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 }}>{q.q}</Text>
      {q.opts.map(o => <TouchableOpacity key={o.v} onPress={() => setStep(step + 1)} style={{ padding: 16, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, marginBottom: 8 }}><Text style={{ fontSize: 18, textAlign: 'center' }}>{o.l}</Text></TouchableOpacity>)}
    </View>
  );
}
