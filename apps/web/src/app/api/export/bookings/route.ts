/**
 * GET /api/export/bookings — CSV export for admin reports.
 * Exports bookings with optional date range and status filter.
 *
 * Query params:
 *   status   — filter by booking status (optional)
 *   from     — start date ISO string (optional)
 *   to       — end date ISO string (optional)
 *   format   — 'csv' (default) or 'json'
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@galaxy/db';
import { verifyAccessToken } from '@galaxy/api';

export const dynamic = 'force-dynamic';

function escapeCsv(value: unknown): string {
  const s = String(value ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  // Auth: verify JWT token and check for ADMIN role
  const token = request.cookies.get('gob_access')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (from || to) {
    where.createdAt = {};
    if (from) (where.createdAt as Record<string, unknown>).gte = new Date(from);
    if (to) (where.createdAt as Record<string, unknown>).lte = new Date(to);
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 10_000, // export limit
  });

  // CSV format
  const headers = [
    'ID', 'Booking Code', 'Status', 'Customer ID', 'Technician ID',
    'Service ID', 'Total Amount', 'Platform Fee', 'Start At', 'End At',
    'Created At', 'Notes',
  ];

  const rows = bookings.map((b) => [
    b.id, b.bookingCode, b.status, b.customerId, b.technicianId,
    b.serviceId, Number(b.totalAmount), Number(b.platformFee),
    b.startAt?.toISOString(), b.endAt?.toISOString(),
    b.createdAt.toISOString(), b.notes ?? '',
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bookings-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
