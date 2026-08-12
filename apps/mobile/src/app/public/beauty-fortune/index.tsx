import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';

const FORTUNES = [
  {
    text: 'جمالكِ يبدأ من داخلكِ — اعتني بنفسكِ اليوم ',
    emoji: '',
    tip: 'اشربي ٨ أكواب ماء اليوم لبشرة متألقة',
  },
  {
    text: 'الابتسامة هي أفضل إكسسوار يمكنكِ ارتداؤه ',
    emoji: '',
    tip: 'ابتسمي — تفرز الإندورفين وتحسن البشرة',
  },
  {
    text: 'أنتِ أجمل عندما تكونين على طبيعتكِ ',
    emoji: '',
    tip: 'اختاري مكياج يبرز جمالكِ الطبيعي',
  },
  {
    text: 'الاعتناء بنفسكِ ليس رفاهية — إنه ضرورة ‍️',
    emoji: '',
    tip: 'خصصي ٣٠ دقيقة يومياً للعناية ببشرتكِ',
  },
  {
    text: 'كل يوم هو فرصة جديدة لتتألقي ',
    emoji: '',
    tip: 'جربي روتين عناية جديد هذا الأسبوع',
  },
  {
    text: 'الجمال ليس ما ترينه في المرآة فقط — بل ما تشعرين به ',
    emoji: '',
    tip: 'دللي نفسكِ بجلسة مساج هذا الشهر',
  },
  {
    text: 'ثقتكِ بنفسكِ هي سر جمالكِ ',
    emoji: '',
    tip: 'قفي أمام المرآة وقولي شيئاً إيجابياً عن نفسكِ',
  },
  {
    text: 'العناية بالبشرة استثمار — ليس مصروفاً ',
    emoji: '',
    tip: 'استثمري في روتين عناية منتظم',
  },
  {
    text: 'أنتِ تستحقين الأفضل دائماً ',
    emoji: '',
    tip: 'لا تترددي في تدليل نفسكِ بين الحين والآخر',
  },
  {
    text: 'جمالكِ فريد — لا تقارنيه بأحد ',
    emoji: '',
    tip: 'اختاري خدمات تناسب نوع بشرتكِ الفريد',
  },
  {
    text: 'الراحة والاسترخاء سر من أسرار الجمال ‍️',
    emoji: '',
    tip: 'احجزي جلسة استرخاء هذا الأسبوع',
  },
  { text: 'غداً أجمل — ابدئي اليوم ', emoji: '', tip: 'ابدئي روتين عناية متكامل من اليوم' },
];

export default function BeautyFortuneScreen(): JSX.Element {
  const [fortune, setFortune] = useState<(typeof FORTUNES)[0]>(FORTUNES[0]!);

  const getRandom = () => {
    const next = FORTUNES[Math.floor(Math.random() * FORTUNES.length)] ?? FORTUNES[0]!;
    setFortune(next);
  };

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}> حظ الجمال</Text>
      <View style={styles.card}>
        <Text style={styles.fortuneEmoji}>{fortune.emoji}</Text>
        <Text style={styles.fortuneText}>{fortune.text}</Text>
        <Text style={styles.tip}> {fortune.tip}</Text>
        <TouchableOpacity onPress={getRandom} style={styles.btn}>
          <Text style={styles.btnText}> جربي حظك</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf4ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40, alignItems: 'center' },
  t: { fontSize: 24, fontWeight: '800', color: '#a21caf', textAlign: 'center', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#f0abfc',
  },
  fortuneEmoji: { fontSize: 64, marginBottom: 16 },
  fortuneText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 28,
  },
  tip: { fontSize: 13, color: '#a21caf', marginTop: 16, textAlign: 'center' },
  btn: {
    backgroundColor: '#a21caf',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
