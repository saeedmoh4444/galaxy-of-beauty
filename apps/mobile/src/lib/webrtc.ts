// Native WebRTC entry — react-native-webrtc works on iOS/Android. Metro
// resolves the web platform to webrtc.web.ts instead (platform extension):
// react-native-webrtc's web build crashes on react-native-web 0.21 (its
// requireNativeComponent was removed), so it must never be evaluated in
// the web preview. VideoRoomScreen guards on RTCPeerConnection and shows
// the "session unavailable" state when the shim is loaded.
export {
  RTCPeerConnection,
  RTCView,
  mediaDevices,
  RTCSessionDescription,
  RTCIceCandidate,
  MediaStream,
} from 'react-native-webrtc';
