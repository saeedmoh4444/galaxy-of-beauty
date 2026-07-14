import { useState, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';

interface CameraResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

export function useCamera() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
  const cameraRef = useRef<unknown>(null);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const Camera = require('expo-camera');

      const { status } = await Camera.requestCameraPermissionsAsync?.() || { status: 'denied' };

      const granted = status === 'granted';
      setHasPermission(granted);
      setIsReady(granted);

      if (!granted && Platform.OS !== 'web') {
        Alert.alert(
          'صلاحية الكاميرا مطلوبة',
          'يرجى السماح بالوصول إلى الكاميرا من إعدادات الجهاز لاستخدام هذه الميزة.',
        );
      }

      return granted;
    } catch {
      // expo-camera not installed
      setHasPermission(false);
      setIsReady(false);
      return false;
    }
  }, []);

  const takePhoto = useCallback(async (): Promise<CameraResult | null> => {
    if (!hasPermission) {
      await requestPermission();
      if (!hasPermission) return null;
    }

    try {
      if (!cameraRef.current) {
        // Camera component not mounted — return simulated result for dev
        return null;
      }

      const takePic = (cameraRef.current as Record<string, (opts?: Record<string, unknown>) => Promise<{ uri: string; width: number; height: number; base64?: string }>>).takePictureAsync;
      if (!takePic) return null;

      const photo = await takePic({
        quality: 0.8,
        base64: true,
        skipProcessing: false,
      });

      if (!photo) return null;

      return {
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        base64: photo.base64,
      };
    } catch {
      return null;
    }
  }, [hasPermission, requestPermission]);

  const getCameraRef = useCallback((ref: unknown) => {
    cameraRef.current = ref;
  }, []);

  return { hasPermission, isReady, requestPermission, takePhoto, getCameraRef };
}
