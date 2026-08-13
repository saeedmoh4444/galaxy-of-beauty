import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';

const EMERGENCIES = [
  {
    key: 'pimple',
    emoji: '',
    name: 'بثرة طارئة',
    desc: 'ظهور بثرة قبل مناسبة',
    price: 50,
    time: '30 دقيقة',
    tips: ['علاج موضعي سريع', 'تغطية احترافية', 'نصيحة وقائية'],
  },
  {
    key: 'smudge',
    emoji: '',
    name: 'مكياج متلطخ',
    desc: 'تلطخ المكياج فجأة',
    price: 40,
    time: '20 دقيقة',
    tips: ['إصلاح سريع', 'لمسات نهائية', 'تثبيت المكياج'],
  },
  {
    key: 'hair',
    emoji: '‍️',
    name: 'شعر طارئ',
    desc: 'تسريحة تفسد فجأة',
    price: 60,
    time: '30 دقيقة',
    tips: ['إعادة تصفيف سريع', 'تثبيت', 'لمسات نهائية'],
  },
  {
    key: 'nail',
    emoji: '',
    name: 'ظفر مكسور',
    desc: 'كسر ظفر قبل مناسبة',
    price: 35,
    time: '15 دقيقة',
    tips: ['إصلاح سريع', 'تطبيق لون مطابق', 'تقوية'],
  },
  {
    key: 'dry',
    emoji: '️',
    name: 'بشرة جافة',
    desc: 'جفاف مفاجئ للبشرة',
    price: 45,
    time: '25 دقيقة',
    tips: ['ترطيب طارئ', 'قناع سريع', 'تجهيز للمكياج'],
  },
  {
    key: 'redness',
    emoji: '',
    name: 'احمرار البشرة',
    desc: 'احمرار أو تهيج مفاجئ',
    price: 55,
    time: '30 دقيقة',
    tips: ['تهدئة فورية', 'قناع مهدئ', 'تغطية خفيفة'],
  },
];

export default function BeautyRescueScreen(): JSX.Element {
  const [selected, setSelected] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  const emergency = EMERGENCIES.find((e) => e.key === selected);

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}> إنقاذ الجمال</Text>
      <Text style={styles.sub}>خدمات تجميل طارئة — نصل لكِ خلال ساعة</Text>

      {booked && emergency ? (
        <View style={styles.confirmed}>
          <Text style={styles.cfEmoji}></Text>
          <Text style={styles.cfTitle}>تم الطلب!</Text>
          <Text style={styles.cfText}>خبيرة التجميل في الطريق — تصل خلال {emergency.time}</Text>
          <Text style={styles.cfPrice}>
            {(emergency.price * 1.5).toLocaleString()} ر.س (شامل رسوم الطوارئ)
          </Text>
          <TouchableOpacity
            onPress={() => {
              setBooked(false);
              setSelected(null);
            }}
            style={styles.cfBtn}
          >
            <Text style={styles.cfBt}>تم</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.grid}>
            {EMERGENCIES.map((e) => (
              <TouchableOpacity
                key={e.key}
                onPress={() => setSelected(e.key)}
                style={[styles.card, selected === e.key && styles.cardActive]}
              >
                <Text style={styles.ce}>{e.emoji}</Text>
                <Text style={styles.cn}>{e.name}</Text>
                <Text style={styles.cd}>{e.desc}</Text>
                <Text style={styles.cp}>
                  {e.price} ر.س · {e.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {emergency && (
            <View style={styles.detail}>
              <Text style={styles.dt}>
                {emergency.emoji} {emergency.name}
              </Text>
              <Text style={styles.dsub}>العلاج يشمل:</Text>
              {emergency.tips.map((t, i) => (
                <View key={i} style={styles.dr}>
                  <Text style={styles.db}></Text>
                  <Text style={styles.dx}>{t}</Text>
                </View>
              ))}
              <View style={styles.dp}>
                <Text style={styles.dpl}>السعر العادي: {emergency.price} ر.س</Text>
                <Text style={styles.dpe}>
                  السعر الطارئ: {(emergency.price * 1.5).toLocaleString()} ر.س
                </Text>
              </View>
              <TouchableOpacity onPress={() => setBooked(true)} style={styles.btn}>
                <Text style={styles.bt}> احجزي الآن — نصل خلال {emergency.time}</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
      <Text
        style={{
          fontSize: 20,
          fontWeight: '800',
          color: '#111827',
          marginTop: 24,
          marginBottom: 12,
        }}
      >
         نصائح SOS منزلية
      </Text>
      {[
        {
          emoji: '',
          title: 'طوارئ الحبوب',
          subtitle: 'ظهور مفاجئ — حل سريع',
          color: '#ef4444',
          bg: '#fef2f2',
          tips: [
            { e: '', t: 'كمادة ثلج — 5 دقائق لتقليل الالتهاب' },
            { e: '', t: 'لصقة حبوب — تجفف وتحمي من العبث' },
            { e: '', t: 'لا تضغطي — يزيد الالتهاب ويترك أثراً' },
            { e: '', t: 'كريم بنزويل بيروكسايد — للطوارئ' },
          ],
        },
        {
          emoji: '',
          title: 'علاج حروق الشمس',
          subtitle: 'إسعاف سريع للبشرة المحروقة',
          color: '#ea580c',
          bg: '#fff7ed',
          tips: [
            { e: '️', t: 'كمادات باردة — 15 دقيقة كل ساعة' },
            { e: '', t: 'جل الألوفيرا — مبرد في الثلاجة' },
            { e: '', t: 'اشربي ماء كثيراً — الترطيب من الداخل' },
            { e: '', t: 'لا تقشري — الجلد يتجدد طبيعياً' },
          ],
        },
        {
          emoji: '',
          title: 'انتفاخ العيون',
          subtitle: 'صباح منتفخ — حل سريع',
          color: '#0284c7',
          bg: '#f0f9ff',
          tips: [
            { e: '', t: 'ملعقتان باردتان — على الجفون 5 دقائق' },
            { e: '🫖', t: 'أكياس شاي أخضر — كافيين يقلص الانتفاخ' },
            { e: '️', t: 'وسادة مرتفعة — تقلل تجمع السوائل' },
            { e: '', t: 'كريم عيون بكافيين — نتائج فورية' },
          ],
        },
        {
          emoji: '',
          title: 'تشقق الشفاه',
          subtitle: 'علاج سريع للشفاه الجافة',
          color: '#e11d48',
          bg: '#fff1f2',
          tips: [
            { e: '', t: 'مقشر سكر + عسل — مرة أسبوعياً' },
            { e: '', t: 'بلسم بفيتامين E — كل ساعتين' },
            { e: '', t: 'اشربي ماء — الجفاف يبدأ من الداخل' },
            { e: '', t: 'لا تلعقي شفاهكِ — اللعاب يزيد الجفاف' },
          ],
        },
        {
          emoji: '',
          title: 'تهدئة الاحمرار',
          subtitle: 'بشرة هادئة في دقائق',
          color: '#059669',
          bg: '#ecfdf5',
          tips: [
            { e: '', t: 'ماء بارد — يغسل الوجه ويقلص الأوعية' },
            { e: '', t: 'جل الألوفيرا — مهدئ طبيعي فوري' },
            { e: '', t: 'أوقفي المنتجات النشطة — يوم راحة' },
            { e: '', t: 'مرطب بسيط — بدون عطور أو أحماض' },
          ],
        },
      ].map((c, i) => (
        <View key={i} style={[styles.card, { borderColor: c.color + '30' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Text style={{ fontSize: 24 }}>{c.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: c.color }}>{c.title}</Text>
              <Text style={{ fontSize: 11, color: '#9ca3af' }}>{c.subtitle}</Text>
            </View>
          </View>
          {c.tips.map((t, j) => (
            <View
              key={j}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 8,
                marginBottom: 4,
                backgroundColor: c.bg,
              }}
            >
              <Text style={{ fontSize: 12 }}>{t.e}</Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '500',
                  color: c.color,
                  flex: 1,
                  textAlign: 'right',
                }}
              >
                {t.t}
              </Text>
            </View>
          ))}
        </View>
      ))}
      <Text
        style={{
          fontSize: 20,
          fontWeight: '800',
          color: '#111827',
          marginTop: 24,
          marginBottom: 12,
        }}
      >
         عناية ما بعد الإجراءات
      </Text>
      {[
        {
          emoji: '',
          title: 'بعد البوتوكس',
          subtitle: 'تعليمات ما بعد الحقن',
          color: '#0284c7',
          bg: '#f0f9ff',
          tips: [
            { e: '', t: 'لا تلمسي — لا تدلكي 24 ساعة' },
            { e: '', t: 'ابقِ رأسك مرفوعاً — 4 ساعات' },
            { e: '', t: 'لا رياضة — 24 ساعة' },
            { e: '️', t: 'النتيجة النهائية — 10-14 يوم' },
          ],
        },
        {
          emoji: '',
          title: 'بعد الفيلر',
          subtitle: 'عناية ما بعد التعبئة',
          color: '#7c3aed',
          bg: '#f5f3ff',
          tips: [
            { e: '', t: 'كمادات باردة — لتقليل التورم' },
            { e: '', t: 'تجنبي الضغط — لا تنامي على الوجه' },
            { e: '', t: 'لا مكياج — 24 ساعة' },
            { e: '️', t: 'النتيجة النهائية — بعد أسبوعين' },
          ],
        },
        {
          emoji: '',
          title: 'بعد الليزر',
          subtitle: 'عناية خاصة بعد جلسة الليزر',
          color: '#ef4444',
          bg: '#fef2f2',
          tips: [
            { e: '️', t: 'تجنبي الشمس — أسبوع كامل' },
            { e: '', t: 'SPF 50+ — ضرورة مطلقة' },
            { e: '', t: 'لا تقشري — 5 أيام' },
            { e: '', t: 'مرطب لطيف — ألوفيرا أو بانثينول' },
          ],
        },
        {
          emoji: '',
          title: 'بعد التقشير',
          subtitle: 'روتين ما بعد التقشير الكيميائي',
          color: '#d97706',
          bg: '#fffbeb',
          tips: [
            { e: '', t: 'ترطيب مكثف — كريمات مهدئة' },
            { e: '', t: 'لا تقشري الجلد — اتركيه يسقط' },
            { e: '️', t: 'SPF 50+ — البشرة حساسة جداً' },
            { e: '', t: 'لا ريتينول — لمدة أسبوع' },
          ],
        },
        {
          emoji: '️',
          title: 'بعد إزالة الشعر',
          subtitle: 'بشرة ناعمة — بدون التهاب',
          color: '#ec4899',
          bg: '#fdf2f8',
          tips: [
            { e: '', t: 'كريم مهدئ — ألوفيرا أو بانثينول' },
            { e: '', t: 'لا تعرقي — 24 ساعة بدون رياضة' },
            { e: '', t: 'ملابس قطنية واسعة — للتهوية' },
            { e: '', t: 'تقشير لطيف — بعد 3 أيام' },
          ],
        },
      ].map((c, i) => (
        <View key={i} style={[styles.card, { borderColor: c.color + '30' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Text style={{ fontSize: 24 }}>{c.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: c.color }}>{c.title}</Text>
              <Text style={{ fontSize: 11, color: '#9ca3af' }}>{c.subtitle}</Text>
            </View>
          </View>
          {c.tips.map((t, j) => (
            <View
              key={j}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 8,
                marginBottom: 4,
                backgroundColor: c.bg,
              }}
            >
              <Text style={{ fontSize: 12 }}>{t.e}</Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '500',
                  color: c.color,
                  flex: 1,
                  textAlign: 'right',
                }}
              >
                {t.t}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fef2f2' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#dc2626', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  cardActive: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  ce: { fontSize: 36 },
  cn: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 4 },
  cd: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  cp: { fontSize: 12, fontWeight: '600', color: '#dc2626', marginTop: 6 },
  detail: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#fca5a5',
  },
  dt: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  dsub: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  dr: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  db: { fontSize: 14, color: '#059669' },
  dx: { fontSize: 13, color: '#374151' },
  dp: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  dpl: { fontSize: 13, color: '#9ca3af', textDecorationLine: 'line-through' },
  dpe: { fontSize: 15, fontWeight: '800', color: '#dc2626' },
  btn: {
    backgroundColor: '#dc2626',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  bt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  confirmed: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#86efac',
  },
  cfEmoji: { fontSize: 64 },
  cfTitle: { fontSize: 20, fontWeight: '800', color: '#059669', marginTop: 8 },
  cfText: { fontSize: 14, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  cfPrice: { fontSize: 18, fontWeight: '700', color: '#dc2626', marginTop: 8 },
  cfBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
  },
  cfBt: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
});
