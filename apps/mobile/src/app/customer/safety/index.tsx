import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocale } from '@/components/LocaleProvider';

export default function SafetyScreen(): JSX.Element {
  const { t } = useLocale();
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.safety.title')}</Text>
      <Text style={s.sub}>{t('mobile.safety.subtitle')}</Text>
      <View style={s.grid}>
        {[
          {
            emoji: '🆘',
            title: 'زر الطوارئ',
            desc: 'اضغطي لإرسال موقعكِ للشرطة',
            color: '#ef4444',
            bg: '#fef2f2',
          },
          {
            emoji: '',
            title: 'توصيلي لسيارتي',
            desc: 'مرافق حتى باب السيارة',
            color: '#f59e0b',
            bg: '#fffbeb',
          },
          {
            emoji: '',
            title: 'مشاركة الموقع',
            desc: 'شاركي موقعكِ مع صديقة تثقين بها',
            color: '#3b82f6',
            bg: '#eff6ff',
          },
          {
            emoji: '',
            title: 'وصلت للبيت',
            desc: 'إشعار آلي عند وصولكِ',
            color: '#10b981',
            bg: '#ecfdf5',
          },
          {
            emoji: '',
            title: 'اسم مستعار',
            desc: 'احجزي باسم مستعار للخصوصية',
            color: '#8b5cf6',
            bg: '#f5f3ff',
          },
          {
            emoji: '',
            title: 'اتصال آمن',
            desc: 'خط ساخن للطوارئ 24/7',
            color: '#06b6d4',
            bg: '#ecfeff',
          },
          {
            emoji: '',
            title: 'تعمية الوجه',
            desc: 'أخفِ وجهكِ في الصور',
            color: '#6366f1',
            bg: '#eef2ff',
          },
          {
            emoji: '️',
            title: 'وضع التخفي',
            desc: 'تصفحي بدون تسجيل نشاطكِ',
            color: '#d946ef',
            bg: '#fdf4ff',
          },
          {
            emoji: '️',
            title: 'درع الموافقة',
            desc: 'موافقة صريحة قبل كل خدمة',
            color: '#14b8a6',
            bg: '#f0fdfa',
          },
        ].map((item, i) => (
          <View key={i} style={[s.card, { borderLeftColor: item.color, borderLeftWidth: 4 }]}>
            <Text style={s.ce}>{item.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.ct}>{item.title}</Text>
              <Text style={s.cs}>{item.desc}</Text>
            </View>
            <TouchableOpacity style={[s.btn, { backgroundColor: item.color }]}>
              <Text style={s.bt}>{t('mobile.safety.activate')}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  grid: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  ce: { fontSize: 28 },
  ct: { fontSize: 14, fontWeight: '700', color: '#111827' },
  cs: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  btn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  bt: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
const s = sc;
