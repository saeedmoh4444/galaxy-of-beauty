'use client';
import type { JSX } from 'react';

import { useParams, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VideoRoom } from '@/components/video/VideoRoom';

// A4 — technician-side WebRTC room. Shares the VideoRoom component with
// the customer room; only the dashboard layout differs.

export default function TechVideoRoomPage(): JSX.Element {
  const { bookingId } = useParams<{ bookingId: string }>();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room') || 'unknown';

  return (
    <DashboardLayout userRole="TECHNICIAN">
      <VideoRoom bookingId={bookingId} roomId={roomId} />
    </DashboardLayout>
  );
}
