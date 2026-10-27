/**
 * D1b — vendor webhook delivery (Wave D): event fan-out to subscribed,
 * active webhooks over the gob-webhooks queue (5 exponential retries).
 * Delivery failures never fail the business mutation — enqueue-and-forget.
 */
import { prisma } from '@galaxy/db';
import { getWebhooksQueue } from '../queues';

export type WebhookEventName = 'order.placed' | 'order.fulfilled' | 'stock.low';

/** Fan an event out to the vendor's subscribed webhooks. The payload MUST
 *  carry vendorId — a webhook only ever receives its own vendor's events. */
export async function enqueueWebhookEvents(
  event: WebhookEventName,
  payload: { vendorId: number } & Record<string, unknown>,
): Promise<void> {
  const webhooks = await prisma.vendorWebhook.findMany({
    where: { vendorId: payload.vendorId, isActive: true, events: { has: event } },
    select: { id: true },
  });
  if (webhooks.length === 0) return;

  const queue = getWebhooksQueue();
  if (!queue) return; // Redis down — the delivery surface degrades silently

  for (const webhook of webhooks) {
    try {
      await queue.add(
        'webhook.deliver',
        { webhookId: webhook.id, event, payload },
        { attempts: 5, backoff: { type: 'exponential', delay: 2000 } },
      );
    } catch {
      // One bad enqueue never blocks the rest.
    }
  }
}
