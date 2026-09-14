'use client';
import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Card, Button } from '@galaxy/ui';
import { io, type Socket } from 'socket.io-client';
import { SOCKET_DEFAULT_PORT } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

// A4 — real WebRTC call between the booking's customer and technician.
// Shared by the customer (/video/...) and technician (/tech/video/...)
// rooms. Signaling rides the existing authenticated socket server
// (video:* events); media flows peer-to-peer via RTCPeerConnection. ICE
// servers (STUN/TURN) are provided by the server in the video:join ack —
// the constant below is only a fallback.

const SOCKET_URL =
  typeof window !== 'undefined'
    ? process.env['NEXT_PUBLIC_SOCKET_URL'] ||
      `${window.location.protocol}//${window.location.hostname}:${SOCKET_DEFAULT_PORT}`
    : '';

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

type VideoSignal = {
  from: number;
  to: number | null;
  kind: 'offer' | 'answer' | 'ice';
  payload: unknown;
};

export function VideoRoom({
  bookingId,
  roomId,
}: {
  bookingId: string;
  roomId: string;
}): JSX.Element {
  const { t } = useLocale();

  const [status, setStatus] = useState<'connecting' | 'waiting' | 'live' | 'ended'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const bookingIdNum = Number(bookingId);
    if (!Number.isFinite(bookingIdNum) || startedRef.current) return;
    startedRef.current = true;

    let disposed = false;
    const socket: Socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    const endCall = () => {
      if (disposed) return;
      disposed = true;
      setStatus('ended');
      socket.emit('video:leave', { bookingId: bookingIdNum });
      pcRef.current?.getSenders().forEach((s) => s.track?.stop());
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      pcRef.current?.close();
      socket.disconnect();
    };

    const attachLocalTracks = (pc: RTCPeerConnection) => {
      const stream = streamRef.current;
      if (!stream) return;
      stream.getTracks().forEach((tr) => pc.addTrack(tr, stream));
    };

    // The peer connection is created only once the server hands us the ICE
    // config (STUN/TURN) in the video:join ack.
    const startPeer = (iceServers: RTCIceServer[]) => {
      if (disposed || pcRef.current) return;
      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('video:signal', {
            bookingId: bookingIdNum,
            kind: 'ice',
            payload: event.candidate.toJSON(),
          });
        }
      };
      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setStatus('live');
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' && !disposed) {
          setError(t('videoRoom.peerLeft'));
          endCall();
        }
      };

      attachLocalTracks(pc);
    };

    const createOffer = async () => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('video:signal', {
          bookingId: bookingIdNum,
          kind: 'offer',
          payload: offer,
        });
      } catch (e) {
        console.error('[VideoRoom] offer failed:', e);
      }
    };

    socket.on('video:signal', async (signal: VideoSignal) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        if (signal.kind === 'offer') {
          await pc.setRemoteDescription(
            new RTCSessionDescription(signal.payload as RTCSessionDescriptionInit),
          );
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('video:signal', {
            bookingId: bookingIdNum,
            to: signal.from,
            kind: 'answer',
            payload: answer,
          });
        } else if (signal.kind === 'answer') {
          await pc.setRemoteDescription(
            new RTCSessionDescription(signal.payload as RTCSessionDescriptionInit),
          );
        } else if (signal.kind === 'ice' && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.payload as RTCIceCandidateInit));
        }
      } catch (e) {
        console.error('[VideoRoom] signal handling failed:', e);
      }
    });

    socket.on('video:participant', (info: { userId: number; joined: boolean }) => {
      if (info.joined && !disposed) {
        void createOffer();
      }
      if (!info.joined) {
        setError(t('videoRoom.peerLeft'));
        endCall();
      }
    });

    socket.on('connect', () => {
      socket.emit(
        'video:join',
        { bookingId: bookingIdNum },
        (ack: {
          ok?: boolean;
          participants?: number;
          error?: string;
          iceServers?: RTCIceServer[];
        }) => {
          if (disposed) return;
          if (ack?.error) {
            setError(ack.error === 'FORBIDDEN' ? t('videoRoom.permissionDenied') : ack.error);
            setStatus('ended');
            socket.disconnect();
            return;
          }
          startPeer(ack?.iceServers ?? DEFAULT_ICE_SERVERS);
          // The second participant to join initiates the offer.
          if ((ack?.participants ?? 1) >= 2) {
            void createOffer();
          } else {
            setStatus('waiting');
          }
        },
      );
    });

    // Local media
    void (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (disposed) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        if (pcRef.current) {
          attachLocalTracks(pcRef.current);
        }
      } catch {
        setError(t('videoRoom.permissionDenied'));
        setStatus('ended');
        socket.disconnect();
      }
    })();

    return () => {
      endCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const toggleMute = () => {
    const stream = streamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((tr) => {
      tr.enabled = muted;
    });
    setMuted(!muted);
  };

  const toggleCamera = () => {
    const stream = streamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((tr) => {
      tr.enabled = cameraOff;
    });
    setCameraOff(!cameraOff);
  };

  const leave = () => {
    socketRef.current?.emit('video:leave', { bookingId: Number(bookingId) });
    window.history.back();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary">{t('videoRoom.title')}</h1>

      <Card padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            {t('videoRoom.roomNumber')}{' '}
            <code className="rounded bg-surface-muted px-2 py-1 text-xs dark:bg-gray-800">
              {roomId}
            </code>
          </p>
          <Button variant="outline" onClick={() => navigator.clipboard.writeText(roomId)}>
            {t('videoRoom.copyRoomNumber')}
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-xl bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-56 w-full scale-x-[-1] object-cover"
            />
            <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
              {t('videoRoom.booking')} <span className="font-mono">{bookingId}</span>
            </span>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-black">
            {/* Live WebRTC stream — captions/track elements don't apply */}
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video ref={remoteVideoRef} autoPlay playsInline className="h-56 w-full object-cover" />
            {status !== 'live' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <p className="px-4 text-center text-sm text-white">
                  {error ??
                    (status === 'waiting' ? t('videoRoom.waitingPeer') : t('videoRoom.connecting'))}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={toggleMute}>
            {muted ? t('videoRoom.unmute') : t('videoRoom.mute')}
          </Button>
          <Button variant="outline" onClick={toggleCamera}>
            {cameraOff ? t('videoRoom.cameraOff') : t('videoRoom.cameraOn')}
          </Button>
          <Button onClick={leave}>{t('videoRoom.endCall')}</Button>
        </div>
      </Card>
    </div>
  );
}
