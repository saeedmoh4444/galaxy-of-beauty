import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'expo-router';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { DEFAULT_PAGE_SIZE } from '@galaxy/ui';

const STATUS_TABS = ['ALL', 'REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#10b981',
  CANCELLED: '#dc2626',
  DEFAULT: '#3b82f6',
};
const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

export default function BookingsScreen(): JSX.Element {
  const router = useRouter();
  const isAuthed = useAuthState();
  const [status, setStatus] = useState<string | undefined>();
  const { locale, t } = useLocale();
  // 5.5 Mobile polish — infinite scroll via accumulated pages (the router
  // uses page-based input, so tRPC v11's cursor-only useInfiniteQuery does
  // not apply; append pages manually and reset on filter change).
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const lastKey = useRef('');
  const bookings = trpc.bookings.list.useQuery(
    { status, limit: DEFAULT_PAGE_SIZE, page },
    { enabled: isAuthed },
  );
  const pageData = bookings.data as
    { bookings?: unknown[]; totalPages?: number; page?: number } | undefined;
  useEffect(() => {
    const key = `${status ?? 'ALL'}`;
    const rows = (pageData?.bookings ?? []) as Record<string, unknown>[];
    if (key !== lastKey.current) {
      // Filter changed — reset the accumulated list.
      lastKey.current = key;
      setItems(rows);
    } else if (page === 1) {
      setItems(rows);
    } else if (pageData?.page === page && rows.length > 0) {
      setItems((prev) => [...prev, ...rows]);
    }
  }, [pageData, page, status]);
  const isLoading = bookings.isLoading && !refreshing;

  const loadMore = () => {
    if (!pageData) return;
    if ((pageData.page ?? 1) < (pageData.totalPages ?? 1) && !bookings.isFetching) {
      setPage(pageData.page! + 1);
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    void bookings.refetch().finally(() => setRefreshing(false));
  };

  const statusLabels: Record<string, string> = {
    REQUESTED: t('bookings.status-pending'),
    ACCEPTED: t('booking.status.ACCEPTED'),
    IN_PROGRESS: t('bookings.status-in-progress'),
    COMPLETED: t('booking.status.COMPLETED'),
    CANCELLED: t('booking.status.CANCELLED'),
  };

  const renderItem = ({ item }: { item: Record<string, unknown> }) => {
    const b = item;
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.code}>{b.bookingCode as string}</Text>
          <Text
            style={[
              styles.badge,
              { color: STATUS_COLORS[b.status as string] ?? STATUS_COLORS.DEFAULT },
            ]}
          >
            {statusLabels[b.status as string] ?? (b.status as string)}
          </Text>
        </View>
        <Text style={styles.date}>
          {new Date(b.startAt as string).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB')}
        </Text>
        {b.familyMember ? (
          <Text style={styles.onBehalf}>
            {t('mobile.booking.on-behalf-of', {
              name: (b.familyMember as Record<string, unknown>).name as string,
            })}
          </Text>
        ) : null}
        {(b.status === 'PAID' || b.status === 'IN_PROGRESS') && (
          <TouchableOpacity
            style={styles.videoBtn}
            onPress={() => router.push(`/customer/video/${b.id}` as never)}
          >
            <Text style={styles.videoBtnText}>{t('mobile.booking.video-call')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScreenState
      isLoading={isLoading}
      isError={bookings.isError}
      isEmpty={!items || items.length === 0}
      errorMessage={t('booking.load-error')}
      emptyTitle={t('booking.no-bookings')}
      emptyDescription={t('bookings.empty-cta')}
      onRetry={() => bookings.refetch()}
    >
      <Text style={styles.title}>{t('mobile.myBookings')}</Text>
      <View style={styles.tabs}>
        {STATUS_TABS.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => {
              setStatus(s === 'ALL' ? undefined : s);
              setPage(1);
            }}
            style={[styles.tab, (!status && s === 'ALL') || s === status ? styles.tabActive : {}]}
          >
            <Text
              style={[
                styles.tabText,
                (!status && s === 'ALL') || s === status ? styles.tabTextActive : {},
              ]}
            >
              {s === 'ALL' ? t('booking.all') : (statusLabels[s] ?? s)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || (bookings.isRefetching && page === 1)}
            onRefresh={onRefresh}
            colors={[COLORS.brand]}
            tintColor={COLORS.brand}
          />
        }
        ListFooterComponent={
          bookings.isFetching && page > 1 ? (
            <Text style={styles.footerLoading}>{t('state.loading')}</Text>
          ) : null
        }
      />
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    textAlign: 'center',
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
    justifyContent: 'center',
  },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f3f4f6' },
  tabActive: { backgroundColor: COLORS.brand },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.gray400 },
  tabTextActive: { color: COLORS.white },
  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  code: { fontSize: 14, fontWeight: '700', color: COLORS.gray900 },
  badge: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 12, color: COLORS.gray400 },
  onBehalf: { fontSize: 12, color: COLORS.brand, marginTop: 2, fontWeight: '600' },
  videoBtn: {
    marginTop: 10,
    backgroundColor: COLORS.brand,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  videoBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  footerLoading: { textAlign: 'center', color: COLORS.gray400, paddingVertical: 12, fontSize: 12 },
});
