import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';

const CATEGORIES = [
  { key: 'hair', emoji: '‍️', name: 'الشعر', budget: 200, color: '#ec4899' },
  { key: 'skin', emoji: '', name: 'البشرة', budget: 300, color: '#8b5cf6' },
  { key: 'nails', emoji: '', name: 'الأظافر', budget: 100, color: '#f59e0b' },
  { key: 'makeup', emoji: '', name: 'المكياج', budget: 150, color: '#db2777' },
  { key: 'spa', emoji: '‍️', name: 'السبا', budget: 250, color: '#059669' },
  { key: 'products', emoji: '', name: 'منتجات', budget: 200, color: '#0891b2' },
];

export default function BeautyBudgetPlannerScreen(): JSX.Element {
  const { t } = useLocale();
  const [monthly] = useState<Record<string, number>>({});
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const categoryLabels: Record<string, string> = {
    hair: t('beautyBudgetPlanner.cat-hair'),
    skin: t('beautyBudgetPlanner.cat-skin'),
    nails: t('beautyBudgetPlanner.cat-nails'),
    makeup: t('beautyBudgetPlanner.cat-makeup'),
    spa: t('beautyBudgetPlanner.cat-spa'),
    products: t('beautyBudgetPlanner.cat-products'),
  };

  const totalBudget = CATEGORIES.reduce((sum, c) => sum + c.budget, 0);
  const allocated = Object.values(monthly).reduce((s, v) => s + v, 0);
  const remaining = totalBudget - allocated;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{t('beautyBudgetPlanner.title')}</Text>
      <Text style={styles.sub}>{t('beautyBudgetPlanner.subtitle')}</Text>

      <View style={styles.summaryRow}>
        <View style={[styles.summary, { backgroundColor: '#fef3c7' }]}>
          <Text style={styles.sv}>{totalBudget.toLocaleString()}</Text>
          <Text style={styles.sl}>{t('beautyBudgetPlanner.budget')}</Text>
        </View>
        <View style={[styles.summary, { backgroundColor: '#dcfce7' }]}>
          <Text style={[styles.sv, { color: '#059669' }]}>{allocated.toLocaleString()}</Text>
          <Text style={styles.sl}>{t('beautyBudgetPlanner.allocated')}</Text>
        </View>
        <View style={[styles.summary, { backgroundColor: '#dbeafe' }]}>
          <Text style={[styles.sv, { color: '#2563eb' }]}>{remaining.toLocaleString()}</Text>
          <Text style={styles.sl}>{t('beautyBudgetPlanner.remaining')}</Text>
        </View>
      </View>

      <Text style={styles.st}>{t('beautyBudgetPlanner.categories')}</Text>
      {CATEGORIES.map((c) => {
        const pct = Math.min(100, Math.round(((monthly[c.key] ?? 0) / c.budget) * 100));
        const isOver = (monthly[c.key] ?? 0) > c.budget;
        return (
          <TouchableOpacity
            key={c.key}
            onPress={() => setSelectedCat(c.key)}
            style={[styles.cat, selectedCat === c.key && { borderColor: c.color }]}
          >
            <Text style={styles.ce}>{c.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cn}>{categoryLabels[c.key] ?? c.name}</Text>
              <Text style={styles.cb}>
                {t('beautyBudgetPlanner.cat-budget', { budget: c.budget.toLocaleString() })}
              </Text>
              <View style={styles.bar}>
                <View
                  style={[
                    styles.fill,
                    { width: `${pct}%`, backgroundColor: isOver ? '#dc2626' : c.color },
                  ]}
                />
              </View>
            </View>
            <Text style={[styles.cp, isOver && { color: '#dc2626' }]}>
              {t('beautyBudgetPlanner.amount', { value: (monthly[c.key] ?? 0).toLocaleString() })}
            </Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.bt}>{t('beautyBudgetPlanner.save')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  summary: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  sv: { fontSize: 20, fontWeight: '800', color: '#111827' },
  sl: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  cat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  ce: { fontSize: 28 },
  cn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  cb: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  bar: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, marginTop: 8 },
  fill: { height: 6, borderRadius: 3 },
  cp: { fontSize: 14, fontWeight: '700', color: '#7c3aed' },
  btn: {
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  bt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
