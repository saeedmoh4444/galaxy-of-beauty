// Web shim: react-native-webrtc has no web implementation — its web entry
// calls requireNativeComponent, which react-native-web 0.21 removed, so
// evaluating it crashes the entire web preview at import time. Video calls
// are a native-only feature; VideoRoomScreen checks RTCPeerConnection and
// renders the "session unavailable" state instead. All bindings are null so
// any accidental use fails loudly rather than silently.
export const RTCPeerConnection = null;
export const RTCView = null;
export const mediaDevices = null;
export const RTCSessionDescription = null;
export const RTCIceCandidate = null;
export const MediaStream = null;
