import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { localize } from '@galaxy/shared';

const LEVELS: Record<string, { color: string }> = {
  beginner: { color: '#10b981' },
  intermediate: { color: '#f59e0b' },
  advanced: { color: '#ef4444' },
};

interface CourseItem {
  id?: number;
  emoji?: string;
  titleAr?: string;
  descAr?: string;
  instructor?: string;
  lessons?: number;
  rating?: number;
  level?: string;
}

interface MyCourseItem {
  courseId?: number;
  course?: { titleJson?: { ar?: string; en?: string } };
}

export default function BeautyCoursesScreen(): JSX.Element {
  const { locale, t } = useLocale();
  const isAuthed = useAuthState();
  const levelLabels: Record<string, string> = {
    beginner: t('beautyCourses.level-beginner'),
    intermediate: t('beautyCourses.level-intermediate'),
    advanced: t('beautyCourses.level-advanced'),
  };
  const coursesQ = trpc.beautyCourses.list.useQuery();
  const myCoursesQ = trpc.beautyCourses.myCourses.useQuery(undefined, { enabled: isAuthed });
  const [enrolled, setEnrolled] = useState<number[]>([]);

  const enrollMut = trpc.beautyCourses.enroll.useMutation();
  const handleEnroll = async (courseId: number) => {
    try {
      await enrollMut.mutateAsync({ courseId });
      setEnrolled((prev) => [...prev, courseId]);
    } catch {
      /* noop */
    }
  };

  if (coursesQ.isLoading) return <SkeletonList count={4} />;
  if (coursesQ.isError)
    return (
      <ErrorAlert message={t('beautyCourses.load-error')} onRetry={() => coursesQ.refetch()} />
    );

  const items = (coursesQ.data as CourseItem[] | undefined) ?? [];
  const myItems = (myCoursesQ.data as MyCourseItem[] | undefined) ?? [];

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl
          refreshing={coursesQ.isRefetching}
          onRefresh={() => coursesQ.refetch()}
          colors={['#db2777']}
        />
      }
    >
      <Text style={s.t}>{t('beautyCourses.title')}</Text>
      <Text style={s.sub}>{t('beautyCourses.subtitle')}</Text>

      {myItems.length > 0 && (
        <View
          style={{ marginBottom: 16, backgroundColor: '#ecfdf5', borderRadius: 12, padding: 12 }}
        >
          <Text style={{ fontWeight: '700', color: '#059669', marginBottom: 8 }}>
            {t('beautyCourses.my-courses', { count: myItems.length })}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {myItems.map((c, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: '#d1fae5',
                  borderRadius: 16,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ fontSize: 12, color: '#047857' }}>
                  {c.course?.titleJson
                    ? localize(c.course.titleJson, locale)
                    : t('beautyCourses.course-fallback', { id: c.courseId ?? 0 })}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {items.map((c) => {
        const isEnrolled = enrolled.includes(c.id ?? 0) || myItems.some((m) => m.courseId === c.id);
        const level = LEVELS[c.level ?? ''] ?? LEVELS['beginner']!;
        return (
          <View key={c.id} style={s.card}>
            <Text style={{ fontSize: 40 }}>{c.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.cTitle}>{c.titleAr}</Text>
              <Text style={s.cDesc}>{c.descAr}</Text>
              <View style={s.tags}>
                <Text style={{ fontSize: 11, color: '#6b7280' }}>‍ {c.instructor}</Text>
                <Text style={{ fontSize: 11, color: '#6b7280' }}>
                  {t('beautyCourses.lessons', { lessons: c.lessons ?? 0 })}
                </Text>
                <Text style={{ fontSize: 11, color: '#6b7280' }}>{c.rating}</Text>
                <View
                  style={{
                    backgroundColor: level.color + '20',
                    borderRadius: 8,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ fontSize: 10, color: level.color, fontWeight: '600' }}>
                    {levelLabels[c.level ?? 'beginner']}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleEnroll(c.id ?? 0)}
                disabled={isEnrolled}
                style={[s.btn, isEnrolled && { backgroundColor: '#d1fae5' }]}
              >
                <Text style={[s.btnText, isEnrolled && { color: '#047857' }]}>
                  {isEnrolled ? t('beautyCourses.enrolled') : t('beautyCourses.enroll-now')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  cTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  btn: {
    backgroundColor: '#db2777',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
