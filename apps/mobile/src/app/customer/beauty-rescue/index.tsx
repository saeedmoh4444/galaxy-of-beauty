import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import type { JSX } from 'react';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface Emergency {
  key: string;
  emoji: string;
  nameKey: TranslationKey;
  descKey: TranslationKey;
  price: number;
  timeKey: TranslationKey;
  tipKeys: TranslationKey[];
}

const EMERGENCIES: Emergency[] = [
  {
    key: 'pimple',
    emoji: '🔴',
    nameKey: 'rescue.emergency.pimple',
    descKey: 'rescue.desc.pimple',
    price: 50,
    timeKey: 'rescue.time.pimple',
    tipKeys: ['rescue.tip.pimple1', 'rescue.tip.pimple2', 'rescue.tip.pimple3'],
  },
  {
    key: 'smudge',
    emoji: '💄',
    nameKey: 'rescue.emergency.smudge',
    descKey: 'rescue.desc.smudge',
    price: 40,
    timeKey: 'rescue.time.smudge',
    tipKeys: ['rescue.tip.smudge1', 'rescue.tip.smudge2', 'rescue.tip.smudge3'],
  },
  {
    key: 'hair',
    emoji: '💇',
    nameKey: 'rescue.emergency.hair',
    descKey: 'rescue.desc.hair',
    price: 60,
    timeKey: 'rescue.time.hair',
    tipKeys: ['rescue.tip.hair1', 'rescue.tip.hair2', 'rescue.tip.hair3'],
  },
  {
    key: 'nail',
    emoji: '💅',
    nameKey: 'rescue.emergency.nail',
    descKey: 'rescue.desc.nail',
    price: 35,
    timeKey: 'rescue.time.nail',
    tipKeys: ['rescue.tip.nail1', 'rescue.tip.nail2', 'rescue.tip.nail3'],
  },
  {
    key: 'dry',
    emoji: '💧',
    nameKey: 'rescue.emergency.dry',
    descKey: 'rescue.desc.dry',
    price: 45,
    timeKey: 'rescue.time.dry',
    tipKeys: ['rescue.tip.dry1', 'rescue.tip.dry2', 'rescue.tip.dry3'],
  },
  {
    key: 'redness',
    emoji: '🧊',
    nameKey: 'rescue.emergency.redness',
    descKey: 'rescue.desc.redness',
    price: 55,
    timeKey: 'rescue.time.redness',
    tipKeys: ['rescue.tip.redness1', 'rescue.tip.redness2', 'rescue.tip.redness3'],
  },
];

interface TipItem {
  e: string;
  key: TranslationKey;
}

interface RescueCard {
  emoji: string;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  color: string;
  bg: string;
  tips: TipItem[];
}

const SOS_CARDS: RescueCard[] = [
  {
    emoji: '💢',
    titleKey: 'mobile.beautyRescue.sos.acne.title',
    subtitleKey: 'mobile.beautyRescue.sos.acne.subtitle',
    color: '#ef4444',
    bg: '#fef2f2',
    tips: [
      { e: '🧊', key: 'mobile.beautyRescue.sos.acne.tip1' },
      { e: '🩹', key: 'mobile.beautyRescue.sos.acne.tip2' },
      { e: '🙅', key: 'mobile.beautyRescue.sos.acne.tip3' },
      { e: '🧴', key: 'mobile.beautyRescue.sos.acne.tip4' },
    ],
  },
  {
    emoji: '🔥',
    titleKey: 'mobile.beautyRescue.sos.sunburn.title',
    subtitleKey: 'mobile.beautyRescue.sos.sunburn.subtitle',
    color: '#ea580c',
    bg: '#fff7ed',
    tips: [
      { e: '❄️', key: 'mobile.beautyRescue.sos.sunburn.tip1' },
      { e: '🌿', key: 'mobile.beautyRescue.sos.sunburn.tip2' },
      { e: '💧', key: 'mobile.beautyRescue.sos.sunburn.tip3' },
      { e: '🙅', key: 'mobile.beautyRescue.sos.sunburn.tip4' },
    ],
  },
  {
    emoji: '👀',
    titleKey: 'mobile.beautyRescue.sos.puffyEyes.title',
    subtitleKey: 'mobile.beautyRescue.sos.puffyEyes.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { e: '🥄', key: 'mobile.beautyRescue.sos.puffyEyes.tip1' },
      { e: '🫖', key: 'mobile.beautyRescue.sos.puffyEyes.tip2' },
      { e: '🛏️', key: 'mobile.beautyRescue.sos.puffyEyes.tip3' },
      { e: '👁', key: 'mobile.beautyRescue.sos.puffyEyes.tip4' },
    ],
  },
  {
    emoji: '👄',
    titleKey: 'mobile.beautyRescue.sos.chappedLips.title',
    subtitleKey: 'mobile.beautyRescue.sos.chappedLips.subtitle',
    color: '#e11d48',
    bg: '#fff1f2',
    tips: [
      { e: '🍯', key: 'mobile.beautyRescue.sos.chappedLips.tip1' },
      { e: '💊', key: 'mobile.beautyRescue.sos.chappedLips.tip2' },
      { e: '💧', key: 'mobile.beautyRescue.sos.chappedLips.tip3' },
      { e: '🙅', key: 'mobile.beautyRescue.sos.chappedLips.tip4' },
    ],
  },
  {
    emoji: '🧊',
    titleKey: 'mobile.beautyRescue.sos.redness.title',
    subtitleKey: 'mobile.beautyRescue.sos.redness.subtitle',
    color: '#059669',
    bg: '#ecfdf5',
    tips: [
      { e: '💦', key: 'mobile.beautyRescue.sos.redness.tip1' },
      { e: '🌿', key: 'mobile.beautyRescue.sos.redness.tip2' },
      { e: '💤', key: 'mobile.beautyRescue.sos.redness.tip3' },
      { e: '🧴', key: 'mobile.beautyRescue.sos.redness.tip4' },
    ],
  },
];

const AFTERCARE_CARDS: RescueCard[] = [
  {
    emoji: '💉',
    titleKey: 'mobile.beautyRescue.aftercare.botox.title',
    subtitleKey: 'mobile.beautyRescue.aftercare.botox.subtitle',
    color: '#0284c7',
    bg: '#f0f9ff',
    tips: [
      { e: '🙅', key: 'mobile.beautyRescue.aftercare.botox.tip1' },
      { e: '🛌', key: 'mobile.beautyRescue.aftercare.botox.tip2' },
      { e: '🙅', key: 'mobile.beautyRescue.aftercare.botox.tip3' },
      { e: '✨', key: 'mobile.beautyRescue.aftercare.botox.tip4' },
    ],
  },
  {
    emoji: '💧',
    titleKey: 'mobile.beautyRescue.aftercare.filler.title',
    subtitleKey: 'mobile.beautyRescue.aftercare.filler.subtitle',
    color: '#7c3aed',
    bg: '#f5f3ff',
    tips: [
      { e: '❄️', key: 'mobile.beautyRescue.aftercare.filler.tip1' },
      { e: '🙅', key: 'mobile.beautyRescue.aftercare.filler.tip2' },
      { e: '🙅', key: 'mobile.beautyRescue.aftercare.filler.tip3' },
      { e: '✨', key: 'mobile.beautyRescue.aftercare.filler.tip4' },
    ],
  },
  {
    emoji: '⚡',
    titleKey: 'mobile.beautyRescue.aftercare.laser.title',
    subtitleKey: 'mobile.beautyRescue.aftercare.laser.subtitle',
    color: '#ef4444',
    bg: '#fef2f2',
    tips: [
      { e: '☀️', key: 'mobile.beautyRescue.aftercare.laser.tip1' },
      { e: '🧴', key: 'mobile.beautyRescue.aftercare.laser.tip2' },
      { e: '🙅', key: 'mobile.beautyRescue.aftercare.laser.tip3' },
      { e: '🧴', key: 'mobile.beautyRescue.aftercare.laser.tip4' },
    ],
  },
  {
    emoji: '🍋',
    titleKey: 'mobile.beautyRescue.aftercare.peel.title',
    subtitleKey: 'mobile.beautyRescue.aftercare.peel.subtitle',
    color: '#d97706',
    bg: '#fffbeb',
    tips: [
      { e: '💧', key: 'mobile.beautyRescue.aftercare.peel.tip1' },
      { e: '🙅', key: 'mobile.beautyRescue.aftercare.peel.tip2' },
      { e: '☀️', key: 'mobile.beautyRescue.aftercare.peel.tip3' },
      { e: '🙅', key: 'mobile.beautyRescue.aftercare.peel.tip4' },
    ],
  },
  {
    emoji: '🪒',
    titleKey: 'mobile.beautyRescue.aftercare.hairRemoval.title',
    subtitleKey: 'mobile.beautyRescue.aftercare.hairRemoval.subtitle',
    color: '#ec4899',
    bg: '#fdf2f8',
    tips: [
      { e: '🧴', key: 'mobile.beautyRescue.aftercare.hairRemoval.tip1' },
      { e: '💦', key: 'mobile.beautyRescue.aftercare.hairRemoval.tip2' },
      { e: '👕', key: 'mobile.beautyRescue.aftercare.hairRemoval.tip3' },
      { e: '🧖', key: 'mobile.beautyRescue.aftercare.hairRemoval.tip4' },
    ],
  },
];

export default function BeautyRescueScreen(): JSX.Element {
  const { t } = useLocale();
  const [selected, setSelected] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  const emergency = EMERGENCIES.find((e) => e.key === selected);

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{t('beautyRescue.title')}</Text>
      <Text style={styles.sub}>{t('beautyRescue.subtitle')}</Text>

      {booked && emergency ? (
        <View style={styles.confirmed}>
          <Text style={styles.cfEmoji}>✅</Text>
          <Text style={styles.cfTitle}>{t('beautyRescue.requested')}</Text>
          <Text style={styles.cfText}>
            {t('beautyRescue.on-the-way', { time: t(emergency.timeKey) })}
          </Text>
          <Text style={styles.cfPrice}>
            {t('beautyRescue.price-fee', {
              price: (emergency.price * 1.5).toLocaleString(),
            })}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setBooked(false);
              setSelected(null);
            }}
            style={styles.cfBtn}
          >
            <Text style={styles.cfBt}>{t('beautyRescue.done')}</Text>
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
                <Text style={styles.cn}>{t(e.nameKey)}</Text>
                <Text style={styles.cd}>{t(e.descKey)}</Text>
                <Text style={styles.cp}>
                  {t('beautyRescue.price-time', { price: e.price ?? 0, time: t(e.timeKey) })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {emergency && (
            <View style={styles.detail}>
              <Text style={styles.dt}>
                {emergency.emoji} {t(emergency.nameKey)}
              </Text>
              <Text style={styles.dsub}>{t('beautyRescue.includes')}</Text>
              {emergency.tipKeys.map((tipKey, i) => (
                <View key={i} style={styles.dr}>
                  <Text style={styles.db}>✨</Text>
                  <Text style={styles.dx}>{t(tipKey)}</Text>
                </View>
              ))}
              <View style={styles.dp}>
                <Text style={styles.dpl}>
                  {t('beautyRescue.regular-price', { price: emergency.price ?? 0 })}
                </Text>
                <Text style={styles.dpe}>
                  {t('beautyRescue.urgent-price', {
                    price: (emergency.price * 1.5).toLocaleString(),
                  })}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setBooked(true)} style={styles.btn}>
                <Text style={styles.bt}>
                  {t('beautyRescue.book-now', { time: t(emergency.timeKey) })}
                </Text>
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
        {t('beautyRescue.sos-tips')}
      </Text>
      {SOS_CARDS.map((c, i) => (
        <View key={i} style={[styles.card, { borderColor: c.color + '30' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Text style={{ fontSize: 24 }}>{c.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: c.color }}>
                {t(c.titleKey)}
              </Text>
              <Text style={{ fontSize: 11, color: '#9ca3af' }}>{t(c.subtitleKey)}</Text>
            </View>
          </View>
          {c.tips.map((tip, j) => (
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
              <Text style={{ fontSize: 12 }}>{tip.e}</Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '500',
                  color: c.color,
                  flex: 1,
                  textAlign: 'right',
                }}
              >
                {t(tip.key)}
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
        {t('beautyRescue.aftercare')}
      </Text>
      {AFTERCARE_CARDS.map((c, i) => (
        <View key={i} style={[styles.card, { borderColor: c.color + '30' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Text style={{ fontSize: 24 }}>{c.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: c.color }}>
                {t(c.titleKey)}
              </Text>
              <Text style={{ fontSize: 11, color: '#9ca3af' }}>{t(c.subtitleKey)}</Text>
            </View>
          </View>
          {c.tips.map((tip, j) => (
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
              <Text style={{ fontSize: 12 }}>{tip.e}</Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '500',
                  color: c.color,
                  flex: 1,
                  textAlign: 'right',
                }}
              >
                {t(tip.key)}
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
