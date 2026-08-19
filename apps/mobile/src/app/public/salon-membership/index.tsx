import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';

const MEMBERSHIPS = [
  {
    key: 'basic',
    emoji: '',
    name: 'الأساسية',
    price: 0,
    color: '#9ca3af',
    benefits: ['حجز المواعيد', 'تصفح الخدمات', 'تقييم الفنيات'],
    notIncluded: ['خصم على الخدمات', 'حجز أولوية', 'استشارات مجانية'],
  },
  {
    key: 'premium',
    emoji: '',
    name: 'المميزة',
    price: 99,
    color: '#f59e0b',
    benefits: [
      'خصم ١٠٪ على جميع الخدمات',
      'حجز أولوية',
      'استشارة مجانية شهرياً',
      'هدية ترحيبية',
      'نقاط مضاعفة',
      'دخول فعاليات حصرية',
    ],
    notIncluded: ['مديرة حساب شخصية'],
  },
  {
    key: 'platinum',
    emoji: '',
    name: 'البلاتينية',
    price: 299,
    color: '#7c3aed',
    benefits: [
      'خصم ٢٠٪ على جميع الخدمات',
      'حجز فوري',
      'استشارات غير محدودة',
      'مديرة حساب شخصية',
      'هدية شهرية',
      'نقاط ×٣',
      'فعاليات VIP',
      'خدمة توصيل مجانية',
    ],
    notIncluded: [],
  },
];

export default function SalonMembershipScreen(): JSX.Element {
  const { t } = useLocale();
  const [selected, setSelected] = useState('premium');

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{t('mobile.public.salon-membership.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.salon-membership.subtitle')}</Text>

      <View style={styles.cards}>
        {MEMBERSHIPS.map((m) => {
          const isSelected = selected === m.key;
          return (
            <TouchableOpacity
              key={m.key}
              onPress={() => setSelected(m.key)}
              style={[styles.card, isSelected && { borderColor: m.color, borderWidth: 3 }]}
            >
              <View style={[styles.cardHeader, { backgroundColor: m.color + '20' }]}>
                <Text style={styles.ce}>{m.emoji}</Text>
                <Text style={[styles.cn, { color: m.color }]}>{m.name}</Text>
                <Text style={styles.cp}>
                  {m.price === 0
                    ? t('mobile.public.salon-membership.free')
                    : t('mobile.public.salon-membership.price', { price: m.price })}
                </Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cbTitle}>{t('mobile.public.salon-membership.features')}</Text>
                {m.benefits.map((b, i) => (
                  <View key={i} style={styles.benefit}>
                    <Text style={styles.benefitBullet}></Text>
                    <Text style={styles.benefitText}>{b}</Text>
                  </View>
                ))}
                {m.notIncluded.length > 0 && (
                  <>
                    <Text style={[styles.cbTitle, { color: '#9ca3af', marginTop: 12 }]}>
                      {t('mobile.public.salon-membership.not-included')}
                    </Text>
                    {m.notIncluded.map((b, i) => (
                      <View key={i} style={styles.benefit}>
                        <Text style={styles.benefitBulletX}></Text>
                        <Text style={[styles.benefitText, { color: '#9ca3af' }]}>{b}</Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.bt}>{t('mobile.public.salon-membership.subscribe-cta')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  cards: { gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  cardHeader: { padding: 20, alignItems: 'center' },
  ce: { fontSize: 40 },
  cn: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  cp: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginTop: 2 },
  cardBody: { padding: 16 },
  cbTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  benefitBullet: { fontSize: 14, color: '#059669' },
  benefitBulletX: { fontSize: 14, color: '#9ca3af' },
  benefitText: { fontSize: 13, color: '#374151' },
  btn: {
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
