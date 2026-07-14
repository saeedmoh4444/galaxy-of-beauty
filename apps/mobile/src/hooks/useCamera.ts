import { useState, useCallback } from 'react';

interface CameraResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

export function useCamera() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestPermission = useCallback(async () => {
    setHasPermission(false); // Stub: use expo-camera in production
  }, []);

  const takePhoto = useCallback(async (): Promise<CameraResult | null> => {
    return null; // Stub: use expo-camera CameraView ref
  }, []);

  return { hasPermission, requestPermission, takePhoto };
}
