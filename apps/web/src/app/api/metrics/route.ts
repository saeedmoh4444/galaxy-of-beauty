/**
 * GET /api/metrics — Prometheus metrics endpoint.
 * Scraped by Prometheus every 15s in production.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@galaxy/db';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const metrics: string[] = [];

  // ── Process metrics ──
  metrics.push('# HELP process_uptime_seconds Process uptime in seconds');
  metrics.push('# TYPE process_uptime_seconds gauge');
  metrics.push(`process_uptime_seconds ${Math.round(process.uptime())}`);

  metrics.push('# HELP nodejs_heap_used_bytes Node.js heap used');
  metrics.push('# TYPE nodejs_heap_used_bytes gauge');
  metrics.push(`nodejs_heap_used_bytes ${process.memoryUsage().heapUsed}`);

  // ── Business metrics ──
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [bookingsToday, activeCustomers] = await Promise.all([
      prisma.booking.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          updatedAt: { gte: new Date(Date.now() - 7 * 86400000) },
        },
      }),
    ]);

    metrics.push('# HELP bookings_created_total Bookings today');
    metrics.push('# TYPE bookings_created_total gauge');
    metrics.push(`bookings_created_total ${bookingsToday}`);

    metrics.push('# HELP active_users Active users (7 days)');
    metrics.push('# TYPE active_users gauge');
    metrics.push(`active_users ${activeCustomers}`);
  } catch {
    // DB unavailable — skip business metrics
  }

  return new NextResponse(metrics.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; version=0.0.4' },
  });
}
