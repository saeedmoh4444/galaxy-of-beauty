import type { JSX } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { VideoRoomScreen } from '@/components/video/VideoRoomScreen';

// A4b — technician-side WebRTC room on mobile. Shares the VideoRoomScreen
// component with the customer room; only the route differs.

export default function TechVideoRoomScreenRoute(): JSX.Element {
  const { bookingId, room } = useLocalSearchParams<{ bookingId: string; room: string }>();
  return <VideoRoomScreen bookingId={bookingId} room={room ?? 'unknown'} />;
}
