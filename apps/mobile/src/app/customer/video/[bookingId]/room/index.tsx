import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  RTCSessionDescription,
  RTCIceCandidate,
  MediaStream as RTCMediaStream,
} from 'react-native-webrtc';
import { SOCKET_DEFAULT_PORT } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { getSocketToken } from '@/hooks/useSocket';

// A4b — real WebRTC call on mobile. Same signaling contract as the web
// room (video:join/signal/leave over the authenticated socket server);
// media flows peer-to-peer. STUN only until a TURN relay is provisioned.

const SOCKET_URL =
  (typeof process !== 'undefined' &&
    (process.env as Record<string, string>)['EXPO_PUBLIC_SOCKET_URL']) ||
  `http://localhost:${SOCKET_DEFAULT_PORT}`;

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

type VideoSignal = {
  from: number;
  to: number | null;
  kind: 'offer' | 'answer' | 'ice';
  payload: unknown;
};

export default function VideoRoomScreen() {
  const { t } = useLocale();
  const router = useRouter();
  const { bookingId, room } = useLocalSearchParams<{ bookingId: string; room: string }>();

  const [status, setStatus] = useState<'connecting' | 'waiting' | 'live' | 'ended'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [remoteStreamUrl, setRemoteStreamUrl] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<RTCMediaStream | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const bookingIdNum = Number(bookingId);
    if (!Number.isFinite(bookingIdNum) || startedRef.current) return;
    startedRef.current = true;

    let disposed = false;
    const socket: Socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token: getSocketToken() },
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    const endCall = () => {
      if (disposed) return;
      disposed = true;
      setStatus('ended');
      socket.emit('video:leave', { bookingId: bookingIdNum });
      localStreamRef.current?.getTracks().forEach((tr) => tr.stop());
      pc.close();
      socket.disconnect();
    };

    pc.onicecandidate = (event: { candidate: { toJSON: () => unknown } | null }) => {
      if (event.candidate) {
        socket.emit('video:signal', {
          bookingId: bookingIdNum,
          kind: 'ice',
          payload: event.candidate.toJSON?.() ?? event.candidate,
        });
      }
    };
    pc.ontrack = (event: { streams: RTCMediaStream[] }) => {
      const stream = event.streams[0];
      if (stream) setRemoteStreamUrl(stream.toURL());
      setStatus('live');
    };
    pc.onconnectionstatechange = () => {
      if (
        (pc as unknown as { connectionState: string }).connectionState === 'failed' &&
        !disposed
      ) {
        setError(t('mobile.video.peer-left'));
        endCall();
      }
    };

    const createOffer = async () => {
      try {
        const offer = await pc.createOffer({});
        await pc.setLocalDescription(offer);
        socket.emit('video:signal', { bookingId: bookingIdNum, kind: 'offer', payload: offer });
      } catch {
        // caller retries on the next participant event
      }
    };

    socket.on('video:signal', async (signal: VideoSignal) => {
      try {
        if (signal.kind === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.payload as never));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('video:signal', {
            bookingId: bookingIdNum,
            to: signal.from,
            kind: 'answer',
            payload: answer,
          });
        } else if (signal.kind === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.payload as never));
        } else if (signal.kind === 'ice' && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.payload as never));
        }
      } catch {
        // stale signal — the next one will reconcile
      }
    });

    socket.on('video:participant', (info: { userId: number; joined: boolean }) => {
      if (info.joined && !disposed) void createOffer();
      if (!info.joined) {
        setError(t('mobile.video.peer-left'));
        endCall();
      }
    });

    socket.on('connect', () => {
      socket.emit(
        'video:join',
        { bookingId: bookingIdNum },
        (ack: { ok?: boolean; participants?: number; error?: string }) => {
          if (disposed) return;
          if (ack?.error) {
            setError(ack.error === 'FORBIDDEN' ? t('mobile.video.permission-denied') : ack.error);
            setStatus('ended');
            socket.disconnect();
            return;
          }
          if ((ack?.participants ?? 1) >= 2) {
            void createOffer();
          } else {
            setStatus('waiting');
          }
        },
      );
    });

    void (async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: 'user', width: 640, height: 480 },
        });
        if (disposed) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        localStreamRef.current = stream;
        stream.getTracks().forEach((tr) => pc.addTrack(tr, stream));
      } catch {
        setError(t('mobile.video.permission-denied'));
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
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((tr) => {
      tr.enabled = muted;
    });
    setMuted(!muted);
  };

  const toggleCamera = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((tr) => {
      tr.enabled = cameraOff;
    });
    setCameraOff(!cameraOff);
  };

  const leave = () => {
    socketRef.current?.emit('video:leave', { bookingId: Number(bookingId) });
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('mobile.video.title')}</Text>

      <View style={styles.card}>
        <Text style={styles.roomLabel}>{t('mobile.video.room-label')}</Text>
        <Text style={styles.roomId}>{room || t('mobile.video.unknown')}</Text>
        <Text style={styles.bookingLabel}>{t('mobile.video.booking-id', { id: bookingId })}</Text>

        <View style={styles.videoArea}>
          {remoteStreamUrl ? (
            <RTCView streamURL={remoteStreamUrl} style={styles.remoteVideo} objectFit="cover" />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Text style={styles.placeholderText}>
                {error ??
                  (status === 'waiting'
                    ? t('mobile.video.waiting-peer')
                    : t('mobile.video.connecting'))}
              </Text>
            </View>
          )}
          {localStreamRef.current && (
            <RTCView
              streamURL={localStreamRef.current.toURL()}
              style={styles.localVideo}
              objectFit="cover"
              mirror
              zOrder={1}
            />
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.ctrlBtn} onPress={toggleMute}>
            <Text style={styles.ctrlText}>
              {muted ? t('mobile.video.unmute') : t('mobile.video.mute')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctrlBtn} onPress={toggleCamera}>
            <Text style={styles.ctrlText}>
              {cameraOff ? t('mobile.video.camera-off') : t('mobile.video.camera-on')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ctrlBtn, styles.endBtn]} onPress={leave}>
            <Text style={[styles.ctrlText, styles.endText]}>{t('mobile.video.end-call')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b10', padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f4ecef',
    textAlign: 'right',
    marginBottom: 20,
  },
  card: { flex: 1 },
  roomLabel: { fontSize: 13, color: '#9ca3af', textAlign: 'right', marginBottom: 4 },
  roomId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f4ecef',
    fontFamily: 'monospace',
    textAlign: 'right',
    marginBottom: 4,
  },
  bookingLabel: { fontSize: 13, color: '#9ca3af', textAlign: 'right', marginBottom: 16 },
  videoArea: { flex: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' },
  remoteVideo: { flex: 1 },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderText: { color: '#d1d5db', fontSize: 14, textAlign: 'center' },
  localVideo: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 110,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#1f1f2b',
  },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 16 },
  ctrlBtn: {
    borderWidth: 1,
    borderColor: '#3f3f4d',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ctrlText: { color: '#d1d5db', fontSize: 13, fontWeight: '600' },
  endBtn: { backgroundColor: '#c2255c', borderColor: '#c2255c' },
  endText: { color: '#fff' },
});
