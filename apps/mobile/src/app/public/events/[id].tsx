/**
 * Event detail (audit stage 12) — mobile had no detail route and no
 * waitlist exposure. Fetches the published event via beautyEvents.getById
 * and renders full details + capacity-aware registration: registering on
 * a full event lands on the waitlist and shows the live position.
 */
import { useState } from 'react';
import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { localize } from '@galaxy/shared';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

interface EventTypeMeta {
  labelKey: TranslationKey;
  emoji: string;
}

const ET: Record<string, EventTypeMeta> = {
  workshop: { labelKey: 'mobile.public.events.type.workshop', emoji: '🔧' },
  masterclass: { labelKey: 'mobile.public.events.type.masterclass', emoji: '🎓' },
  launch: { labelKey: 'mobile.public.events.type.launch', emoji: '🚀' },
  seasonal: { labelKey: 'mobile.public.events.type.seasonal', emoji: '🍂' },
  retreat: { labelKey: 'mobile.public.events.type.retreat', emoji: '🏝' },
  webinar: { labelKey: 'mobile.public.events.type.webinar', emoji: '💻' },
};

interface EventDetail {
  id: number;
  nameJson: { ar?: string; en?: string };
  descriptionJson: { ar?: string; en?: string } | null;
  eventType: string;
  location: string | null;
  price: string | number | null;
  maxAttendees: number | null;
  startsAt: string;
  endsAt: string;
  tier: string;
}

export default function EventDetailScreen(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);
  const { locale, t } = useLocale();
  const isAuthed = useAuthState();
  const [registerError, setRegisterError] = useState(false);

  const eventQ = trpc.beautyEvents.getById.useQuery(
    { id: eventId },
    { enabled: Number.isFinite(eventId) && eventId > 0, retry: false },
  );
  const registerMut = trpc.beautyEvents.register.useMutation({
    onError: () => setRegisterError(true),
  });

  // Waitlist exposure: shown once the user's registration is WAITLIST.
  const myRegistration = registerMut.data as { status?: string } | undefined;
  const positionQ = trpc.beautyEvents.waitlistPosition.useQuery(
    { eventId },
    { enabled: isAuthed && myRegistration?.status === 'WAITLIST' },
  );

  if (eventQ.isLoading || !Number.isFinite(eventId)) return <SkeletonList count={3} />;
  if (eventQ.isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>{t('mobile.public.events.notFound')}</Text>
        <Pressable onPress={() => eventQ.refetch()}>
          <Text style={styles.retry}>{t('button.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  const event = eventQ.data as unknown as EventDetail;
  const et = ET[event.eventType];
  const desc = event.descriptionJson ? (localize(event.descriptionJson, locale) ?? '') : '';
  const date = new Date(event.startsAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const time = `${new Date(event.startsAt).toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })} — ${new Date(event.endsAt).toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
  const price = Number(event.price) > 0 ? `${Number(event.price)} ${t('misc.sar')}` : null;
  const status = myRegistration?.status;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Pressable onPress={() => router.back()} style={styles.backRow} testID="event-back">
        <Text style={styles.backText}>←</Text>
      </Pressable>
      <Text style={styles.emoji}>{et?.emoji ?? '🎉'}</Text>
      <Text style={styles.name}>{localize(event.nameJson, locale) ?? ''}</Text>
      <Text style={styles.meta}>
        {et ? t(et.labelKey) : event.eventType} · {date}
      </Text>
      <Text style={styles.meta}>{time}</Text>
      <Text style={styles.meta}>
        📍 {event.location ?? t('mobile.public.events.online')}
        {event.maxAttendees !== null
          ? ` · ${t('mobile.public.events.attendees')}: ${event.maxAttendees}`
          : ''}
      </Text>

      {desc ? <Text style={styles.desc}>{desc}</Text> : null}

      <View style={styles.factRow}>
        <Text style={styles.factLabel}>{t('mobile.public.events.price')}</Text>
        <Text style={styles.factValue}>{price ?? t('mobile.public.events.free')}</Text>
      </View>
      {event.tier === 'VIP' ? <Text style={styles.vip}>🎁 VIP</Text> : null}

      {status === 'REGISTERED' ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{t('mobile.public.events.registered')}</Text>
        </View>
      ) : status === 'WAITLIST' ? (
        <View style={styles.waitBox}>
          <Text style={styles.waitText}>{t('mobile.public.events.waitlisted')}</Text>
          {positionQ.data && Number(positionQ.data.position) > 0 ? (
            <Text style={styles.waitText}>
              {t('mobile.public.events.waitlistPosition', {
                position: String(positionQ.data.position),
              })}
            </Text>
          ) : null}
        </View>
      ) : (
        <Pressable
          testID="event-register"
          style={styles.registerBtn}
          disabled={registerMut.isPending}
          onPress={() => {
            if (!isAuthed) return;
            setRegisterError(false);
            registerMut.mutate({ eventId });
          }}
        >
          <Text style={styles.registerText}>
            {isAuthed
              ? t('mobile.public.events.register')
              : t('mobile.public.events.loginToRegister')}
          </Text>
        </Pressable>
      )}
      {registerError ? <Text style={styles.errorText}>{t('state.error')}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  backRow: { alignSelf: 'flex-start', marginBottom: 12 },
  backText: { fontSize: 22, color: '#7c3aed', fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  notFound: { fontSize: 15, color: '#6b7280', textAlign: 'center' },
  retry: { fontSize: 14, fontWeight: '700', color: '#7c3aed', marginTop: 10 },
  emoji: { fontSize: 56, textAlign: 'center' },
  name: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginTop: 8 },
  meta: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginTop: 6 },
  desc: { fontSize: 14, color: '#374151', lineHeight: 22, marginTop: 16 },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  factLabel: { fontSize: 13, color: '#6b7280' },
  factValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  vip: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  registerBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  successBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  successText: { color: '#166534', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  waitBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  waitText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  errorText: { color: '#dc2626', fontSize: 13, textAlign: 'center', marginTop: 10 },
});
