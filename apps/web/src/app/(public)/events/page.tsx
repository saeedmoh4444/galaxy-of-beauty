import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { EventsClient } from './EventsClient';

export default async function EventsPage(): Promise<JSX.Element> {
  let initialEvents: unknown[] = [];

  try {
    const caller = await getServerCaller();
    initialEvents = serializeForClient(
      await (
        caller as unknown as {
          beautyEvents: { list: (input: Record<string, never>) => Promise<unknown[]> };
        }
      ).beautyEvents.list({}),
    );
  } catch {
    /* client will retry */
  }

  return <EventsClient initialEvents={initialEvents} />;
}
