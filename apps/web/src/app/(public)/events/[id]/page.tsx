import type { JSX } from 'react';
import { notFound } from 'next/navigation';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { EventDetailClient, type EventDetail } from './EventDetailClient';

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId)) notFound();

  let event: EventDetail | null = null;
  try {
    const caller = await getServerCaller();
    const events = await (
      caller as unknown as {
        beautyEvents: { list: (input: Record<string, never>) => Promise<Array<{ id: number }>> };
      }
    ).beautyEvents.list({});
    event = serializeForClient(events.find((e) => e.id === eventId) ?? null) as EventDetail | null;
  } catch {
    /* client will retry */
  }

  if (!event) notFound();

  return <EventDetailClient event={event} />;
}
