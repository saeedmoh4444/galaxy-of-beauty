import { View, Text, ScrollView, StyleSheet } from 'react-native';
export default function TermsScreen(): JSX.Element {
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}> الشروط والأحكام</Text>
      <Text style={s.d}>آخر تحديث: 1 أغسطس 2026</Text>
      {[
        'مقدمة',
        'باستخدامكِ لمنصة جالكسي بيوتي فإنكِ توافقين على الشروط والأحكام التالية. يرجى قراءتها بعناية.',
        'الحسابات',
        'أنتِ مسؤولة عن الحفاظ على سرية حسابكِ وكلمة المرور. يجب أن تكوني 18 عاماً أو أكثر لاستخدام المنصة.',
        'الحجوزات',
        'جميع الحجوزات تخضع للتوفر. يمكنكِ إلغاء الحجز قبل 24 ساعة بدون رسوم.',
        'المدفوعات',
        'يتم تحصيل المدفوعات عبر بوابات دفع آمنة. الأسعار شاملة لضريبة القيمة المضافة.',
        'الإلغاء والاسترداد',
        '• إلغاء قبل 24 ساعة: استرداد كامل\n• إلغاء قبل 12 ساعة: استرداد 50%\n• إلغاء قبل أقل من ساعتين: لا استرداد',
        'الخصوصية',
        'نحن نحمي بياناتكِ ولا نشاركها مع أطراف ثالثة بدون موافقتكِ. راجعي سياسة الخصوصية للمزيد.',
        'المسؤولية',
        'جالكسي بيوتي غير مسؤولة عن أي إصابات أو أضرار ناتجة عن الخدمات المقدمة من قبل الفنيات المستقلات.',
        'تواصل',
        'لأي استفسارات: support@galaxybeauty.sa',
      ].map((text, i) => (
        <View key={i} style={i % 2 === 0 ? { marginTop: 20, marginBottom: 4 } : {}}>
          <Text style={i % 2 === 0 ? s.st : s.sb}>{text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' },
  i: { padding: 24, paddingTop: 50, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  d: { fontSize: 12, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  st: { fontSize: 18, fontWeight: '700', color: '#111827' },
  sb: { fontSize: 14, lineHeight: 24, color: '#374151', textAlign: 'right' },
});
const s = sc;
