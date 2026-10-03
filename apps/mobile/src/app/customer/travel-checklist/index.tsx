import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import type { JSX } from 'react';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface Essential {
  itemKey: TranslationKey;
  checked: boolean;
}

interface Destination {
  key: string;
  emoji: string;
  nameKey: TranslationKey;
  color: string;
  essentials: Essential[];
  tipKey: TranslationKey;
}

const DESTINATIONS: Destination[] = [
  {
    key: 'beach',
    emoji: '🏖️',
    nameKey: 'travel.dest.beach',
    color: '#0891b2',
    essentials: [
      { itemKey: 'travel.item.beach1', checked: false },
      { itemKey: 'travel.item.beach2', checked: false },
      { itemKey: 'travel.item.beach3', checked: false },
      { itemKey: 'travel.item.beach4', checked: false },
      { itemKey: 'travel.item.beach5', checked: false },
      { itemKey: 'travel.item.beach6', checked: false },
      { itemKey: 'travel.item.beach7', checked: false },
      { itemKey: 'travel.item.beach8', checked: false },
    ],
    tipKey: 'travel.tips.beach',
  },
  {
    key: 'city',
    emoji: '🏙️',
    nameKey: 'travel.dest.city',
    color: '#6366f1',
    essentials: [
      { itemKey: 'travel.item.city1', checked: false },
      { itemKey: 'travel.item.city2', checked: false },
      { itemKey: 'travel.item.city3', checked: false },
      { itemKey: 'travel.item.city4', checked: false },
      { itemKey: 'travel.item.city5', checked: false },
      { itemKey: 'travel.item.city6', checked: false },
      { itemKey: 'travel.item.city7', checked: false },
      { itemKey: 'travel.item.city8', checked: false },
    ],
    tipKey: 'travel.tips.city',
  },
  {
    key: 'mountain',
    emoji: '⛰️',
    nameKey: 'travel.dest.mountain',
    color: '#059669',
    essentials: [
      { itemKey: 'travel.item.mountain1', checked: false },
      { itemKey: 'travel.item.mountain2', checked: false },
      { itemKey: 'travel.item.mountain3', checked: false },
      { itemKey: 'travel.item.mountain4', checked: false },
      { itemKey: 'travel.item.mountain5', checked: false },
      { itemKey: 'travel.item.mountain6', checked: false },
      { itemKey: 'travel.item.mountain7', checked: false },
      { itemKey: 'travel.item.mountain8', checked: false },
    ],
    tipKey: 'travel.tips.mountain',
  },
];

export default function TravelChecklistScreen(): JSX.Element {
  const { t } = useLocale();
  const [dest, setDest] = useState('beach');
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const d = DESTINATIONS.find((x) => x.key === dest)!;
  const toggle = (item: TranslationKey) => {
    const n = new Set(checked);
    if (n.has(item)) n.delete(item);
    else n.add(item);
    setChecked(n);
  };
  const progress = Math.round((checked.size / d.essentials.length) * 100);

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{t('mobile.travelKit.title')}</Text>
      <Text style={styles.sub}>{t('mobile.travelChecklist.subtitle')}</Text>

      <View style={styles.tabs}>
        {DESTINATIONS.map((dx) => (
          <TouchableOpacity
            key={dx.key}
            onPress={() => {
              setDest(dx.key);
              setChecked(new Set());
            }}
            style={[styles.tb, dest === dx.key && { backgroundColor: dx.color }]}
          >
            <Text style={[styles.tbe, dest === dx.key && { color: '#fff' }]}>{dx.emoji}</Text>
            <Text style={[styles.tbn, dest === dx.key && { color: '#fff' }]}>{t(dx.nameKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progress}>
        <Text style={styles.pt}>{t('mobile.travelChecklist.progress', { progress })}</Text>
        <View style={styles.bar}>
          <View style={[styles.fill, { width: `${progress}%`, backgroundColor: d.color }]} />
        </View>
      </View>

      <Text style={styles.st}>{t('mobile.travelChecklist.list')}</Text>
      {d.essentials.map((e, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => toggle(e.itemKey)}
          style={[styles.item, checked.has(e.itemKey) && styles.itemDone]}
        >
          <View
            style={[
              styles.check,
              checked.has(e.itemKey) && { backgroundColor: d.color, borderColor: d.color },
            ]}
          >
            <Text style={styles.checkText}>{checked.has(e.itemKey) ? '' : '○'}</Text>
          </View>
          <Text style={[styles.itemText, checked.has(e.itemKey) && styles.itemTextDone]}>
            {t(e.itemKey)}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.tip}>
        <Text style={styles.tipEmoji}>💡</Text>
        <Text style={styles.tipText}>{t(d.tipKey)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  tb: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tbe: { fontSize: 20 },
  tbn: { fontSize: 10, fontWeight: '600', color: '#6b7280', marginTop: 2 },
  progress: { marginBottom: 16 },
  pt: { fontSize: 14, fontWeight: '600', color: '#0891b2', marginBottom: 6 },
  bar: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4 },
  fill: { height: 8, borderRadius: 4 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
  },
  itemDone: { backgroundColor: '#f0fdf4' },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontSize: 12, color: '#6b7280' },
  itemText: { fontSize: 14, color: '#111827' },
  itemTextDone: { textDecorationLine: 'line-through', color: '#9ca3af' },
  tip: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  tipEmoji: { fontSize: 20 },
  tipText: { fontSize: 13, color: '#374151', flex: 1, textAlign: 'right', lineHeight: 20 },
});
