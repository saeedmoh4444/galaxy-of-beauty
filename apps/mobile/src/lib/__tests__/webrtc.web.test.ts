import { describe, expect, it } from 'vitest';
// Explicit .web extension — importing the bare module in Node resolves the
// native entry, which evaluates react-native-webrtc and crashes outside RN.
import * as webrtcWeb from '../webrtc.web';

// Regression guard: the web preview crashed at import time because
// react-native-webrtc's web entry calls requireNativeComponent, which
// react-native-web 0.21 removed. The shim must stay null-only — never
// re-export the real module here.
describe('webrtc.web shim', () => {
  it('exports null bindings so the web bundle never evaluates react-native-webrtc', () => {
    expect(webrtcWeb.RTCPeerConnection).toBeNull();
    expect(webrtcWeb.RTCView).toBeNull();
    expect(webrtcWeb.mediaDevices).toBeNull();
    expect(webrtcWeb.RTCSessionDescription).toBeNull();
    expect(webrtcWeb.RTCIceCandidate).toBeNull();
    expect(webrtcWeb.MediaStream).toBeNull();
  });
});
