import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useState } from 'react';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

const CATS: Record<string, string> = {
  hair: '‍️ شعر',
  nails: ' أظافر',
  skincare: ' بشرة',
  makeup: ' مكياج',
  body: ' جسم',
  other: ' أخرى',
};
const INTERVALS = [7, 14, 30, 60, 90];

interface BeautyReminder {
  id: number;
  title?: string;
  category?: string;
  nextDate?: string;
  intervalDays?: number;
}

export default function BeautyRemindersScreen(): JSX.Element {
  const { locale, t } = useLocale();
  const q = trpc.beautyReminders.myReminders.useQuery();
  const catLabels: Record<string, string> = {
    hair: t('beautyReminders.cat-hair'),
    nails: t('beautyReminders.cat-nails'),
    skincare: t('beautyReminders.cat-skincare'),
    makeup: t('beautyReminders.cat-makeup'),
    body: t('beautyReminders.cat-body'),
    other: t('beautyReminders.cat-other'),
  };
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('hair');
  const [interval, setInterval] = useState(30);
  const [showForm, setShowForm] = useState(false);

  const createMut = trpc.beautyReminders.create.useMutation({
    onSuccess: () => {
      setTitle('');
      setShowForm(false);
      void q.refetch();
    },
  });
  const completeMut = trpc.beautyReminders.complete.useMutation({
    onSuccess: () => {
      void q.refetch();
    },
  });
  const deleteMut = trpc.beautyReminders.delete.useMutation({
    onSuccess: () => {
      void q.refetch();
    },
  });

  const handleCreate = () => {
    if (!title) return;
    createMut.mutate({
      title,
      category: cat as 'makeup' | 'hair' | 'nails' | 'skincare' | 'body' | 'other',
      intervalDays: interval,
    });
  };
  const handleComplete = (id: number) => {
    completeMut.mutate({ id });
  };
  const handleDelete = (id: number) => {
    deleteMut.mutate({ id });
  };

  if (q.isLoading) return <SkeletonList count={3} />;
  if (q.isError)
    return <ErrorAlert message={t('beautyReminders.load-error')} onRetry={() => q.refetch()} />;

  const reminders = (q.data ?? []) as unknown as BeautyReminder[];
  const overdue = reminders.filter((r) => new Date(r.nextDate ?? '') < new Date());
  const upcoming = reminders.filter((r) => new Date(r.nextDate ?? '') >= new Date());

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#db2777']}
        />
      }
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <View>
          <Text style={s.t}>{t('beautyReminders.title')}</Text>
          <Text style={s.sub}>{t('beautyReminders.subtitle')}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowForm(!showForm)}
          style={{
            backgroundColor: '#db2777',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>
            {showForm ? '' : t('beautyReminders.add')}
          </Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
            gap: 10,
          }}
        >
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('beautyReminders.name-placeholder')}
            style={s.inp}
            placeholderTextColor="#9ca3af"
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(CATS).map(([k]) => (
              <TouchableOpacity
                key={k}
                onPress={() => setCat(k)}
                style={[s.chip, cat === k && { backgroundColor: '#db2777' }]}
              >
                <Text style={[s.chipText, cat === k && { color: '#fff' }]}>
                  {catLabels[k] ?? ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {INTERVALS.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setInterval(d)}
                style={[s.chip, interval === d && { backgroundColor: '#db2777' }]}
              >
                <Text style={[s.chipText, interval === d && { color: '#fff' }]}>
                  {t('beautyReminders.every-days', { days: d })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={handleCreate} style={s.btn}>
            <Text style={s.btnText}>{t('beautyReminders.save')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {reminders.length === 0 && (
        <View style={{ alignItems: 'center', padding: 30 }}>
          <Text style={{ fontSize: 40 }}></Text>
          <Text style={{ color: '#6b7280', marginTop: 8 }}>{t('beautyReminders.empty')}</Text>
        </View>
      )}

      {overdue.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: '700', color: '#ef4444', fontSize: 15, marginBottom: 8 }}>
            {t('beautyReminders.overdue')}
          </Text>
          {overdue.map((r) => (
            <View
              key={r.id}
              style={[s.remCard, { borderColor: '#fca5a5', backgroundColor: '#fef2f2' }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600' }}>{r.title}</Text>
                <Text style={{ fontSize: 11, color: '#ef4444' }}>
                  {t('beautyReminders.was-due', {
                    date: new Date(r.nextDate ?? '').toLocaleDateString(
                      locale === 'ar' ? 'ar-SA' : 'en-US',
                    ),
                  })}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleComplete(r.id)} style={s.smBtn}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                  {t('beautyReminders.done')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(r.id)}>
                <Text style={{ color: '#ef4444', fontSize: 18, marginLeft: 6 }}></Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {upcoming.length > 0 && (
        <View>
          <Text style={{ fontWeight: '700', color: '#111827', fontSize: 15, marginBottom: 8 }}>
            {t('beautyReminders.upcoming')}
          </Text>
          {upcoming.map((r) => (
            <View key={r.id} style={s.remCard}>
              <Text style={{ fontSize: 28 }}>{catLabels[r.category ?? ''] ?? ''}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600' }}>{r.title}</Text>
                <Text style={{ fontSize: 11, color: '#6b7280' }}>
                  {t('beautyReminders.due-interval', {
                    date: new Date(r.nextDate ?? '').toLocaleDateString(
                      locale === 'ar' ? 'ar-SA' : 'en-US',
                    ),
                    days: r.intervalDays ?? 0,
                  })}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(r.id)}>
                <Text style={{ color: '#ef4444', fontSize: 18 }}></Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingBottom: 40 },
  t: { fontSize: 22, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  inp: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    textAlign: 'right',
  },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f3f4f6' },
  chipText: { fontSize: 12, color: '#374151' },
  btn: { backgroundColor: '#db2777', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  smBtn: { backgroundColor: '#059669', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  remCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
});
